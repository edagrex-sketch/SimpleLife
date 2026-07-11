import React from 'react';
import { StyleSheet, Text, Pressable, View } from 'react-native';
import Animated, {
  useAnimatedStyle,
  withSpring,
  withSequence,
  useSharedValue,
} from 'react-native-reanimated';
import { MoodType } from '../types';
import { MOOD_LIST } from '../utils/colors';

interface Props {
  selected: MoodType | null;
  onSelect: (mood: MoodType) => void;
}

function MoodItem({
  mood,
  label,
  emoji,
  color,
  isSelected,
  onPress,
}: {
  mood: MoodType;
  label: string;
  emoji: string;
  color: string;
  isSelected: boolean;
  onPress: () => void;
}) {
  const scale = useSharedValue(1);

  const animStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePress = () => {
    scale.value = withSequence(
      withSpring(0.85),
      withSpring(1.15),
      withSpring(1),
    );
    onPress();
  };

  return (
    <Animated.View style={animStyle}>
      <Pressable
        onPress={handlePress}
        style={[
          styles.moodButton,
          { backgroundColor: color + '20' },
          isSelected && { backgroundColor: color, borderColor: color },
        ]}>
        <Text style={styles.emoji}>{emoji}</Text>
        <Text style={[styles.label, isSelected && styles.selectedLabel]}>
          {label}
        </Text>
      </Pressable>
    </Animated.View>
  );
}

export default function EmotionPicker({ selected, onSelect }: Props) {
  return (
    <View style={styles.container}>
      {MOOD_LIST.map(m => (
        <MoodItem
          key={m.key}
          mood={m.key}
          label={m.label}
          emoji={m.emoji}
          color={m.color}
          isSelected={selected === m.key}
          onPress={() => onSelect(m.key)}
        />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 12,
    paddingHorizontal: 16,
  },
  moodButton: {
    width: 88,
    height: 88,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  emoji: {
    fontSize: 32,
    marginBottom: 4,
  },
  label: {
    fontSize: 11,
    fontWeight: '600',
    color: '#666',
  },
  selectedLabel: {
    color: '#fff',
  },
});
