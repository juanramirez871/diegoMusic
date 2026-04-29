import { StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
  modalContainer: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#121212',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingBottom: 16,
    backgroundColor: '#121212',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.1)',
  },
  backButton: { padding: 4 },
  headerTitle: { color: '#fff', fontSize: 18, fontWeight: 'bold' },
  resultsContainer: { paddingTop: 10 },
  skeletonContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 20,
    width: '100%',
  },
  skeletonInfo: { flex: 1, marginLeft: 15, justifyContent: 'center' },
  emptyState: { flex: 1, paddingHorizontal: 16, paddingTop: 100, alignItems: 'center' },
  emptyStateTitle: { color: '#b3b3b3', fontSize: 16 },
});
