import { useRef } from 'react';
import { Dimensions } from 'react-native';
import { Gesture } from 'react-native-gesture-handler';
import { useSharedValue, withSpring } from 'react-native-reanimated';

const { width } = Dimensions.get('window');

interface UsePlayerGesturesArgs {
  activeDuration: number;
  isSeekEnabled: boolean;
  onNext: () => void;
  onPrevious: () => void;
  onClose: () => void;
  onSeek: (position: number) => void;
  onSeekStart: () => void;
  onSeekUpdate: (position: number) => void;
}

export const usePlayerGestures = ({
  activeDuration,
  isSeekEnabled,
  onNext,
  onPrevious,
  onClose,
  onSeek,
  onSeekStart,
  onSeekUpdate,
}: UsePlayerGesturesArgs) => {
  const playerTranslateY = useSharedValue(0);
  const playerTranslateX = useSharedValue(0);
  const swipeDirectionRef = useRef<'none' | 'horizontal' | 'vertical'>('none');
  const lastGestureUpdateRef = useRef<number>(0);

  const SWIPE_DOWN_THRESHOLD = 80;
  const SWIPE_HORIZ_THRESHOLD = 60;

  const playerGesture = Gesture.Pan()
    .runOnJS(true)
    .minDistance(15)
    .onStart((e) => {
      swipeDirectionRef.current = Math.abs(e.translationX) >= Math.abs(e.translationY)
        ? 'horizontal'
        : 'vertical';
    })
    .onUpdate((e) => {
      if (swipeDirectionRef.current === 'vertical' && e.translationY > 0) {
        playerTranslateY.value = e.translationY * 0.4;
      } else if (swipeDirectionRef.current === 'horizontal') {
        playerTranslateX.value = e.translationX * 0.25;
      }
    })
    .onEnd((e) => {
      if (swipeDirectionRef.current === 'horizontal') {
        if (e.translationX < -SWIPE_HORIZ_THRESHOLD) onNext();
        else if (e.translationX > SWIPE_HORIZ_THRESHOLD) onPrevious();
        playerTranslateX.value = withSpring(0);
      } else if (swipeDirectionRef.current === 'vertical') {
        if (e.translationY > SWIPE_DOWN_THRESHOLD) onClose();
        playerTranslateY.value = withSpring(0);
      }
    });

  const progressGesture = Gesture.Pan()
    .runOnJS(true)
    .enabled(isSeekEnabled)
    .activeOffsetX([-5, 5])
    .failOffsetY([-20, 20])
    .onUpdate((event) => {
      if (activeDuration > 0) {
        const now = Date.now();
        if (now - lastGestureUpdateRef.current < 50) return;
        lastGestureUpdateRef.current = now;
        onSeekStart();
        const newProgress = Math.min(Math.max((event.x / (width - 48)) * activeDuration, 0), activeDuration);
        onSeekUpdate(newProgress);
      }
    })
    .onEnd((event) => {
      if (activeDuration > 0) {
        const newProgress = Math.min(Math.max((event.x / (width - 48)) * activeDuration, 0), activeDuration);
        onSeek(newProgress);
      }
    });

  const progressTap = Gesture.Tap()
    .runOnJS(true)
    .enabled(isSeekEnabled)
    .onEnd((event) => {
      if (activeDuration > 0) {
        const newProgress = Math.min(Math.max((event.x / (width - 48)) * activeDuration, 0), activeDuration);
        onSeek(newProgress);
      }
    });

  return {
    playerTranslateY,
    playerTranslateX,
    playerGesture,
    progressGesture,
    progressTap,
  };
};
