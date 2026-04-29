import { Dimensions, StyleSheet } from 'react-native';

const { width } = Dimensions.get('window');
const IMAGE_SIZE = width - 48;

export const styles = StyleSheet.create({
  carouselContainer: {
    width: width,
    height: IMAGE_SIZE,
    overflow: 'visible',
    justifyContent: 'center',
    alignItems: 'center',
  },
  imagesWrapper: {
    flexDirection: 'row',
    width: width * 3,
    justifyContent: 'center',
    alignItems: 'center',
  },
  imageContainer: {
    width: IMAGE_SIZE,
    height: IMAGE_SIZE,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowRadius: 15,
    position: 'relative',
  },
  imageContainerWrapper: {
    width: width,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cover: { width: IMAGE_SIZE, height: IMAGE_SIZE, borderRadius: 12 },
  videoLayer: {
    position: 'absolute',
    top: 0,
    left: 0,
  },
  icon: {
    position: 'absolute',
    bottom: 8,
    right: 8,
    zIndex: 10,
    elevation: 10,
    borderRadius: 12,
    padding: 4,
  },
  imageWrapper: {
    position: 'relative',
    width: '100%',
    height: '100%',
  },
  loadingBarTrack: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 3,
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
    overflow: 'hidden',
    zIndex: 20,
    backgroundColor: 'rgba(255,255,255,0.15)',
  },
  loadingBarFill: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: IMAGE_SIZE * 0.45,
    height: 3,
    borderRadius: 2,
    backgroundColor: '#2c5af3',
  },
});
