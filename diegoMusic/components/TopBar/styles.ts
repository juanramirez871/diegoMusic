import { StyleSheet } from 'react-native';
export const TOP_BAR_HEIGHT = 64;

export default StyleSheet.create({
  bar: {
    height: TOP_BAR_HEIGHT,
    backgroundColor: '#121212',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    gap: 12,
    zIndex: 100,
  },
  left: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  right: {
    flex: 1,
    alignItems: 'flex-end',
  },
  logo: {
    width: 56,
    height: 56,
  },
  avatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
  },
  iconButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#2a2a2a',
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconButtonActive: {
    backgroundColor: '#3a3a3a',
  },
  searchBox: {
    width: '30%' as any,
    maxWidth: 400,
    height: 44,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#2a2a2a',
    borderRadius: 999,
    paddingHorizontal: 16,
    gap: 10,
  },
  searchBoxDisabled: {
    opacity: 0.5,
  },
  input: {
    flex: 1,
    color: '#fff',
    fontSize: 14,
    // @ts-ignore web-only
    outlineStyle: 'solid',
    // @ts-ignore web-only
    outlineWidth: 0,
  },
});
