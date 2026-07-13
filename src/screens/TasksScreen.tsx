import React, { useState } from 'react';
import { View, Text, ScrollView, TextInput, Pressable, Modal, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import TaskCard from '../components/TaskCard';
import EmptyState from '../components/EmptyState';
import { COLORS, PRIORITY_COLORS, PRIORITY_LABELS } from '../utils/colors';
import { useTasks } from '../context/TaskContext';
import { TaskPriority } from '../types';
import { today } from '../utils/helpers';

const FILTERS = ['Todas', 'Hoy', 'Pendientes', 'Completadas'];
const PRIORITIES: TaskPriority[] = ['low', 'medium', 'high'];

export default function TasksScreen() {
  const { tasks, addTask, toggleTask, deleteTask } = useTasks();
  const [filter, setFilter] = useState('Todas');
  const [showModal, setShowModal] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState<TaskPriority>('medium');
  const [dueDate, setDueDate] = useState(today());

  const filteredTasks = tasks.filter(t => {
    switch (filter) {
      case 'Hoy': return t.due_date === today();
      case 'Pendientes': return !t.is_done;
      case 'Completadas': return t.is_done;
      default: return true;
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
      <View style={styles.header}>
        <Text style={styles.title}>Tareas</Text>
        <Text style={styles.count}>{tasks.length} tareas</Text>
      </View>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filtersRow}>
        {FILTERS.map(f => (
          <Pressable key={f} style={[styles.filterChip, filter === f && styles.filterChipActive]} onPress={() => setFilter(f)}>
            <Text style={[styles.filterText, filter === f && styles.filterTextActive]}>{f}</Text>
          </Pressable>
        ))}
      </ScrollView>

      <ScrollView style={styles.list} showsVerticalScrollIndicator={false}>
        {filteredTasks.length === 0 ? (
          <EmptyState icon="📋" title="No hay tareas" subtitle="Crea tu primera tarea" />
        ) : (
          filteredTasks.map(task => (
            <TaskCard
              key={task.id}
              task={task}
              onToggle={() => toggleTask(task.id)}
              onPress={() => {}}
            />
          ))
        )}
        <View style={{ height: 100 }} />
      </ScrollView>

      <Pressable style={styles.fab} onPress={() => setShowModal(true)}>
        <Text style={styles.fabText}>+</Text>
      </Pressable>

      <Modal visible={showModal} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modal}>
            <Text style={styles.modalTitle}>Nueva Tarea</Text>
            <TextInput style={styles.input} placeholder="Título" placeholderTextColor={COLORS.textTertiary} value={title} onChangeText={setTitle} />
            <TextInput style={styles.input} placeholder="Descripción" placeholderTextColor={COLORS.textTertiary} value={description} onChangeText={setDescription} multiline />
            <Text style={styles.label}>Prioridad</Text>
            <View style={styles.priorityRow}>
              {PRIORITIES.map(p => (
                <Pressable key={p} style={[styles.priorityChip, priority === p && { backgroundColor: PRIORITY_COLORS[p] + '30', borderColor: PRIORITY_COLORS[p] }]} onPress={() => setPriority(p)}>
                  <Text style={[styles.priorityChipText, { color: PRIORITY_COLORS[p] }]}>{PRIORITY_LABELS[p]}</Text>
                </Pressable>
              ))}
            </View>
            <Text style={styles.label}>Fecha</Text>
            <TextInput style={styles.input} value={dueDate} onChangeText={setDueDate} placeholder="YYYY-MM-DD" />
            <View style={styles.modalButtons}>
              <Pressable style={styles.cancelButton} onPress={() => setShowModal(false)}>
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
  container: { flex: 1, backgroundColor: COLORS.background },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, paddingTop: 20 },
  title: { fontSize: 28, fontWeight: '700', color: COLORS.textPrimary },
  count: { fontSize: 13, color: COLORS.textSecondary },
  filtersRow: { paddingHorizontal: 20, marginTop: 16, marginBottom: 12 },
  filterChip: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20, backgroundColor: COLORS.surface, marginRight: 8, borderWidth: 1, borderColor: COLORS.divider },
  filterChipActive: { backgroundColor: COLORS.primary, borderColor: COLORS.primary },
  filterText: { fontSize: 13, color: COLORS.textSecondary, fontWeight: '500' },
  filterTextActive: { color: '#fff' },
  list: { flex: 1, paddingHorizontal: 20 },
  fab: {
    position: 'absolute', bottom: 20, right: 20, width: 56, height: 56, borderRadius: 28,
    backgroundColor: COLORS.primary, alignItems: 'center', justifyContent: 'center',
    shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.2, shadowRadius: 8, elevation: 6,
  },
  fabText: { fontSize: 28, color: '#fff', lineHeight: 30 },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'flex-end' },
  modal: { backgroundColor: COLORS.surface, borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 24, gap: 12 },
  modalTitle: { fontSize: 20, fontWeight: '700', color: COLORS.textPrimary, marginBottom: 8 },
  input: { backgroundColor: COLORS.background, borderRadius: 12, paddingHorizontal: 14, paddingVertical: 12, fontSize: 14, color: COLORS.textPrimary },
  label: { fontSize: 13, fontWeight: '600', color: COLORS.textSecondary, marginTop: 4 },
  priorityRow: { flexDirection: 'row', gap: 8 },
  priorityChip: { flex: 1, paddingVertical: 8, borderRadius: 10, alignItems: 'center', borderWidth: 1.5, borderColor: COLORS.divider },
  priorityChipText: { fontSize: 12, fontWeight: '600' },
  modalButtons: { flexDirection: 'row', gap: 12, marginTop: 16 },
  cancelButton: { flex: 1, paddingVertical: 14, borderRadius: 12, alignItems: 'center', backgroundColor: COLORS.background },
  cancelText: { fontSize: 14, fontWeight: '600', color: COLORS.textSecondary },
  saveButton: { flex: 1, paddingVertical: 14, borderRadius: 12, alignItems: 'center', backgroundColor: COLORS.primary },
  saveText: { fontSize: 14, fontWeight: '600', color: '#fff' },
});
