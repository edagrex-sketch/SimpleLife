import React, { useState } from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSpring,
  Easing,
} from 'react-native-reanimated';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { Task } from '../types';
import { COLORS } from '../utils/colors';
import { hapticLight } from '../hooks/useHaptic';

interface TaskCompletedSectionProps {
  tasks: Task[];
  onToggle: (id: string) => void;
}

export default function TaskCompletedSection({ tasks, onToggle }: TaskCompletedSectionProps) {
  const [expanded, setExpanded] = useState(false);
  const rotation = useSharedValue(0);
  const height = useSharedValue(0);

  const toggleExpanded = () => {
    hapticLight();
    const next = !expanded;
    setExpanded(next);
    rotation.value = withSpring(next ? 90 : 0, { damping: 15, stiffness: 200 });
  };

  const chevronStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${rotation.value}deg` }],
  }));

  if (tasks.length === 0) return null;

  return (
    <View style={styles.container}>
      <Pressable style={styles.header} onPress={toggleExpanded}>
        <View style={styles.headerLeft}>
          <Ionicons name="checkmark-circle" size={20} color={COLORS.success} />
          <Text style={styles.headerTitle}>Tareas Completadas</Text>
          <Text style={styles.headerCount}>({tasks.length})</Text>
        </View>
        <Animated.View style={chevronStyle}>
          <Ionicons name="chevron-forward" size={18} color={COLORS.textTertiary} />
        </Animated.View>
      </Pressable>

      {expanded && (
        <View style={styles.list}>
          {tasks.map((task) => (
            <Pressable
              key={task.id}
              style={styles.taskRow}
              onPress={() => onToggle(task.id)}
            >
              <View style={styles.checkDone}>
                <Ionicons name="checkmark" size={14} color={COLORS.success} />
              </View>
              <Text style={styles.taskTitle} numberOfLines={1}>{task.title}</Text>
            </Pressable>
          ))}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginTop: 8,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 4,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  headerCount: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.textTertiary,
  },
  list: {
    paddingBottom: 8,
  },
  taskRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 4,
    gap: 10,
  },
  checkDone: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: COLORS.success + '20',
    alignItems: 'center',
    justifyContent: 'center',
  },
  taskTitle: {
    fontSize: 14,
    color: COLORS.textSecondary,
    textDecorationLine: 'line-through',
    flex: 1,
  },
});
