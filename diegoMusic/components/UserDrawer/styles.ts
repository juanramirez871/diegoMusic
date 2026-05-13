import { Dimensions, StyleSheet } from 'react-native';

export const DRAWER_WIDTH = Math.min(Dimensions.get('window').width * 0.72, 300);

export const styles = StyleSheet.create({
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
