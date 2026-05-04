import React from 'react';
import {
  Animated,
  Dimensions,
  Image,
  Pressable,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useAuth } from '@/context/AuthContext';

interface Props {
  animValue: Animated.Value;
  onClose: () => void;
}

export const DRAWER_WIDTH = Math.min(Dimensions.get('window').width * 0.72, 300);

export function UserDrawer({ animValue, onClose }: Props) {
  const { user, logout } = useAuth();

  const drawerTranslateX = animValue.interpolate({
    inputRange: [0, 1],
    outputRange: [-DRAWER_WIDTH, 0],
  });

  const backdropOpacity = animValue.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 1],
  });

  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="box-none">
      <Animated.View style={[styles.backdrop, { opacity: backdropOpacity }]} pointerEvents="box-none">
        <Pressable style={StyleSheet.absoluteFill} onPress={onClose} />
      </Animated.View>

      <Animated.View style={[styles.drawer, { transform: [{ translateX: drawerTranslateX }] }]}>
        <View style={styles.userInfo}>
          <Image
            source={user?.avatar ? { uri: user.avatar } : require('@/assets/images/avatar.jpg')}
            style={styles.avatar}
          />
          <Text style={styles.name}>{user?.name}</Text>
          <Text style={styles.email}>{user?.email}</Text>
        </View>

        <View style={styles.divider} />

        <TouchableOpacity
          style={styles.logoutBtn}
          activeOpacity={0.7}
          onPress={() => { onClose(); logout(); }}
        >
          <Text style={styles.logoutText}>Cerrar sesión</Text>
        </TouchableOpacity>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.4)',
  },
  drawer: {
    position: 'absolute',
    top: 0,
    left: 0,
    bottom: 0,
    width: DRAWER_WIDTH,
    backgroundColor: '#1a1a1a',
    paddingTop: 80,
    paddingHorizontal: 24,
    shadowColor: '#000',
    shadowOffset: { width: 4, height: 0 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 16,
  },
  userInfo: {
    alignItems: 'center',
    gap: 10,
    paddingBottom: 28,
  },
  avatar: {
    width: 72,
    height: 72,
    borderRadius: 36,
    marginBottom: 4,
  },
  name: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '700',
  },
  email: {
    color: '#888',
    fontSize: 13,
  },
  divider: {
    height: 1,
    backgroundColor: '#2a2a2a',
    marginBottom: 8,
  },
  logoutBtn: {
    paddingVertical: 14,
    paddingHorizontal: 4,
  },
  logoutText: {
    color: '#ff4444',
    fontSize: 15,
    fontWeight: '600',
  },
});
