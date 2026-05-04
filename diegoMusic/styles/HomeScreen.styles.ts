import { Platform, StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Platform.OS === 'web' ? '#121212' : '#252424ff',
  },
  scrollContainer: {
    flexGrow: 1,
    paddingBottom: 100,
  },
  container: {
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 24,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  avatarCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#333',
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#333',
  },
  avatar: {
    width: '100%',
    height: '100%',
  },
  tagsContainer: {
    flexDirection: 'row',
    gap: 10,
  },
  tag: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#1A1A1A',
    borderWidth: 1,
    borderColor: '#333',
    minWidth: 80,
    alignItems: 'center',
    justifyContent: 'center',
  },
  statsButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#1A1A1A',
    borderWidth: 1,
    borderColor: '#333',
    alignItems: 'center',
    justifyContent: 'center',
  },
  selectedTag: {
    backgroundColor: '#2c5af3ff',
    borderColor: '#2c5af3ff',
  },
  tagText: {
    color: '#E0E0E0',
    fontSize: 14,
    fontWeight: '700',
    textAlign: 'center',
  },
  selectedTagText: {
    color: '#FFFFFF',
  },
  content: {
    marginTop: 20,
  },
  recentPlayedWrapper: {
    width: '100%',
    gap: 20,
  },
  podcastsWrapper: {
    width: '100%',
    gap: 20,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 5,
    color: '#fff',
    paddingHorizontal: 4,
  },
  musicArtistContainer: {
    flexDirection: 'column',
    width: '100%',
    gap: 12,
  },
  emptyContainer: {
    width: '100%',
    height: 100,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#333',
    borderRadius: 8,
    borderWidth: 1,
    marginTop: 15,
    borderColor: '#444',
  },
  emptyText: {
    color: '#b3b3b3',
    fontSize: 12,
  },
});
