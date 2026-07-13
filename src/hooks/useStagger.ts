import { useEffect } from 'react';
import { useSharedValue, useAnimatedStyle, withTiming, withDelay, Easing } from 'react-native-reanimated';

interface UseStaggerOptions {
  index: number;
  staggerDelay?: number;
  duration?: number;
  translateY?: number;
}

export function useStagger(options: UseStaggerOptions) {
  const { index, staggerDelay = 60, duration = 400, translateY = 24 } = options;
  const delay = index * staggerDelay;

  const opacity = useSharedValue(0);
  const translateYValue = useSharedValue(translateY);

  useEffect(() => {
    opacity.value = withDelay(
      delay,
      withTiming(1, { duration, easing: Easing.out(Easing.cubic) })
    );
    translateYValue.value = withDelay(
      delay,
      withTiming(0, { duration, easing: Easing.out(Easing.cubic) })
    );
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ translateY: translateYValue.value }],
  }));

  return { animatedStyle };
}
