import { Platform, StyleSheet } from 'react-native';

const isWeb = Platform.OS === 'web';

export const styles = StyleSheet.create({
  container: {
    width: '100%',
    marginTop: 10,
  },
  title: {
    color: '#b3b3b3',
    fontSize: isWeb ? 16 : 14,
    fontWeight: 'bold',
  },
  author: {
    color: '#fff',
    fontSize: isWeb ? 26 : 20,
    fontWeight: 'bold',
    lineHeight: isWeb ? 32 : 24,
  },
  image: {
    width: isWeb ? 88 : 60,
    height: isWeb ? 88 : 60,
    borderRadius: 999,
  },
  itemContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
    gap: isWeb ? 14 : 10,
  },
});
