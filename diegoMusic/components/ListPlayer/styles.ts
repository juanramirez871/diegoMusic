import { Platform, StyleSheet } from 'react-native';

const isWeb = Platform.OS === 'web';

export const styles = StyleSheet.create({
  container: {
    width: '100%',
    marginTop: 10,
  },
  scrollContent: {
    gap: isWeb ? 20 : 16,
    paddingRight: isWeb ? 24 : 16,
  },
  songItem: {
    width: isWeb ? 200 : 140,
  },
  image: {
    width: isWeb ? 200 : 140,
    height: isWeb ? 200 : 140,
    borderRadius: isWeb ? 12 : 8,
    backgroundColor: '#333',
  },
  infoContainer: {
    marginTop: 8,
  },
  titleSong: {
    fontSize: isWeb ? 16 : 14,
    fontWeight: 'bold',
    color: '#fff',
  },
  subtitleSong: {
    fontSize: isWeb ? 14 : 12,
    marginTop: 2,
    color: '#b3b3b3',
  },
});
