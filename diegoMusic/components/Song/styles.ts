import { StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
  songContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 20,
    width: '100%',
  },
  image: {
    width: 50,
    height: 50,
    borderRadius: 4,
  },
  imageWrapper: {
    width: 50,
    height: 50,
    borderRadius: 4,
    overflow: 'hidden',
    backgroundColor: '#1a1a1a',
    justifyContent: 'center',
    alignItems: 'center',
  },
  playingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  infoContainer: {
    flex: 1,
    marginLeft: 15,
    justifyContent: 'center',
  },
  title: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 4,
  },
  metadataContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  videoBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    color: '#b3b3b3',
    paddingHorizontal: 4,
    paddingVertical: 1,
    borderRadius: 2,
    gap: 2,
  },
  artist: {
    color: '#b3b3b3',
    fontSize: 13,
    flex: 1,
  },
  menuButton: {
    padding: 10,
  },
});
