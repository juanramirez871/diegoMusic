import { StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
  container: {
    width: '100%',
    marginTop: 10,
  },
  scrollContent: {
    gap: 16,
    paddingRight: 16,
  },
  songItem: {
    width: 140,
  },
  image: {
    width: 140,
    height: 140,
    borderRadius: 8,
    backgroundColor: '#333',
  },
  infoContainer: {
    marginTop: 8,
  },
  titleSong: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#fff',
  },
  subtitleSong: {
    fontSize: 12,
    marginTop: 2,
    color: '#b3b3b3',
  },
});
