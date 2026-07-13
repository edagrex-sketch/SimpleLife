import React from 'react';
import { View, Text, ScrollView, Pressable, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import GlassBox from '../components/GlassBox';
import { COLORS } from '../utils/colors';
import { useAuth } from '../context/AuthContext';
import { useTasks } from '../context/TaskContext';
import { today, formatDateShort } from '../utils/helpers';

export default function HomeScreen() {
  const { profile } = useAuth();
  const { tasks } = useTasks();

  const todayTasks = tasks.filter(t => t.due_date === today() && !t.is_done);
  const pendingTasks = tasks.filter(t => !t.is_done);
  const completedTasks = tasks.filter(t => t.is_done);
  const completionRate = tasks.length > 0 ? Math.round((completedTasks.length / tasks.length) * 100) : 0;

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
        <Text style={styles.greeting}>Hola, {profile?.name || 'amigo'} 👋</Text>
        <Text style={styles.date}>{new Date().toLocaleDateString('es-MX', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</Text>

        <GlassBox style={styles.coachCard}>
          <Text style={styles.coachTitle}>🤖 AI Coach</Text>
          <Text style={styles.coachText}>¿En qué puedo ayudarte hoy?</Text>
          <Pressable style={styles.coachButton}>
            <Text style={styles.coachButtonText}>Preguntar a SimpleLife AI</Text>
          </Pressable>
        </GlassBox>

        <View style={styles.statsRow}>
          <GlassBox style={styles.statCard}>
            <Text style={styles.statNumber}>{pendingTasks.length}</Text>
            <Text style={styles.statLabel}>Pendientes</Text>
          </GlassBox>
          <GlassBox style={styles.statCard}>
            <Text style={styles.statNumber}>{todayTasks.length}</Text>
            <Text style={styles.statLabel}>Hoy</Text>
          </GlassBox>
          <GlassBox style={styles.statCard}>
            <Text style={styles.statNumber}>{completionRate}%</Text>
            <Text style={styles.statLabel}>Completado</Text>
          </GlassBox>
        </View>

        <Text style={styles.sectionTitle}>Tareas para hoy</Text>
        {todayTasks.length === 0 ? (
          <GlassBox style={styles.emptyCard}>
            <Text style={styles.emptyText}>✨ No hay tareas para hoy</Text>
          </GlassBox>
        ) : (
          todayTasks.slice(0, 3).map(task => (
            <GlassBox key={task.id} style={styles.taskCard}>
              <View style={styles.taskRow}>
                <Text style={[styles.taskTitle, task.is_done && styles.taskDone]}>{task.title}</Text>
                <Text style={styles.taskDate}>{formatDateShort(task.due_date!)}</Text>
              </View>
            </GlassBox>
          ))
        )}

        <View style={{ height: 100 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  scroll: { paddingHorizontal: 20, paddingTop: 20 },
  greeting: { fontSize: 28, fontWeight: '700', color: COLORS.textPrimary, fontFamily: 'Outfit' },
  date: { fontSize: 13, color: COLORS.textSecondary, marginTop: 4, marginBottom: 20, textTransform: 'capitalize' },
  coachCard: { marginBottom: 16 },
  coachTitle: { fontSize: 16, fontWeight: '600', color: COLORS.textPrimary, fontFamily: 'Outfit', marginBottom: 4 },
  coachText: { fontSize: 13, color: COLORS.textSecondary, marginBottom: 12 },
  coachButton: {
    backgroundColor: COLORS.primary, borderRadius: 12, paddingVertical: 10, alignItems: 'center',
  },
  coachButtonText: { color: '#fff', fontSize: 13, fontWeight: '600' },
  statsRow: { flexDirection: 'row', gap: 8, marginBottom: 20 },
  statCard: { flex: 1, alignItems: 'center', paddingVertical: 16 },
  statNumber: { fontSize: 24, fontWeight: '700', color: COLORS.primary, fontFamily: 'Outfit' },
  statLabel: { fontSize: 11, color: COLORS.textSecondary, marginTop: 4 },
  sectionTitle: { fontSize: 18, fontWeight: '600', color: COLORS.textPrimary, fontFamily: 'Outfit', marginBottom: 12 },
  emptyCard: { paddingVertical: 24, alignItems: 'center' },
  emptyText: { fontSize: 14, color: COLORS.textSecondary },
  taskCard: { marginBottom: 8, paddingVertical: 12 },
  taskRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  taskTitle: { fontSize: 15, fontWeight: '500', color: COLORS.textPrimary, flex: 1 },
  taskDone: { textDecorationLine: 'line-through', color: COLORS.textSecondary },
  taskDate: { fontSize: 11, color: COLORS.textTertiary },
});
