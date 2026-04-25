import type { ReactNode } from 'react';

export type NetworkContextType = {
  isOnline: boolean;
  isNetworkChecked: boolean;
  isApiReachable: boolean;
};

export interface NetworkProviderProps {
  children: ReactNode;
}
