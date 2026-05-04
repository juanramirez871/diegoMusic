import React, { useRef, useState } from 'react';
import { Animated, Image, Pressable, TextInput, View } from 'react-native';
import styles from './styles';
import { IconSymbol } from '@/components/IconSymbol';
import { SearchOverlay } from '@/components/SearchOverlay';
import { useNetwork } from '@/context/NetworkContext';
import { useLanguage } from '@/context/LanguageContext';
import storage from '@/services/storage';
import type { HistoryItem } from '@/interfaces/ui';

const RECENT_SEARCHES_KEY = '@recent_searches';
export function TopBar() {
  
const { isOnline, isNetworkChecked, isApiReachable } = useNetwork();
  const { t } = useLanguage();
  const [isSearching, setIsSearching] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [recentSearches, setRecentSearches] = useState<HistoryItem[]>([]);
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const isDisabled = (isNetworkChecked && !isOnline) || !isApiReachable;

  const openSearch = async () => {
    if (isDisabled) return;
    try {
      const saved = await storage.getItem(RECENT_SEARCHES_KEY);
      if (saved) setRecentSearches(JSON.parse(saved));
    } catch {}
    setIsSearching(true);
    Animated.timing(fadeAnim, { toValue: 1, duration: 250, useNativeDriver: true }).start();
  };

  const closeSearch = () => {
    Animated.timing(fadeAnim, { toValue: 0, duration: 200, useNativeDriver: true }).start(() => {
      setIsSearching(false);
      setSearchQuery('');
    });
  };

  const handleUpdateHistory = async (newHistory: HistoryItem[]) => {
    setRecentSearches(newHistory);
    try {
      await storage.setItem(RECENT_SEARCHES_KEY, JSON.stringify(newHistory));
    } catch {}
  };

  return (
    <>
      <View style={styles.bar}>
        <View style={styles.left}>
          <Image
            source={require('@/assets/images/splash-icon.png')}
            style={styles.logo}
          />
        </View>

        <Pressable
          style={[styles.searchBox, isDisabled && styles.searchBoxDisabled]}
          onPress={openSearch}
          disabled={isDisabled}
        >
          <IconSymbol name="magnifyingglass" size={18} color={isDisabled ? '#666' : '#b3b3b3'} />
          <TextInput
            style={styles.input}
            placeholder={isDisabled ? t('search.placeholderOffline') : t('search.placeholder')}
            placeholderTextColor={isDisabled ? '#555' : '#b3b3b3'}
            value=""
            editable={false}
            pointerEvents="none"
          />
        </Pressable>

        <View style={styles.right}>
          <Image
            source={require('@/assets/images/avatar.jpg')}
            style={styles.avatar}
          />
        </View>
      </View>

      <SearchOverlay
        isVisible={isSearching}
        onClose={closeSearch}
        fadeAnim={fadeAnim}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        recentSearches={recentSearches}
        setRecentSearches={handleUpdateHistory}
      />
    </>
  );
}

