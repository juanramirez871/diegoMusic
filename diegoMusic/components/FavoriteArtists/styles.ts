import { StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
  container: { marginVertical: 10 },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 16,
    paddingHorizontal: 4,
  },
  scrollContent: { gap: 16, paddingRight: 16 },
  artistItem: { alignItems: 'center', width: 100, gap: 8 },
  artistImage: { width: 100, height: 100, borderRadius: 50 },
  artistName: { fontSize: 14, fontWeight: '600', color: '#fff', textAlign: 'center' },
  emptyContainer: {
    width: '100%',
    height: 100,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#333',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#444',
  },
  emptyText: { color: '#b3b3b3', fontSize: 12 },
});
