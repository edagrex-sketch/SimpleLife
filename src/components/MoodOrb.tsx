import React from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, {
  useAnimatedStyle,
  withRepeat,
  withTiming,
  useSharedValue,
  withDelay,
} from 'react-native-reanimated';
import { MoodType } from '../types';
import { MOODS } from '../utils/colors';

interface Props {
  mood: MoodType;
  size?: number;
}

export default function MoodOrb({ mood, size = 12 }: Props) {
  const pulse = useSharedValue(1);
  const glow = useSharedValue(0.5);

  React.useEffect(() => {
    pulse.value = withRepeat(
      withTiming(1.15, { duration: 2000 }),
      -1,
      true,
    );
    glow.value = withRepeat(
      withDelay(300, withTiming(1, { duration: 2000 })),
      -1,
      true,
    );
  }, []);

  const animStyle = useAnimatedStyle(() => ({
    transform: [{ scale: pulse.value }],
    opacity: glow.value,
  }));

  return (
    <View style={[styles.wrapper, { width: size + 12, height: size + 12 }]}>
      <Animated.View
        style={[
          styles.orb,
          {
            width: size,
            height: size,
            borderRadius: size / 2,
            backgroundColor: MOODS[mood].color,
          },
          animStyle,
        ]}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  orb: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 4,
  },
});
