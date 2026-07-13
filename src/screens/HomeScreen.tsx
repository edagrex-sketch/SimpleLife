import React from 'react';
import { View, Text, ScrollView, Pressable, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { COLORS, SHADOWS } from '../utils/colors';
import { useAuth } from '../context/AuthContext';
import { useTasks } from '../context/TaskContext';
import { today } from '../utils/helpers';

export default function HomeScreen() {
  const { profile } = useAuth();
  const { tasks } = useTasks();

  const todayTasks = tasks.filter((t) => t.due_date === today() && !t.is_done);
  const pendingTasks = tasks.filter((t) => !t.is_done);
  const completedTasks = tasks.filter((t) => t.is_done);
  const completionRate =
    tasks.length > 0
      ? Math.round((completedTasks.length / tasks.length) * 100)
      : 0;

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Buenos días';
    if (hour < 18) return 'Buenas tardes';
    return 'Buenas noches';
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scroll}
      >
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.greeting}>
              {getGreeting()}, {profile?.name?.split(' ')[0] || 'amigo'}
            </Text>
            <Text style={styles.date}>
              {new Date().toLocaleDateString('es-MX', {
                weekday: 'long',
                month: 'long',
                day: 'numeric',
              })}
            </Text>
          </View>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>
              {profile?.name?.charAt(0)?.toUpperCase() || 'U'}
            </Text>
          </View>
        </View>

        {/* AI Coach Card */}
        <Pressable style={styles.coachCard}>
          <View style={styles.coachGradient}>
            <View style={styles.coachContent}>
              <View style={styles.coachIconContainer}>
                <Ionicons name="sparkles" size={24} color={COLORS.primary} />
              </View>
              <View style={styles.coachTextContainer}>
                <Text style={styles.coachTitle}>Asistente SimpleLife AI</Text>
                <Text style={styles.coachSubtitle}>
                  Pregúntame lo que quieras
                </Text>
              </View>
            </View>
            <View style={styles.coachButton}>
              <Text style={styles.coachButtonText}>Preguntar</Text>
              <Ionicons name="arrow-forward" size={16} color="#FFFFFF" />
            </View>
          </View>
        </Pressable>

        {/* Stats Row */}
        <View style={styles.statsRow}>
          <View style={[styles.statCard, { backgroundColor: COLORS.primarySurface }]}>
            <View style={[styles.statIcon, { backgroundColor: COLORS.primary }]}>
              <Ionicons name="time-outline" size={18} color="#FFFFFF" />
            </View>
            <Text style={[styles.statNumber, { color: COLORS.primary }]}>
              {pendingTasks.length}
            </Text>
            <Text style={styles.statLabel}>Pendientes</Text>
          </View>
          <View style={[styles.statCard, { backgroundColor: COLORS.tertiarySurface }]}>
            <View style={[styles.statIcon, { backgroundColor: COLORS.tertiary }]}>
              <Ionicons name="sunny-outline" size={18} color="#FFFFFF" />
            </View>
            <Text style={[styles.statNumber, { color: COLORS.tertiary }]}>
              {todayTasks.length}
            </Text>
            <Text style={styles.statLabel}>Hoy</Text>
          </View>
          <View style={[styles.statCard, { backgroundColor: COLORS.secondarySurface }]}>
            <View style={[styles.statIcon, { backgroundColor: COLORS.secondary }]}>
              <Ionicons name="checkmark-circle-outline" size={18} color="#FFFFFF" />
            </View>
            <Text style={[styles.statNumber, { color: COLORS.secondary }]}>
              {completionRate}%
            </Text>
            <Text style={styles.statLabel}>Completado</Text>
          </View>
        </View>

        {/* Today's Tasks */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Tareas de Hoy</Text>
          <Pressable>
            <Text style={styles.sectionLink}>Ver todas</Text>
          </Pressable>
        </View>

        {todayTasks.length === 0 ? (
          <View style={styles.emptyCard}>
            <Ionicons name="checkmark-done-circle-outline" size={48} color={COLORS.textTertiary} />
            <Text style={styles.emptyTitle}>¡Todo listo!</Text>
            <Text style={styles.emptyText}>No hay tareas pendientes para hoy</Text>
          </View>
        ) : (
          todayTasks.slice(0, 3).map((task) => (
            <View key={task.id} style={styles.taskCard}>
              <View style={styles.taskCheckbox}>
                <Ionicons
                  name="ellipse-outline"
                  size={22}
                  color={COLORS.primary}
                />
              </View>
              <View style={styles.taskContent}>
                <Text style={styles.taskTitle}>{task.title}</Text>
                {task.description ? (
                  <Text style={styles.taskDescription} numberOfLines={1}>
                    {task.description}
                  </Text>
                ) : null}
              </View>
              <View
                style={[
                  styles.priorityBadge,
                  {
                    backgroundColor:
                      task.priority === 'high'
                        ? COLORS.primarySurface
                        : task.priority === 'medium'
                        ? COLORS.tertiarySurface
                        : COLORS.secondarySurface,
                  },
                ]}
              >
                <Text
                  style={[
                    styles.priorityText,
                    {
                      color:
                        task.priority === 'high'
                          ? COLORS.primary
                          : task.priority === 'medium'
                          ? COLORS.tertiary
                          : COLORS.secondary,
                    },
                  ]}
                >
                  {task.priority === 'high' ? 'Alta' : task.priority === 'medium' ? 'Media' : 'Baja'}
                </Text>
              </View>
            </View>
          ))
        )}

        <View style={{ height: 120 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  scroll: {
    paddingHorizontal: 20,
    paddingTop: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  greeting: {
    fontSize: 28,
    fontWeight: '700',
    color: COLORS.textPrimary,
    letterSpacing: -0.5,
  },
  date: {
    fontSize: 14,
    color: COLORS.textSecondary,
    marginTop: 4,
    textTransform: 'capitalize',
    fontWeight: '500',
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    fontSize: 20,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  coachCard: {
    marginBottom: 20,
    borderRadius: 20,
    overflow: 'hidden',
    ...SHADOWS.medium,
  },
  coachGradient: {
    backgroundColor: COLORS.surface,
    padding: 20,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: COLORS.divider,
  },
  coachContent: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  coachIconContainer: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: COLORS.primarySurface,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  coachTextContainer: {
    flex: 1,
  },
  coachTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.textPrimary,
  },
  coachSubtitle: {
    fontSize: 13,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  coachButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.primary,
    borderRadius: 12,
    paddingVertical: 12,
    gap: 8,
  },
  coachButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  statsRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 24,
  },
  statCard: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 16,
    borderRadius: 16,
    gap: 8,
  },
  statIcon: {
    width: 32,
    height: 32,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  statNumber: {
    fontSize: 22,
    fontWeight: '700',
  },
  statLabel: {
    fontSize: 11,
    color: COLORS.textSecondary,
    fontWeight: '500',
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.textPrimary,
  },
  sectionLink: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.primary,
  },
  emptyCard: {
    backgroundColor: COLORS.surface,
    borderRadius: 16,
    padding: 32,
    alignItems: 'center',
    gap: 8,
    borderWidth: 1,
    borderColor: COLORS.divider,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.textPrimary,
  },
  emptyText: {
    fontSize: 13,
    color: COLORS.textSecondary,
  },
  taskCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    borderRadius: 16,
    padding: 16,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: COLORS.divider,
    ...SHADOWS.small,
  },
  taskCheckbox: {
    marginRight: 12,
  },
  taskContent: {
    flex: 1,
  },
  taskTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: COLORS.textPrimary,
  },
  taskDescription: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  priorityBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  priorityText: {
    fontSize: 11,
    fontWeight: '600',
  },
});
