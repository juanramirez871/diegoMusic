import React, { useEffect, useRef, useState } from 'react';
import { Animated, Image, Modal, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';

import styles from './styles';
import { IconSymbol } from '@/components/IconSymbol';
import { SearchOverlay } from '@/components/SearchOverlay';
import { useNetwork } from '@/context/NetworkContext';
import { useLanguage } from '@/context/LanguageContext';
import { useAuth } from '@/context/AuthContext';
import { usePlayer } from '@/context/PlayerContext';
import storage from '@/services/storage';
import type { HistoryItem } from '@/interfaces/ui';

const RECENT_SEARCHES_KEY = '@recent_searches';
export function TopBar() {

  const { isOnline, isNetworkChecked, isApiReachable } = useNetwork();
  const { t } = useLanguage();
  const { user, logout } = useAuth();
  const { isMaximized } = usePlayer();
  const [isSearching, setIsSearching] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [recentSearches, setRecentSearches] = useState<HistoryItem[]>([]);
  const [showUserMenu, setShowUserMenu] = useState(false);
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

  useEffect(() => {
    if (isMaximized && isSearching) closeSearch();
  }, [isMaximized]);

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
          <Pressable onPress={() => setShowUserMenu(true)}>
            <Image
              source={user?.avatar ? { uri: user.avatar } : require('@/assets/images/avatar.jpg')}
              style={styles.avatar}
            />
          </Pressable>
        </View>
      </View>

      <Modal
        transparent
        visible={showUserMenu}
        animationType="fade"
        onRequestClose={() => setShowUserMenu(false)}
      >
        <Pressable style={menuStyles.backdrop} onPress={() => setShowUserMenu(false)}>
          <Pressable style={menuStyles.menu} onPress={e => e.stopPropagation()}>
            <View style={menuStyles.userInfo}>
              <Image
                source={user?.avatar ? { uri: user.avatar } : require('@/assets/images/avatar.jpg')}
                style={menuStyles.menuAvatar}
              />
              <View>
                <Text style={menuStyles.userName}>{user?.name}</Text>
                <Text style={menuStyles.userEmail}>{user?.email}</Text>
              </View>
            </View>
            <View style={menuStyles.divider} />
            <Pressable
              style={({ pressed }) => [menuStyles.logoutBtn, pressed && menuStyles.logoutBtnPressed]}
              onPress={() => { setShowUserMenu(false); logout(); }}
            >
              <Text style={menuStyles.logoutText}>Cerrar sesión</Text>
            </Pressable>
          </Pressable>
        </Pressable>
      </Modal>

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

const menuStyles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    alignItems: 'flex-end',
    justifyContent: 'flex-start',
    paddingTop: 56,
    paddingRight: 16,
  },
  menu: {
    backgroundColor: '#1e1e1e',
    borderRadius: 12,
    width: 260,
    overflow: 'hidden',
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 16,
  },
  menuAvatar: {
    width: 42,
    height: 42,
    borderRadius: 21,
  },
  userName: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  userEmail: {
    color: '#888',
    fontSize: 12,
    marginTop: 2,
  },
  divider: {
    height: 1,
    backgroundColor: '#2a2a2a',
  },
  logoutBtn: {
    paddingVertical: 14,
    paddingHorizontal: 16,
  },
  logoutBtnPressed: {
    backgroundColor: '#2a2a2a',
  },
  logoutText: {
    color: '#ff4444',
    fontSize: 14,
    fontWeight: '500',
  },
});

