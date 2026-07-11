import React, { useEffect } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withSpring,
  interpolate,
  FadeInDown,
} from 'react-native-reanimated';
import { MoodEntry } from '../types';
import { MOODS } from '../utils/colors';

interface Props {
  entry: MoodEntry;
  index: number;
}

export default function EntryCard({ entry, index }: Props) {
  const scale = useSharedValue(0);

  useEffect(() => {
    scale.value = withDelay(index * 80, withSpring(1, { damping: 12 }));

    return () => {
      scale.value = 0;
    };
  }, []);

  const animStyle = useAnimatedStyle(() => ({
    transform: [
      { scale: scale.value },
      {
        translateX: interpolate(scale.value, [0, 1], [50, 0]),
      },
    ],
    opacity: scale.value,
  }));

  const mood = MOODS[entry.mood];
  const date = new Date(entry.date + 'T12:00:00').toLocaleDateString('es', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  });

  return (
    <Animated.View
      entering={FadeInDown.delay(index * 80).springify()}
      style={[styles.card, { borderLeftColor: mood.color }]}>
      <Animated.View style={animStyle}>
        <View style={styles.header}>
          <Text style={styles.emoji}>{mood.emoji}</Text>
          <View style={styles.headerRight}>
            <Text style={styles.moodLabel}>{mood.label}</Text>
            <Text style={styles.date}>{date}</Text>
          </View>
          <View style={[styles.intensity, { backgroundColor: mood.color + '30' }]}>
            <View
              style={[
                styles.intensityFill,
                { width: `${entry.intensity * 20}%`, backgroundColor: mood.color },
              ]}
            />
          </View>
        </View>
        {entry.note ? (
          <Text style={styles.note} numberOfLines={2}>
            {entry.note}
          </Text>
        ) : null}
      </Animated.View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: 'rgba(255,255,255,0.85)',
    borderRadius: 16,
    padding: 16,
    marginHorizontal: 16,
    marginBottom: 12,
    borderLeftWidth: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 5,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  emoji: {
    fontSize: 28,
  },
  headerRight: {
    flex: 1,
  },
  moodLabel: {
    fontSize: 15,
    fontWeight: '700',
    color: '#1F2937',
  },
  date: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 2,
  },
  intensity: {
    width: 60,
    height: 6,
    borderRadius: 3,
    overflow: 'hidden',
  },
  intensityFill: {
    height: '100%',
    borderRadius: 3,
  },
  note: {
    fontSize: 14,
    color: '#4B5563',
    marginTop: 10,
    lineHeight: 20,
  },
});
