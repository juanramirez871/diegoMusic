import React from 'react';
import {
  Animated,
  Image,
  Pressable,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useAuth } from '@/context/AuthContext';
import { styles, DRAWER_WIDTH } from './styles';

export { DRAWER_WIDTH };

interface Props {
  animValue: Animated.Value;
  onClose: () => void;
}

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
