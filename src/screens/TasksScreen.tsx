import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TextInput,
  Pressable,
  Modal,
  StyleSheet,
} from 'react-native';
import Animated from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { COLORS, SHADOWS, PRIORITY_COLORS, PRIORITY_LABELS } from '../utils/colors';
import { useTasks } from '../context/TaskContext';
import { useNotifications } from '../context/NotificationsContext';
import { TaskPriority } from '../types';
import { today } from '../utils/helpers';
import { useFadeIn } from '../hooks/useFadeIn';
import { useStagger } from '../hooks/useStagger';

const FILTERS = ['Todas', 'Hoy', 'Pendientes', 'Completadas'];

const PRIORITY_BG: Record<string, string> = {
  low: 'rgba(76, 175, 80, 0.10)',
  medium: 'rgba(223, 173, 109, 0.10)',
  high: 'rgba(197, 106, 73, 0.10)',
};

function TaskCard({
  task,
  index,
  onToggle,
}: {
  task: any;
  index: number;
  onToggle: (id: string) => void;
}) {
  const itemAnim = useStagger({ index, staggerDelay: 60, translateY: 16 });
  const prioColor = PRIORITY_COLORS[task.priority || 'medium'] || COLORS.primary;
  const prioLabel = PRIORITY_LABELS[task.priority || 'medium'] || 'Media';
  const prioBg = PRIORITY_BG[task.priority || 'medium'] || PRIORITY_BG.medium;

  return (
    <Animated.View style={itemAnim.animatedStyle}>
      <Pressable
        style={styles.taskCard}
        onPress={() => onToggle(task.id)}
      >
        <View style={[styles.checkbox, task.is_done && styles.checkboxDone]}>
          {task.is_done && (
            <Ionicons name="checkmark" size={14} color={COLORS.surface} />
          )}
        </View>
        <View style={styles.taskContent}>
          <Text style={[styles.taskTitle, task.is_done && styles.taskDone]}>
            {task.title}
          </Text>
          {task.description ? (
            <Text style={styles.taskDescription} numberOfLines={1}>
              {task.description}
            </Text>
          ) : null}
        </View>
        <View style={[styles.priorityBadge, { backgroundColor: prioBg }]}>
          <Text style={[styles.priorityText, { color: prioColor }]}>
            {prioLabel.toUpperCase()}
          </Text>
        </View>
      </Pressable>
    </Animated.View>
  );
}

interface TasksScreenProps {
  onOpenNotifications?: () => void;
}

export default function TasksScreen({ onOpenNotifications }: TasksScreenProps) {
  const { tasks, addTask, toggleTask } = useTasks();
  const { unreadCount } = useNotifications();
  const [filter, setFilter] = useState('Todas');
  const [showModal, setShowModal] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState<TaskPriority>('medium');
  const [dueDate, setDueDate] = useState(today());

  const headerAnim = useFadeIn({ delay: 0, translateY: 15 });
  const titleAnim = useFadeIn({ delay: 100, translateY: 15 });
  const filtersAnim = useFadeIn({ delay: 200, translateY: 15 });

  const filteredTasks = tasks.filter((t) => {
    switch (filter) {
      case 'Hoy':
        return t.due_date === today();
      case 'Pendientes':
        return !t.is_done;
      case 'Completadas':
        return t.is_done;
      default:
        return true;
    }
  });

  const handleAdd = async () => {
    if (!title.trim()) return;
    await addTask({
      title: title.trim(),
      description,
      priority,
      due_date: dueDate,
      project: 'General',
      is_done: false,
    });
    setTitle('');
    setDescription('');
    setPriority('medium');
    setDueDate(today());
    setShowModal(false);
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <Animated.View style={[styles.header, headerAnim.animatedStyle]}>
        <Pressable style={styles.menuButton}>
          <Ionicons name="menu" size={24} color={COLORS.textPrimary} />
        </Pressable>
        <Text style={styles.headerTitle}>Lifestyle</Text>
        <Pressable style={styles.bellButton} onPress={onOpenNotifications}>
          <Ionicons name="notifications-outline" size={22} color={COLORS.textPrimary} />
          {unreadCount > 0 && <View style={styles.badge} />}
        </Pressable>
      </Animated.View>

      <Animated.View style={[styles.titleRow, titleAnim.animatedStyle]}>
        <View>
          <Text style={styles.title}>Tareas</Text>
          <Text style={styles.subtitle}>Organiza tu día con intención</Text>
        </View>
        <Pressable style={styles.sortButton}>
          <Ionicons name="swap-vertical" size={18} color={COLORS.primary} />
        </Pressable>
      </Animated.View>

      <Animated.View style={filtersAnim.animatedStyle}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.filtersRow}
          contentContainerStyle={styles.filtersContent}
        >
          {FILTERS.map((f) => (
            <Pressable
              key={f}
              style={[styles.filterChip, filter === f && styles.filterChipActive]}
              onPress={() => setFilter(f)}
            >
              <Text
                style={[styles.filterText, filter === f && styles.filterTextActive]}
              >
                {f}
              </Text>
            </Pressable>
          ))}
        </ScrollView>
      </Animated.View>

      <ScrollView style={styles.list} showsVerticalScrollIndicator={false}>
        {filteredTasks.length === 0 ? (
          <View style={styles.emptyCard}>
            <Ionicons name="checkmark-done-circle-outline" size={48} color={COLORS.textTertiary} />
            <Text style={styles.emptyTitle}>No hay tareas</Text>
            <Text style={styles.emptyText}>Crea tu primera tarea</Text>
          </View>
        ) : (
          filteredTasks.map((task, index) => (
            <TaskCard
              key={task.id}
              task={task}
              index={index}
              onToggle={toggleTask}
            />
          ))
        )}
        <View style={{ height: 100 }} />
      </ScrollView>

      <Pressable style={styles.fab} onPress={() => setShowModal(true)}>
        <Ionicons name="add" size={28} color={COLORS.surface} />
      </Pressable>

      <Modal visible={showModal} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modal}>
            <View style={styles.modalHandle} />
            <Text style={styles.modalTitle}>Nueva Tarea</Text>

            <Text style={styles.inputLabel}>Título</Text>
            <View style={styles.inputContainer}>
              <TextInput
                style={styles.input}
                placeholder="Título de la tarea"
                placeholderTextColor={COLORS.textTertiary}
                value={title}
                onChangeText={setTitle}
              />
            </View>

            <Text style={styles.inputLabel}>Descripción</Text>
            <View style={styles.inputContainer}>
              <TextInput
                style={styles.input}
                placeholder="Descripción (opcional)"
                placeholderTextColor={COLORS.textTertiary}
                value={description}
                onChangeText={setDescription}
                multiline
              />
            </View>

            <Text style={styles.inputLabel}>Prioridad</Text>
            <View style={styles.priorityRow}>
              {(Object.keys(PRIORITY_COLORS) as TaskPriority[]).map((p) => (
                <Pressable
                  key={p}
                  style={[
                    styles.priorityChip,
                    priority === p && {
                      backgroundColor: PRIORITY_BG[p],
                      borderColor: PRIORITY_COLORS[p],
                    },
                  ]}
                  onPress={() => setPriority(p)}
                >
                  <Text
                    style={[
                      styles.priorityChipText,
                      { color: priority === p ? PRIORITY_COLORS[p] : COLORS.textTertiary },
                    ]}
                  >
                    {PRIORITY_LABELS[p].toUpperCase()}
                  </Text>
                </Pressable>
              ))}
            </View>

            <View style={styles.modalButtons}>
              <Pressable
                style={styles.cancelButton}
                onPress={() => setShowModal(false)}
              >
                <Text style={styles.cancelText}>Cancelar</Text>
              </Pressable>
              <Pressable style={styles.saveButton} onPress={handleAdd}>
                <Text style={styles.saveText}>Crear</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  menuButton: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: COLORS.surface,
    alignItems: 'center',
    justifyContent: 'center',
    ...SHADOWS.small,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  bellButton: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: COLORS.surface,
    alignItems: 'center',
    justifyContent: 'center',
    ...SHADOWS.small,
  },
  badge: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: COLORS.error,
    borderWidth: 2,
    borderColor: COLORS.surface,
  },
  titleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  subtitle: {
    fontSize: 13,
    color: COLORS.textTertiary,
    marginTop: 2,
  },
  sortButton: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: COLORS.surface,
    alignItems: 'center',
    justifyContent: 'center',
    ...SHADOWS.small,
  },
  filtersRow: {
    marginBottom: 12,
  },
  filtersContent: {
    paddingHorizontal: 20,
    gap: 8,
  },
  filterChip: {
    paddingHorizontal: 18,
    paddingVertical: 12,
    borderRadius: 22,
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.divider,
    minHeight: 44,
    justifyContent: 'center',
  },
  filterChipActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  filterText: {
    fontSize: 13,
    color: COLORS.textSecondary,
    fontWeight: '600',
  },
  filterTextActive: {
    color: COLORS.surface,
  },
  list: {
    flex: 1,
    paddingHorizontal: 20,
  },
  emptyCard: {
    backgroundColor: COLORS.surface,
    borderRadius: 16,
    padding: 32,
    alignItems: 'center',
    gap: 8,
    ...SHADOWS.small,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.textPrimary,
  },
  emptyText: {
    fontSize: 13,
    color: COLORS.textTertiary,
  },
  taskCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    borderRadius: 14,
    padding: 16,
    marginBottom: 10,
    minHeight: 56,
    ...SHADOWS.small,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: COLORS.divider,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  checkboxDone: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  taskContent: {
    flex: 1,
  },
  taskTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: COLORS.textPrimary,
  },
  taskDone: {
    textDecorationLine: 'line-through',
    color: COLORS.textTertiary,
  },
  taskDescription: {
    fontSize: 12,
    color: COLORS.textTertiary,
    marginTop: 2,
  },
  priorityBadge: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 6,
    marginLeft: 8,
    minHeight: 28,
    justifyContent: 'center',
  },
  priorityText: {
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  fab: {
    position: 'absolute',
    bottom: 90,
    alignSelf: 'center',
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: COLORS.textPrimary,
    alignItems: 'center',
    justifyContent: 'center',
    ...SHADOWS.fab,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: COLORS.overlay,
    justifyContent: 'flex-end',
  },
  modal: {
    backgroundColor: COLORS.surface,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
  },
  modalHandle: {
    width: 36,
    height: 4,
    borderRadius: 2,
    backgroundColor: COLORS.divider,
    alignSelf: 'center',
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: COLORS.textPrimary,
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.textSecondary,
    marginBottom: 8,
  },
  inputContainer: {
    backgroundColor: COLORS.surfaceSecondary,
    borderRadius: 12,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: COLORS.divider,
    marginBottom: 16,
  },
  input: {
    paddingVertical: 14,
    fontSize: 15,
    color: COLORS.textPrimary,
  },
  priorityRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 20,
  },
  priorityChip: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: COLORS.divider,
    minHeight: 44,
    justifyContent: 'center',
  },
  priorityChipText: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  modalButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  cancelButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    backgroundColor: COLORS.surfaceSecondary,
    borderWidth: 1,
    borderColor: COLORS.divider,
    minHeight: 48,
    justifyContent: 'center',
  },
  cancelText: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.textSecondary,
  },
  saveButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    backgroundColor: COLORS.primary,
    minHeight: 48,
    justifyContent: 'center',
  },
  saveText: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.surface,
  },
});
