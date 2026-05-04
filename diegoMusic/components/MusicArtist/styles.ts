import { StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
  container: {
    width: '100%',
    marginTop: 10,
  },
  title: {
    color: '#b3b3b3',
    fontSize: 14,
    fontWeight: 'bold',
  },
  author: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
    lineHeight: 24,
  },
  image: {
    width: 60,
    height: 60,
    borderRadius: '50%',
  },
  itemContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
    gap: 10,
  },
});
