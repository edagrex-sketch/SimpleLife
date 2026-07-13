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
import { COLORS } from '../utils/colors';
import { useTasks } from '../context/TaskContext';
import { TaskPriority } from '../types';
import { today } from '../utils/helpers';
import { useFadeIn } from '../hooks/useFadeIn';
import { useStagger } from '../hooks/useStagger';

const FILTERS = ['Todas', 'Hoy', 'Pendientes', 'Completadas'];

const PRIORITY_CONFIG: Record<TaskPriority, { label: string; color: string; bg: string }> = {
  high: { label: 'ALTA', color: '#C56A49', bg: '#FDEEE8' },
  medium: { label: 'MEDIA', color: '#DFAD6D', bg: '#FDF5E6' },
  low: { label: 'BAJA', color: '#91AC9F', bg: '#EEF4F0' },
};

export default function TasksScreen() {
  const { tasks, addTask, toggleTask } = useTasks();
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
      {/* Header */}
      <Animated.View style={[styles.header, headerAnim.animatedStyle]}>
        <Pressable style={styles.menuButton}>
          <Ionicons name="menu" size={24} color="#3D2B1F" />
        </Pressable>
        <Text style={styles.headerTitle}>Lifestyle</Text>
        <Pressable style={styles.bellButton}>
          <Ionicons name="notifications-outline" size={22} color="#3D2B1F" />
        </Pressable>
      </Animated.View>

      <Animated.View style={[styles.titleRow, titleAnim.animatedStyle]}>
        <View>
          <Text style={styles.title}>Tareas</Text>
          <Text style={styles.subtitle}>Organiza tu día con intención</Text>
        </View>
        <Pressable style={styles.sortButton}>
          <Ionicons name="swap-vertical" size={18} color="#C56A49" />
        </Pressable>
      </Animated.View>

      {/* Filters */}
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

      {/* Tasks List */}
      <ScrollView style={styles.list} showsVerticalScrollIndicator={false}>
        {filteredTasks.length === 0 ? (
          <View style={styles.emptyCard}>
            <Ionicons name="checkmark-done-circle-outline" size={48} color="#CCC" />
            <Text style={styles.emptyTitle}>No hay tareas</Text>
            <Text style={styles.emptyText}>Crea tu primera tarea</Text>
          </View>
        ) : (
          filteredTasks.map((task, index) => {
            const pConfig = PRIORITY_CONFIG[task.priority || 'medium'];
            const itemAnim = useStagger({ index, staggerDelay: 60, translateY: 16 });
            return (
              <Animated.View key={task.id} style={itemAnim.animatedStyle}>
                <Pressable
                  style={styles.taskCard}
                  onPress={() => toggleTask(task.id)}
                >
                  <View style={[styles.checkbox, task.is_done && styles.checkboxDone]}>
                    {task.is_done && (
                      <Ionicons name="checkmark" size={14} color="#FFFFFF" />
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
                  <View style={[styles.priorityBadge, { backgroundColor: pConfig.bg }]}>
                    <Text style={[styles.priorityText, { color: pConfig.color }]}>
                      {pConfig.label}
                    </Text>
                  </View>
                </Pressable>
              </Animated.View>
            );
          })
        )}
        <View style={{ height: 100 }} />
      </ScrollView>

      {/* FAB */}
      <Pressable style={styles.fab} onPress={() => setShowModal(true)}>
        <Ionicons name="add" size={28} color="#FFFFFF" />
      </Pressable>

      {/* Add Modal */}
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
                placeholderTextColor="#BBBBBB"
                value={title}
                onChangeText={setTitle}
              />
            </View>

            <Text style={styles.inputLabel}>Descripción</Text>
            <View style={styles.inputContainer}>
              <TextInput
                style={styles.input}
                placeholder="Descripción (opcional)"
                placeholderTextColor="#BBBBBB"
                value={description}
                onChangeText={setDescription}
                multiline
              />
            </View>

            <Text style={styles.inputLabel}>Prioridad</Text>
            <View style={styles.priorityRow}>
              {(Object.keys(PRIORITY_CONFIG) as TaskPriority[]).map((p) => (
                <Pressable
                  key={p}
                  style={[
                    styles.priorityChip,
                    priority === p && {
                      backgroundColor: PRIORITY_CONFIG[p].bg,
                      borderColor: PRIORITY_CONFIG[p].color,
                    },
                  ]}
                  onPress={() => setPriority(p)}
                >
                  <Text
                    style={[
                      styles.priorityChipText,
                      { color: priority === p ? PRIORITY_CONFIG[p].color : '#AA9A8A' },
                    ]}
                  >
                    {PRIORITY_CONFIG[p].label}
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
    backgroundColor: '#F5F0EB',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  menuButton: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#3D2B1F',
  },
  bellButton: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
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
    color: '#3D2B1F',
  },
  subtitle: {
    fontSize: 13,
    color: '#AA9A8A',
    marginTop: 2,
  },
  sortButton: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
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
    paddingVertical: 10,
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#EDE8E3',
  },
  filterChipActive: {
    backgroundColor: '#C56A49',
    borderColor: '#C56A49',
  },
  filterText: {
    fontSize: 13,
    color: '#8A7A6A',
    fontWeight: '600',
  },
  filterTextActive: {
    color: '#FFFFFF',
  },
  list: {
    flex: 1,
    paddingHorizontal: 20,
  },
  emptyCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 32,
    alignItems: 'center',
    gap: 8,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#3D2B1F',
  },
  emptyText: {
    fontSize: 13,
    color: '#AA9A8A',
  },
  taskCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 16,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 1,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#EDE8E3',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  checkboxDone: {
    backgroundColor: '#C56A49',
    borderColor: '#C56A49',
  },
  taskContent: {
    flex: 1,
  },
  taskTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#3D2B1F',
  },
  taskDone: {
    textDecorationLine: 'line-through',
    color: '#AA9A8A',
  },
  taskDescription: {
    fontSize: 12,
    color: '#AA9A8A',
    marginTop: 2,
  },
  priorityBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
    marginLeft: 8,
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
    backgroundColor: '#3D2B1F',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#3D2B1F',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'flex-end',
  },
  modal: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
  },
  modalHandle: {
    width: 36,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#EDE8E3',
    alignSelf: 'center',
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#3D2B1F',
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: '#5A4A3A',
    marginBottom: 8,
  },
  inputContainer: {
    backgroundColor: '#F9F6F2',
    borderRadius: 12,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: '#EDE8E3',
    marginBottom: 16,
  },
  input: {
    paddingVertical: 14,
    fontSize: 15,
    color: '#3D2B1F',
  },
  priorityRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 20,
  },
  priorityChip: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 10,
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: '#EDE8E3',
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
    backgroundColor: '#F9F6F2',
    borderWidth: 1,
    borderColor: '#EDE8E3',
  },
  cancelText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#8A7A6A',
  },
  saveButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    backgroundColor: '#C56A49',
  },
  saveText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
  },
});
