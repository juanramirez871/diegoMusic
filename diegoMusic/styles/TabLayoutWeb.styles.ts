import { StyleSheet } from 'react-native';

export const SIDEBAR_WIDTH = 76;

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'column',
    backgroundColor: '#000',
  },
  body: {
    flex: 1,
    flexDirection: 'row',
    padding: 8,
    gap: 8,
  },
  content: {
    flex: 1,
    backgroundColor: '#121212',
    borderRadius: 12,
    overflow: 'hidden',
  },
  minimizedPlayer: {
    zIndex: 200,
  },
  sidebar: {
    width: SIDEBAR_WIDTH,
    backgroundColor: '#121212',
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoArea: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    paddingVertical: 8,
  },
  logoBadge: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#121212',
  },
  logoText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '700',
    letterSpacing: -0.3,
  },
  navCard: {
    backgroundColor: '#121212',
    borderRadius: 16,
    paddingVertical: 10,
    paddingHorizontal: 10,
    gap: 10,
    alignItems: 'center',
  },
  navItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    width: 56,
    height: 56,
    borderRadius: 14,
  },
  navItemHighlighted: {
    backgroundColor: '#1a1a1a',
  },
  navLabel: {
    color: '#b3b3b3',
    fontSize: 14,
    fontWeight: '700',
  },
  navLabelHighlighted: {
    color: '#fff',
  },
});
