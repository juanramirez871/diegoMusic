import NetInfo, { NetInfoState } from "@react-native-community/netinfo";
import React, {
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";

NetInfo.configure({
  reachabilityUrl: "https://clients3.google.com/generate_204",
  reachabilityTest: async (response) => response.status === 204,
  reachabilityLongTimeout: 60 * 1000,
  reachabilityShortTimeout: 5 * 1000,
  reachabilityRequestTimeout: 15 * 1000,
  reachabilityShouldRun: () => true,
  shouldFetchWiFiSSID: false,
  useNativeReachability: false,
});

type NetworkContextType = { isOnline: boolean; isNetworkChecked: boolean };
const NetworkContext = createContext<NetworkContextType>({ isOnline: true, isNetworkChecked: false });
interface Props { children: ReactNode }

export function NetworkProvider({ children }: Props) {

  const [isOnline, setIsOnline] = useState(true);
  const [isNetworkChecked, setIsNetworkChecked] = useState(false);
  const mountedRef = useRef(true);
  const retryRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const stopRetry = useCallback(() => {
    if (retryRef.current) {
      clearInterval(retryRef.current);
      retryRef.current = null;
    }
  }, []);

  const startRetryUntilReachable = useCallback(() => {
    stopRetry();
    retryRef.current = setInterval(async () => {
      if (!mountedRef.current) return stopRetry();

      const fresh = await NetInfo.fetch();

      if (!fresh.isConnected) {
        setIsOnline(false);
        stopRetry();
        return;
      }

      if (fresh.isInternetReachable === true) {
        setIsOnline(true);
        stopRetry();
      }
    }, 2000);
  }, [stopRetry]);

  const handleNetworkChange = useCallback((state: NetInfoState) => {

    if (!mountedRef.current) return;
    setIsNetworkChecked(true);
    if (!state.isConnected) {
      stopRetry();
      setIsOnline(false);
      return;
    }
    if (state.isInternetReachable === true) {
      stopRetry();
      setIsOnline(true);
      return;
    }

    setIsOnline(false);
    startRetryUntilReachable();

  }, [stopRetry, startRetryUntilReachable]);

  useEffect(() => {
    mountedRef.current = true;
    NetInfo.fetch()
      .then((state) => {
        if (!mountedRef.current) return;
        handleNetworkChange(state);
      })
      .catch(() => {
        if (mountedRef.current) setIsOnline(false);
      });

    const unsubscribe = NetInfo.addEventListener(handleNetworkChange);

    return () => {
      mountedRef.current = false;
      stopRetry();
      unsubscribe();
    };
  }, [handleNetworkChange, stopRetry]);

  return (
    <NetworkContext.Provider value={{ isOnline, isNetworkChecked }}>
      {children}
    </NetworkContext.Provider>
  );
}

export function useNetwork(): NetworkContextType {
  return useContext(NetworkContext);
}