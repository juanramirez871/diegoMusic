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

const API_PROBE_URL = (process.env.EXPO_PUBLIC_API_URL || 'http://127.0.0.1:3000/api') + '/health';
const API_PROBE_TIMEOUT_MS = 4000;

const probeApi = async (): Promise<boolean> => {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), API_PROBE_TIMEOUT_MS);
  try {
    await fetch(API_PROBE_URL, { signal: controller.signal });
    return true;
  }
  catch {
    return false;
  }
  finally {
    clearTimeout(timeoutId);
  }
};

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

type NetworkContextType = { isOnline: boolean; isNetworkChecked: boolean; isApiReachable: boolean };
const NetworkContext = createContext<NetworkContextType>({ isOnline: true, isNetworkChecked: false, isApiReachable: true });
interface Props { children: ReactNode }

export function NetworkProvider({ children }: Props) {

  const [isOnline, setIsOnline] = useState(true);
  const [isNetworkChecked, setIsNetworkChecked] = useState(false);
  const [isApiReachable, setIsApiReachable] = useState(true);
  const mountedRef = useRef(true);
  const apiProbeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const checkApi = useCallback(async () => {
    const reachable = await probeApi();
    if (mountedRef.current) {
      setIsApiReachable(reachable);
      if (!reachable) apiProbeTimerRef.current = setTimeout(checkApi, 10000);
    }
  }, []);
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
    if (state.isConnected === false) {
      stopRetry();
      setIsOnline(false);
      setIsNetworkChecked(true);
      setIsApiReachable(false);
      return;
    }

    if (state.isInternetReachable === true) {
      stopRetry();
      setIsOnline(true);
      setIsNetworkChecked(true);
      checkApi();
      return;
    }

    setIsNetworkChecked(false);
    startRetryUntilReachable();
    checkApi();

  }, [stopRetry, startRetryUntilReachable, checkApi]);

  useEffect(() => {
    mountedRef.current = true;
    checkApi();
    NetInfo.fetch()
      .then((state) => {
        if (!mountedRef.current) return;
        handleNetworkChange(state);
      })
      .catch(() => {
        if (mountedRef.current) {
          setIsOnline(false);
          setIsNetworkChecked(true);
          setIsApiReachable(false);
        }
      });

    const unsubscribe = NetInfo.addEventListener(handleNetworkChange);

    return () => {
      mountedRef.current = false;
      stopRetry();
      if (apiProbeTimerRef.current) clearTimeout(apiProbeTimerRef.current);
      unsubscribe();
    };
  }, [handleNetworkChange, stopRetry, checkApi]);

  return (
    <NetworkContext.Provider value={{ isOnline, isNetworkChecked, isApiReachable }}>
      {children}
    </NetworkContext.Provider>
  );
}

export function useNetwork(): NetworkContextType {
  return useContext(NetworkContext);
}
