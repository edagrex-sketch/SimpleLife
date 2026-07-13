import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import GlassBox from './GlassBox';
import { Task } from '../types';
import { COLORS, PRIORITY_COLORS, PRIORITY_LABELS } from '../utils/colors';
import { formatDateShort } from '../utils/helpers';

interface TaskCardProps {
  task: Task;
  onToggle: () => void;
  onPress: () => void;
}

export default function TaskCard({ task, onToggle, onPress }: TaskCardProps) {
  const priorityColor = PRIORITY_COLORS[task.priority] || COLORS.textSecondary;
  const isDone = task.is_done;

  return (
    <Pressable onPress={onPress}>
      <GlassBox style={[styles.card, isDone ? styles.doneCard : undefined]}>
        <View style={styles.row}>
          <Pressable onPress={onToggle} style={styles.checkbox}>
            <View style={[styles.checkboxInner, isDone && styles.checkboxDone]}>
              {isDone && <Text style={styles.checkmark}>✓</Text>}
            </View>
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
                <Text style={styles.date}>{formatDateShort(task.due_date)}</Text>
              )}
              <View style={[styles.priorityBadge, { backgroundColor: priorityColor + '20' }]}>
                <Text style={[styles.priorityText, { color: priorityColor }]}>
                  {PRIORITY_LABELS[task.priority]}
                </Text>
              </View>
            </View>
          </View>
        </View>
      </GlassBox>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: { marginBottom: 8, paddingVertical: 12, paddingHorizontal: 14 },
  doneCard: { opacity: 0.6 },
  row: { flexDirection: 'row', alignItems: 'center' },
  checkbox: { width: 24, height: 24, marginRight: 12 },
  checkboxInner: {
    width: 24, height: 24, borderRadius: 12, borderWidth: 2,
    borderColor: COLORS.primary, alignItems: 'center', justifyContent: 'center',
  },
  checkboxDone: { backgroundColor: COLORS.primary },
  checkmark: { color: '#fff', fontSize: 12, fontWeight: '700' },
  content: { flex: 1 },
  title: { fontSize: 15, fontWeight: '600', color: COLORS.textPrimary },
  titleDone: { textDecorationLine: 'line-through', color: COLORS.textSecondary },
  description: { fontSize: 12, color: COLORS.textSecondary, marginTop: 2 },
  meta: { flexDirection: 'row', alignItems: 'center', marginTop: 6, gap: 8 },
  date: { fontSize: 11, color: COLORS.textTertiary },
  priorityBadge: { paddingHorizontal: 8, paddingVertical: 2, borderRadius: 10 },
  priorityText: { fontSize: 10, fontWeight: '600' },
});
