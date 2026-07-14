import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
} from 'react-native-reanimated';
import ReanimatedSwipeable from 'react-native-gesture-handler/ReanimatedSwipeable';
import Ionicons from 'react-native-vector-icons/Ionicons';
import GlassBox from './GlassBox';
import { Task } from '../types';
import { COLORS, PRIORITY_COLORS, PRIORITY_LABELS, CATEGORY_COLORS } from '../utils/colors';
import { formatDateShort } from '../utils/helpers';
import { useScalePress } from '../hooks/useScalePress';
import { hapticLight, hapticSuccess, hapticWarning } from '../hooks/useHaptic';

interface TaskCardProps {
  task: Task;
  onToggle: () => void;
  onDelete?: () => void;
  onPress: () => void;
}

export default function TaskCard({ task, onToggle, onDelete, onPress }: TaskCardProps) {
  const priorityColor = PRIORITY_COLORS[task.priority] || COLORS.textSecondary;
  const isDone = !!task.is_done;
  const { animatedStyle, onPressIn, onPressOut } = useScalePress();

  const handleToggle = () => {
    hapticSuccess();
    onToggle();
  };

  const handleDelete = () => {
    hapticWarning();
    onDelete?.();
  };

  const renderRightActions = () => (
    <Pressable style={styles.deleteAction} onPress={handleDelete}>
      <Ionicons name="trash-outline" size={20} color="#fff" />
      <Text style={styles.actionText}>Eliminar</Text>
    </Pressable>
  );

  const renderLeftActions = () => (
    <Pressable style={styles.completeAction} onPress={handleToggle}>
      <Ionicons name="checkmark-circle-outline" size={20} color="#fff" />
      <Text style={styles.actionText}>{isDone ? 'Reabrir' : 'Completar'}</Text>
    </Pressable>
  );

  return (
    <ReanimatedSwipeable
      renderRightActions={onDelete ? renderRightActions : undefined}
      renderLeftActions={renderLeftActions}
      overshootLeft={false}
      overshootRight={false}
      friction={2}
    >
      <Pressable onPress={onPress} onPressIn={onPressIn} onPressOut={onPressOut}>
        <Animated.View style={animatedStyle}>
          <GlassBox style={[styles.card, isDone && styles.doneCard]}>
            <View style={styles.row}>
              <Pressable
                onPress={handleToggle}
                style={styles.checkbox}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              >
                <AnimatedCheckbox isDone={isDone} />
              </Pressable>
              <View style={styles.content}>
                <Text style={[styles.title, isDone && styles.titleDone]} numberOfLines={1}>
                  {task.title}
                </Text>
                {task.description ? (
                  <Text style={styles.description} numberOfLines={1}>{task.description}</Text>
                ) : null}
                <View style={styles.meta}>
                  {task.due_date && (
                    <View style={styles.dateBadge}>
                      <Ionicons name="time-outline" size={11} color={COLORS.textTertiary} />
                      <Text style={styles.date}>{formatDateShort(task.due_date)}</Text>
                    </View>
                  )}
                  {task.project && task.project !== 'General' && (
                    <View style={[styles.projectBadge, { backgroundColor: (CATEGORY_COLORS[task.project] || COLORS.primary) + '15' }]}>
                      <Text style={[styles.projectText, { color: CATEGORY_COLORS[task.project] || COLORS.primary }]}>
                        {task.project}
                      </Text>
                    </View>
                  )}
                  <View style={[styles.priorityBadge, { backgroundColor: priorityColor + '18' }]}>
                    <View style={[styles.priorityDot, { backgroundColor: priorityColor }]} />
                    <Text style={[styles.priorityText, { color: priorityColor }]}>
                      {PRIORITY_LABELS[task.priority]}
                    </Text>
                  </View>
                </View>
              </View>
            </View>
          </GlassBox>
        </Animated.View>
      </Pressable>
    </ReanimatedSwipeable>
  );
}

function AnimatedCheckbox({ isDone }: { isDone: boolean }) {
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
    <View style={styles.checkboxInner}>
      <Animated.View style={[styles.checkboxFill, animatedStyle]} />
      {isDone && (
        <Animated.View style={[styles.checkmarkContainer, animatedStyle]}>
          <Ionicons name="checkmark" size={14} color="#fff" />
        </Animated.View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  card: { marginBottom: 8, paddingVertical: 12, paddingHorizontal: 14 },
  doneCard: { opacity: 0.55 },
  row: { flexDirection: 'row', alignItems: 'center' },
  checkbox: {
    width: 44,
    height: 44,
    marginRight: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxInner: {
    width: 26,
    height: 26,
    borderRadius: 13,
    borderWidth: 2,
    borderColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  checkboxFill: {
    ...StyleSheet.absoluteFill,
    borderRadius: 13,
    backgroundColor: COLORS.primary,
    transform: [{ scale: 0 }],
  },
  checkmarkContainer: {
    ...StyleSheet.absoluteFill,
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: { flex: 1 },
  title: { fontSize: 15, fontWeight: '600', color: COLORS.textPrimary },
  titleDone: { textDecorationLine: 'line-through', color: COLORS.textSecondary },
  description: { fontSize: 12, color: COLORS.textSecondary, marginTop: 2 },
  meta: { flexDirection: 'row', alignItems: 'center', marginTop: 6, gap: 6, flexWrap: 'wrap' },
  dateBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
  },
  date: { fontSize: 11, color: COLORS.textTertiary },
  projectBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
  },
  projectText: { fontSize: 10, fontWeight: '700' },
  priorityBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
    gap: 4,
  },
  priorityDot: {
    width: 5,
    height: 5,
    borderRadius: 2.5,
  },
  priorityText: { fontSize: 10, fontWeight: '700' },
  deleteAction: {
    backgroundColor: COLORS.error,
    justifyContent: 'center',
    alignItems: 'center',
    width: 90,
    borderRadius: 14,
    marginBottom: 8,
    marginLeft: 8,
    gap: 4,
  },
  completeAction: {
    backgroundColor: COLORS.success,
    justifyContent: 'center',
    alignItems: 'center',
    width: 90,
    borderRadius: 14,
    marginBottom: 8,
    marginRight: 8,
    gap: 4,
  },
  actionText: {
    color: '#fff',
    fontSize: 11,
    fontWeight: '600',
  },
});
