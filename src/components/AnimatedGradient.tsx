import React, { useEffect } from 'react';
import { StyleSheet } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
  interpolateColor,
} from 'react-native-reanimated';
import { MoodType } from '../types';
import { MOODS } from '../utils/colors';

interface Props {
  mood: MoodType;
}

export default function AnimatedGradient({ mood }: Props) {
  const progress = useSharedValue(0);

  useEffect(() => {
    progress.value = 0;
    progress.value = withTiming(1, { duration: 800 });
  }, [mood]);

  const style1 = useAnimatedStyle(() => ({
    opacity: interpolateColor(
      progress.value,
      [0, 1],
      [0.5, 1],
    ) as unknown as number,
  }));

  const bgStyle = useAnimatedStyle(() => ({
    backgroundColor: interpolateColor(
      progress.value,
      [0, 1],
      [MOODS.happy.gradient[0], MOODS[mood].gradient[0]],
    ),
  }));

  const bgStyle2 = useAnimatedStyle(() => ({
    backgroundColor: interpolateColor(
      progress.value,
      [0, 1],
      [MOODS.happy.gradient[1], MOODS[mood].gradient[1]],
    ),
  }));

  return (
    <Animated.View style={[StyleSheet.absoluteFill, bgStyle]}>
      <Animated.View
        style={[
          StyleSheet.absoluteFill,
          { opacity: 0.65 },
          bgStyle2,
        ]}
      />
    </Animated.View>
  );
}
