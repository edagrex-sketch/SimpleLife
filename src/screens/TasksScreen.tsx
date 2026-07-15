import React, { useState, useMemo, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  TextInput,
  Pressable,
  Modal,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  RefreshControl,
  Alert,
} from 'react-native';
import Animated from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { COLORS, SHADOWS, PRIORITY_COLORS, PRIORITY_LABELS, CATEGORY_COLORS } from '../utils/colors';
import { useTasks } from '../context/TaskContext';
import { useNotifications } from '../context/NotificationsContext';
import { Task, TaskPriority } from '../types';
import { today } from '../utils/helpers';
import { useFadeIn } from '../hooks/useFadeIn';
import { hapticLight, hapticMedium, hapticSuccess } from '../hooks/useHaptic';
import TaskCard from '../components/TaskCard';
import TaskFilters from '../components/TaskFilters';
import TaskEmptyState from '../components/TaskEmptyState';
import TaskCompletedSection from '../components/TaskCompletedSection';

const PROJECTS = ['General', 'Trabajo', 'Personal', 'Salud', 'Finanzas', 'Educación'];

interface TasksScreenProps {
  onOpenNotifications?: () => void;
}

export default function TasksScreen({ onOpenNotifications }: TasksScreenProps) {
  const { tasks, addTask, toggleTask, deleteTask } = useTasks();
  const { unreadCount } = useNotifications();
  const [filter, setFilter] = useState('Todas');
  const [showModal, setShowModal] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState<TaskPriority>('media');
  const [dueDate, setDueDate] = useState(today());
  const [project, setProject] = useState('General');
  const [refreshing, setRefreshing] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const headerAnim = useFadeIn({ delay: 0, translateY: 15 });
  const titleAnim = useFadeIn({ delay: 100, translateY: 15 });

  const pendingTasks = useMemo(() => tasks.filter((t) => !t.is_done), [tasks]);
  const completedTasks = useMemo(() => tasks.filter((t) => !!t.is_done), [tasks]);

  const filteredTasks = useMemo(() => {
    return pendingTasks.filter((t) => {
      switch (filter) {
        case 'Hoy':
          return t.due_date === today();
        case 'Pendientes':
          return true;
        default:
          return true;
      }
    });
  }, [pendingTasks, filter]);

  const filteredCompleted = useMemo(() => {
    if (filter === 'Completadas') return completedTasks;
    if (filter === 'Hoy') return completedTasks.filter((t) => t.due_date === today());
    return [];
  }, [completedTasks, filter]);

  const filterCounts = useMemo(() => ({
    Todas: pendingTasks.length,
    Hoy: pendingTasks.filter((t) => t.due_date === today()).length,
    Pendientes: pendingTasks.length,
    Completadas: completedTasks.length,
  }), [pendingTasks, completedTasks]);

  const filters = useMemo(() => [
    { id: 'Todas', label: 'Todas', count: filterCounts.Todas },
    { id: 'Hoy', label: 'Hoy', count: filterCounts.Hoy },
    { id: 'Pendientes', label: 'Pendientes', count: filterCounts.Pendientes },
  ], [filterCounts]);

  const showCompleted = filter === 'Todas' || filter === 'Completadas';

  const handleAdd = async () => {
    if (!title.trim()) return;
    setSubmitting(true);
    hapticSuccess();
    const error = await addTask({
      title: title.trim(),
      description,
      priority,
      due_date: dueDate,
      project,
      is_done: false,
    });
    setSubmitting(false);
    if (error) {
      Alert.alert('Error', error);
      return;
    }
    resetForm();
    setShowModal(false);
  };

  const resetForm = () => {
    setTitle('');
    setDescription('');
    setPriority('media');
    setDueDate(today());
    setProject('General');
  };

  const handleToggle = useCallback(async (taskId: string) => {
    await toggleTask(taskId);
  }, [toggleTask]);

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    await new Promise<void>((r) => setTimeout(r, 800));
    setRefreshing(false);
  }, []);

  const generateDateOptions = () => {
    const dates: { label: string; value: string }[] = [];
    const now = new Date();
    for (let i = 0; i < 14; i++) {
      const d = new Date(now);
      d.setDate(d.getDate() + i);
      const dateStr = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
      let label = '';
      if (i === 0) label = 'Hoy';
      else if (i === 1) label = 'Mañana';
      else {
        const days = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
        label = `${days[d.getDay()]} ${d.getDate()}`;
      }
      dates.push({ label, value: dateStr });
    }
    return dates;
  };

  const dateOptions = generateDateOptions();

  const ListHeader = () => (
    <>
      <TaskFilters
        filters={filters}
        activeFilter={filter}
        onFilterPress={setFilter}
      />
      {filteredTasks.length === 0 && filter !== 'Completadas' && (
        <TaskEmptyState filter={filter} />
      )}
    </>
  );

  const ListFooter = () => (
    <>
      {showCompleted && filteredCompleted.length > 0 && (
        <View style={styles.completedSection}>
          <TaskCompletedSection
            tasks={filteredCompleted}
            onToggle={handleToggle}
          />
        </View>
      )}
      {filter === 'Completadas' && filteredCompleted.length === 0 && (
        <TaskEmptyState filter="Completadas" />
      )}
      <View style={{ height: 120 }} />
    </>
  );

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <Animated.View style={[styles.header, headerAnim.animatedStyle]}>
        <Pressable style={styles.menuButton}>
          <Ionicons name="menu" size={22} color={COLORS.textPrimary} />
        </Pressable>
        <Text style={styles.headerTitle}>Tareas</Text>
        <Pressable style={styles.bellButton} onPress={onOpenNotifications}>
          <Ionicons name="notifications-outline" size={22} color={COLORS.textPrimary} />
          {unreadCount > 0 && <View style={styles.badge} />}
        </Pressable>
      </Animated.View>

      <Animated.View style={[styles.titleRow, titleAnim.animatedStyle]}>
        <View>
          <Text style={styles.title}>Mis Tareas</Text>
          <Text style={styles.subtitle}>Tienes {pendingTasks.length} tareas pendientes para hoy.</Text>
        </View>
      </Animated.View>

      <FlatList
        data={filteredTasks}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <TaskCard
            task={item}
            onToggle={() => handleToggle(item.id)}
          />
        )}
        ListHeaderComponent={ListHeader}
        ListFooterComponent={ListFooter}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            tintColor={COLORS.primary}
          />
        }
        keyboardDismissMode="on-drag"
        keyboardShouldPersistTaps="handled"
      />

      <Pressable style={styles.fab} onPress={() => { hapticMedium(); setShowModal(true); }}>
        <Ionicons name="add" size={28} color={COLORS.surface} />
      </Pressable>

      <Modal visible={showModal} animationType="slide" transparent>
        <KeyboardAvoidingView
          style={styles.modalOverlay}
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
          <Pressable style={styles.modalOverlayBg} onPress={() => setShowModal(false)} />
          <View style={styles.modal}>
            <View style={styles.modalHandle} />
            <Text style={styles.modalTitle}>Nueva Tarea</Text>

            <Text style={styles.inputLabel}>Título *</Text>
            <View style={styles.inputContainer}>
              <TextInput
                style={styles.input}
                placeholder="¿Qué necesitas hacer?"
                placeholderTextColor={COLORS.textTertiary}
                value={title}
                onChangeText={setTitle}
                autoFocus
              />
            </View>

            <Text style={styles.inputLabel}>Descripción</Text>
            <View style={styles.inputContainer}>
              <TextInput
                style={styles.input}
                placeholder="Detalles (opcional)"
                placeholderTextColor={COLORS.textTertiary}
                value={description}
                onChangeText={setDescription}
                multiline
              />
            </View>

            <Text style={styles.inputLabel}>Fecha</Text>
            <FlatList
              horizontal
              data={dateOptions}
              showsHorizontalScrollIndicator={false}
              keyExtractor={(item) => item.value}
              contentContainerStyle={styles.dateList}
              renderItem={({ item }) => (
                <Pressable
                  style={[styles.dateChip, dueDate === item.value && styles.dateChipActive]}
                  onPress={() => { hapticLight(); setDueDate(item.value); }}
                >
                  <Text style={[styles.dateChipText, dueDate === item.value && styles.dateChipTextActive]}>
                    {item.label}
                  </Text>
                </Pressable>
              )}
            />

            <Text style={styles.inputLabel}>Proyecto</Text>
            <FlatList
              horizontal
              data={PROJECTS}
              showsHorizontalScrollIndicator={false}
              keyExtractor={(item) => item}
              contentContainerStyle={styles.projectList}
              renderItem={({ item }) => (
                <Pressable
                  style={[
                    styles.projectChip,
                    project === item && { backgroundColor: (CATEGORY_COLORS[item] || COLORS.primary) + '20', borderColor: CATEGORY_COLORS[item] || COLORS.primary },
                  ]}
                  onPress={() => { hapticLight(); setProject(item); }}
                >
                  <View style={[styles.projectDot, { backgroundColor: CATEGORY_COLORS[item] || COLORS.primary }]} />
                  <Text style={[
                    styles.projectChipText,
                    project === item && { color: CATEGORY_COLORS[item] || COLORS.primary },
                  ]}>
                    {item}
                  </Text>
                </Pressable>
              )}
            />

            <Text style={styles.inputLabel}>Prioridad</Text>
            <View style={styles.priorityRow}>
              {(Object.keys(PRIORITY_COLORS) as TaskPriority[]).map((p) => (
                <Pressable
                  key={p}
                  style={[
                    styles.priorityChip,
                    priority === p && {
                      backgroundColor: PRIORITY_COLORS[p] + '15',
                      borderColor: PRIORITY_COLORS[p],
                    },
                  ]}
                  onPress={() => { hapticLight(); setPriority(p); }}
                >
                  <View style={[styles.priorityDot, { backgroundColor: PRIORITY_COLORS[p] }]} />
                  <Text
                    style={[
                      styles.priorityChipText,
                      { color: priority === p ? PRIORITY_COLORS[p] : COLORS.textSecondary },
                    ]}
                  >
                    {PRIORITY_LABELS[p]}
                  </Text>
                </Pressable>
              ))}
            </View>

            <View style={styles.modalButtons}>
              <Pressable
                style={styles.cancelButton}
                onPress={() => { hapticLight(); setShowModal(false); resetForm(); }}
              >
                <Text style={styles.cancelText}>Cancelar</Text>
              </Pressable>
              <Pressable
                style={[styles.saveButton, (!title.trim() || submitting) && styles.saveButtonDisabled]}
                onPress={handleAdd}
                disabled={!title.trim() || submitting}
              >
                <Text style={styles.saveText}>{submitting ? 'Creando...' : 'Crear'}</Text>
              </Pressable>
            </View>
          </View>
        </KeyboardAvoidingView>
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
    borderRadius: 14,
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
    borderRadius: 14,
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
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  title: {
    fontSize: 26,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  subtitle: {
    fontSize: 14,
    color: COLORS.textSecondary,
    marginTop: 4,
  },
  list: {
    paddingHorizontal: 20,
  },
  completedSection: {
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: COLORS.divider,
  },
  fab: {
    position: 'absolute',
    bottom: 100,
    right: 24,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
    ...SHADOWS.fab,
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  modalOverlayBg: {
    ...StyleSheet.absoluteFill,
    backgroundColor: COLORS.overlay,
  },
  modal: {
    backgroundColor: COLORS.surface,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    padding: 24,
    maxHeight: '85%',
  },
  modalHandle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: COLORS.divider,
    alignSelf: 'center',
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 22,
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
  dateList: {
    gap: 8,
    marginBottom: 16,
  },
  dateChip: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 12,
    backgroundColor: COLORS.surfaceSecondary,
    borderWidth: 1,
    borderColor: COLORS.divider,
    minHeight: 44,
    justifyContent: 'center',
  },
  dateChipActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  dateChipText: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.textSecondary,
  },
  dateChipTextActive: {
    color: COLORS.surface,
  },
  projectList: {
    gap: 8,
    marginBottom: 16,
  },
  projectChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 12,
    backgroundColor: COLORS.surfaceSecondary,
    borderWidth: 1,
    borderColor: COLORS.divider,
    gap: 6,
    minHeight: 44,
  },
  projectDot: {
    width: 7,
    height: 7,
    borderRadius: 3.5,
  },
  projectChipText: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.textSecondary,
  },
  priorityRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 24,
  },
  priorityChip: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: COLORS.divider,
    gap: 6,
    minHeight: 44,
  },
  priorityDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  priorityChipText: {
    fontSize: 12,
    fontWeight: '600',
  },
  modalButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  cancelButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 14,
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
    borderRadius: 14,
    alignItems: 'center',
    backgroundColor: COLORS.primary,
    minHeight: 48,
    justifyContent: 'center',
  },
  saveButtonDisabled: {
    opacity: 0.5,
  },
  saveText: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.surface,
  },
});
