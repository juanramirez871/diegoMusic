import React, { useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import Animated, { 
  useSharedValue, 
  useAnimatedStyle, 
  withRepeat, 
  withTiming, 
  Easing,
  cancelAnimation
} from 'react-native-reanimated';
import type { LoadingSpinnerProps } from '@/interfaces/ui';

export const LoadingSpinner = ({ size = 24, color = "#fff" }: LoadingSpinnerProps) => {
  const rotation = useSharedValue(0);

  useEffect(() => {
    rotation.value = withRepeat(
      withTiming(360, {
        duration: 800,
        easing: Easing.linear,
      }),
      -1,
      false
    );

    return () => cancelAnimation(rotation);
  }, []);

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ rotate: `${rotation.value}deg` }],
    };
  });

  return (
    <View style={[styles.container, { width: size, height: size }]}>
      <Animated.View 
        style={[
          { 
            width: size, 
            height: size, 
            borderRadius: size / 2, 
            borderWidth: 1.5, 
            borderColor: 'rgba(255, 255, 255, 0.1)',
            borderTopColor: color,
          }, 
          animatedStyle
        ]} 
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    alignItems: 'center',
  },
});
