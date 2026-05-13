import { StyleSheet } from 'react-native';

export const BAR_HEIGHT = 72;

export const styles = StyleSheet.create({
  bar: {
    height: BAR_HEIGHT,
    backgroundColor: '#181818',
    borderTopWidth: 1,
    borderTopColor: '#282828',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    position: 'relative',
  },
  left: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    maxWidth: 300,
    minWidth: 0,
    overflow: 'hidden',
    zIndex: 1,
  },
  cover: {
    width: 48,
    height: 48,
    borderRadius: 4,
  },
  info: {
    flex: 1,
    minWidth: 0,
    overflow: 'hidden',
  },
  title: {
    color: '#fff',
    fontSize: 13,
    fontWeight: '600',
  },
  artist: {
    color: '#b3b3b3',
    fontSize: 11,
    marginTop: 2,
  },
  center: {
    position: 'absolute',
    left: 0,
    right: 0,
    alignItems: 'center',
    gap: 6,
    pointerEvents: 'box-none',
  } as any,
  controls: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  iconBtn: {
    padding: 6,
  },
  playBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 4,
  },
  progressRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    width: '100%',
  },
  time: {
    color: '#b3b3b3',
    fontSize: 10,
    minWidth: 32,
    textAlign: 'center',
  },
  trackBg: {
    flex: 1,
    height: 4,
    backgroundColor: '#535353',
    borderRadius: 2,
    overflow: 'hidden',
  },
  trackFill: {
    height: '100%',
    backgroundColor: '#fff',
    borderRadius: 2,
  },
  right: {
    marginLeft: 'auto' as any,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    gap: 4,
    zIndex: 1,
  },
  volumeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginLeft: 4,
  },
});

export const sliderStyle: React.CSSProperties = {
  width: 80,
  height: 4,
  accentColor: '#fff',
  cursor: 'pointer',
  background: 'transparent',
};
