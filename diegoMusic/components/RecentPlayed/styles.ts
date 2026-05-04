import { StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
  gridContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    gap: 10,
  },
  column: {
    flex: 1,
    gap: 8,
  },
  containerItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#3c3b3bff',
    borderRadius: 8,
    overflow: 'hidden',
    height: 50,
  },
  skeletonItem: {
    backgroundColor: '#2a2a2aff',
    opacity: 0.5,
  },
  skeletonImage: {
    width: 50,
    height: 50,
    backgroundColor: '#3c3b3bff',
  },
  skeletonText: {
    height: 12,
    backgroundColor: '#3c3b3bff',
    borderRadius: 4,
    width: '80%',
  },
  image: {
    width: 50,
    height: 50,
  },
  textContainer: {
    flex: 1,
    paddingHorizontal: 8,
    justifyContent: 'center',
  },
  title: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#ffffff',
  },
});
