import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
} from 'react-native-reanimated';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { Task } from '../types';
import { COLORS, PRIORITY_COLORS, PRIORITY_LABELS, CATEGORY_COLORS } from '../utils/colors';
import { formatTime } from '../utils/helpers';
import { useScalePress } from '../hooks/useScalePress';
import { hapticSuccess } from '../hooks/useHaptic';

interface TaskCardProps {
  task: Task;
  onToggle: () => void;
  onPress?: () => void;
}

const PRIORITY_BORDER: Record<string, string> = {
  high: COLORS.error,
  medium: COLORS.tertiary,
  low: COLORS.success,
};

export default function TaskCard({ task, onToggle, onPress }: TaskCardProps) {
  const isDone = !!task.is_done;
  const priorityColor = PRIORITY_COLORS[task.priority] || COLORS.textSecondary;
  const borderColor = PRIORITY_BORDER[task.priority] || COLORS.divider;
  const { animatedStyle, onPressIn, onPressOut } = useScalePress();

  const handleToggle = () => {
    hapticSuccess();
    onToggle();
  };

  return (
    <Pressable onPress={onPress} onPressIn={onPressIn} onPressOut={onPressOut}>
      <Animated.View style={animatedStyle}>
        <View style={[styles.card, isDone && styles.doneCard]}>
          <View style={[styles.leftBorder, { backgroundColor: borderColor }]} />
          <View style={styles.cardContent}>
            <View style={styles.topRow}>
              <Pressable
                onPress={handleToggle}
                style={styles.checkbox}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              >
                <AnimatedCheckbox isDone={isDone} color={borderColor} />
              </Pressable>
              <View style={styles.badges}>
                <View style={[styles.priorityBadge, { backgroundColor: priorityColor + '18' }]}>
                  <Text style={[styles.priorityText, { color: priorityColor }]}>
                    {PRIORITY_LABELS[task.priority]}
                  </Text>
                </View>
                {task.project && task.project !== 'General' && (
                  <View style={[styles.projectBadge, { backgroundColor: (CATEGORY_COLORS[task.project] || COLORS.primary) + '15' }]}>
                    <Text style={[styles.projectText, { color: CATEGORY_COLORS[task.project] || COLORS.primary }]}>
                      {task.project}
                    </Text>
                  </View>
                )}
              </View>
              {task.time && (
                <Text style={styles.time}>{formatTime(task.time)}</Text>
              )}
            </View>
            <Text style={[styles.title, isDone && styles.titleDone]} numberOfLines={2}>
              {task.title}
            </Text>
            {task.description ? (
              <Text style={styles.description} numberOfLines={1}>{task.description}</Text>
            ) : null}
          </View>
        </View>
      </Animated.View>
    </Pressable>
  );
}

function AnimatedCheckbox({ isDone, color }: { isDone: boolean; color: string }) {
  const scale = useSharedValue(isDone ? 1 : 0);

  React.useEffect(() => {
    scale.value = withSpring(isDone ? 1 : 0, {
      damping: 15,
      stiffness: 300,
    });
  }, [isDone, scale]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return (
    <View style={[styles.checkboxOuter, { borderColor: isDone ? color : COLORS.divider }]}>
      <Animated.View style={[styles.checkboxFill, { backgroundColor: color }, animatedStyle]} />
      {isDone && (
        <Animated.View style={[styles.checkmarkWrap, animatedStyle]}>
          <Ionicons name="checkmark" size={14} color="#fff" />
        </Animated.View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    backgroundColor: COLORS.surface,
    borderRadius: 16,
    marginBottom: 10,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },
  doneCard: {
    opacity: 0.55,
  },
  leftBorder: {
    width: 4,
  },
  cardContent: {
    flex: 1,
    padding: 14,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  checkbox: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
  },
  checkboxOuter: {
    width: 28,
    height: 28,
    borderRadius: 14,
    borderWidth: 2.5,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  checkboxFill: {
    ...StyleSheet.absoluteFill,
    borderRadius: 14,
    transform: [{ scale: 0 }],
  },
  checkmarkWrap: {
    ...StyleSheet.absoluteFill,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badges: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  priorityBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  priorityText: {
    fontSize: 11,
    fontWeight: '700',
  },
  projectBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  projectText: {
    fontSize: 11,
    fontWeight: '600',
  },
  time: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.textTertiary,
  },
  title: {
    fontSize: 15,
    fontWeight: '600',
    color: COLORS.textPrimary,
    lineHeight: 21,
  },
  titleDone: {
    textDecorationLine: 'line-through',
    color: COLORS.textSecondary,
  },
  description: {
    fontSize: 12,
    color: COLORS.textTertiary,
    marginTop: 4,
  },
});
