import { StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
  banner: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 30,
    backgroundColor: '#138e3eff',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 9999,
  },
  bannerText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
});
