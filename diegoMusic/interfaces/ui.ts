import type { Dispatch, SetStateAction } from 'react';
import type { Animated, DimensionValue, ViewStyle } from 'react-native';

export interface OfflineViewProps {
  onRetry?: () => Promise<boolean>;
  title?: string;
  message?: string;
}

export interface StatsOverlayProps {
  isVisible: boolean;
  onClose: () => void;
  fadeAnim: Animated.Value;
}

export interface HistoryItem {
  id: string;
  text: string;
}

export interface SearchOverlayProps {
  isVisible: boolean;
  onClose: () => void;
  fadeAnim: Animated.Value;
  searchQuery: string;
  setSearchQuery: Dispatch<SetStateAction<string>>;
  recentSearches: HistoryItem[];
  setRecentSearches: (searches: HistoryItem[]) => void;
}

export interface LoadingSpinnerProps {
  size?: number;
  color?: string;
}

export interface SkeletonProps {
  width?: DimensionValue;
  height?: DimensionValue;
  borderRadius?: number;
  style?: ViewStyle;
}
