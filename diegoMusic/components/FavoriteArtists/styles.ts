import { Platform, StyleSheet } from 'react-native';

const isWeb = Platform.OS === 'web';

export const styles = StyleSheet.create({
  container: {
    marginVertical: 10,
  },
  title: {
    fontSize: isWeb ? 26 : 22,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 16,
    paddingHorizontal: 4,
  },
  scrollContent: {
    gap: isWeb ? 24 : 16,
    paddingRight: isWeb ? 24 : 16,
  },
  artistItem: {
    alignItems: 'center',
    width: isWeb ? 170 : 100,
    gap: 10,
  },
  artistImage: {
    width: isWeb ? 170 : 100,
    height: isWeb ? 170 : 100,
    borderRadius: 999,
  },
  artistName: {
    fontSize: isWeb ? 18 : 14,
    fontWeight: '600',
    color: '#fff',
    textAlign: 'center',
  },
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
  emptyText: {
    color: '#b3b3b3',
    fontSize: 12,
  },
});
