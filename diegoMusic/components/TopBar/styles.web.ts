import { StyleSheet } from 'react-native';

export { default as styles, TOP_BAR_HEIGHT } from './styles';

export const menuStyles = StyleSheet.create({
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
