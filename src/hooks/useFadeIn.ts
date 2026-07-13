import { useEffect } from 'react';
import { useSharedValue, useAnimatedStyle, withTiming, withDelay, Easing } from 'react-native-reanimated';

interface UseFadeInOptions {
  delay?: number;
  duration?: number;
  translateY?: number;
}

export function useFadeIn(options: UseFadeInOptions = {}) {
  const { delay = 0, duration = 500, translateY = 20 } = options;

  const opacity = useSharedValue(0);
  const translateX = useSharedValue(0);
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
    transform: [
      { translateY: translateYValue.value },
      { translateX: translateX.value },
    ],
  }));

  return { animatedStyle };
}
