import { Platform, StyleSheet } from 'react-native';

export const COMPACT_LINE_HEIGHT = 50;

export const searchStyles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 4,
    marginTop: 10,
    width: '100%',
  },
  input: {
    flex: 1,
    color: '#fff',
    fontSize: 13,
    paddingVertical: 6,
  },
  btn: {
    marginLeft: 8,
    padding: 4,
  },
});

export const panel = StyleSheet.create({
  container: {
    marginTop: 32,
    paddingHorizontal: 0,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  label: {
    color: '#b3b3b3',
    fontSize: 10,
    fontWeight: 'bold',
    letterSpacing: 1,
  },
  center: {
    height: COMPACT_LINE_HEIGHT * 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyText: {
    color: '#b3b3b3',
    fontSize: 13,
  },
  line: {
    color: 'rgba(255,255,255,0.3)',
    fontSize: 20,
    fontWeight: '600',
    lineHeight: COMPACT_LINE_HEIGHT,
  },
  lineActive: {
    color: '#fff',
    fontSize: 22,
  },
  plain: {
    color: 'rgba(255,255,255,0.5)',
    fontSize: 16,
    lineHeight: 24,
  },
});

export const full = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#0d0d0dfa',
    zIndex: 10,
    paddingTop: Platform.OS === 'ios' ? 54 : 24,
    paddingHorizontal: 28,
    paddingBottom: 32,
  },
  closeBtn: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 54 : 24,
    left: 16,
    padding: 8,
    zIndex: 11,
  },
  headingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
    position: 'relative',
  },
  heading: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
    letterSpacing: 1,
    textAlign: 'center',
  },
  editBtn: {
    position: 'absolute',
    right: 0,
    padding: 4,
  },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
  },
  emptyText: {
    color: '#b3b3b3',
    fontSize: 15,
    textAlign: 'center',
  },
  listContent: {
    paddingBottom: 80,
  },
  line: {
    color: 'rgba(255,255,255,0.35)',
    fontSize: 22,
    fontWeight: '700',
    lineHeight: 38,
    marginBottom: 8,
  },
  lineActive: {
    color: '#fff',
    fontSize: 24,
  },
  plain: {
    color: 'rgba(255,255,255,0.75)',
    fontSize: 16,
    lineHeight: 26,
  },
});
