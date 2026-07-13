import React from 'react';
import { View, Text, ScrollView, Pressable, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import GlassBox from '../components/GlassBox';
import { COLORS } from '../utils/colors';
import { useAuth } from '../context/AuthContext';
import { useTasks } from '../context/TaskContext';
import { useExpenses } from '../context/ExpensesContext';

export default function ProfileScreen() {
  const { profile, signOut } = useAuth();
  const { tasks } = useTasks();
  const { expenses } = useExpenses();

  const totalTasks = tasks.length;
  const completedTasks = tasks.filter(t => t.is_done).length;
  const completionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;
  const totalExpenses = expenses.reduce((s, e) => s + e.amount, 0);

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
        <View style={styles.avatarSection}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>
              {(profile?.name || 'U').charAt(0).toUpperCase()}
            </Text>
          </View>
          <Text style={styles.name}>{profile?.name || 'Usuario'}</Text>
          <Text style={styles.email}>{profile?.email || ''}</Text>
        </View>

        <Text style={styles.sectionTitle}>Estadísticas</Text>
        <View style={styles.statsGrid}>
          <GlassBox style={styles.statCard}>
            <Text style={styles.statNumber}>{totalTasks}</Text>
            <Text style={styles.statLabel}>Tareas</Text>
          </GlassBox>
          <GlassBox style={styles.statCard}>
            <Text style={styles.statNumber}>{completionRate}%</Text>
            <Text style={styles.statLabel}>Completado</Text>
          </GlassBox>
          <GlassBox style={styles.statCard}>
            <Text style={styles.statNumber}>{expenses.length}</Text>
            <Text style={styles.statLabel}>Gastos</Text>
          </GlassBox>
          <GlassBox style={styles.statCard}>
            <Text style={styles.statNumber}>${totalExpenses.toFixed(0)}</Text>
            <Text style={styles.statLabel}>Gastado</Text>
          </GlassBox>
        </View>

        <Text style={styles.sectionTitle}>Configuración</Text>
        <GlassBox style={styles.settingsCard}>
          <Pressable style={styles.settingsRow}>
            <Text style={styles.settingsLabel}>🌙 Tema oscuro</Text>
            <Text style={styles.settingsValue}>Próximamente</Text>
          </Pressable>
          <View style={styles.divider} />
          <Pressable style={styles.settingsRow}>
            <Text style={styles.settingsLabel}>🔔 Notificaciones</Text>
            <Text style={styles.settingsValue}>Próximamente</Text>
          </Pressable>
          <View style={styles.divider} />
          <Pressable style={styles.settingsRow}>
            <Text style={styles.settingsLabel}>🤖 AI Coach</Text>
            <Text style={styles.settingsValue}>Próximamente</Text>
          </Pressable>
          <View style={styles.divider} />
          <Pressable style={styles.settingsRow} onPress={signOut}>
            <Text style={[styles.settingsLabel, { color: COLORS.error }]}>Cerrar Sesión</Text>
          </Pressable>
        </GlassBox>

        <Text style={styles.version}>SimpleLife v1.0.0</Text>
        <View style={{ height: 60 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  scroll: { paddingHorizontal: 20, paddingTop: 20 },
  avatarSection: { alignItems: 'center', marginBottom: 24 },
  avatar: { width: 72, height: 72, borderRadius: 36, backgroundColor: COLORS.primary + '20', alignItems: 'center', justifyContent: 'center', marginBottom: 12 },
  avatarText: { fontSize: 28, fontWeight: '700', color: COLORS.primary, fontFamily: 'Outfit' },
  name: { fontSize: 22, fontWeight: '700', color: COLORS.textPrimary, fontFamily: 'Outfit' },
  email: { fontSize: 13, color: COLORS.textSecondary, marginTop: 4 },
  sectionTitle: { fontSize: 18, fontWeight: '600', color: COLORS.textPrimary, fontFamily: 'Outfit', marginBottom: 12 },
  statsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 24 },
  statCard: { width: '48%', alignItems: 'center', paddingVertical: 16 },
  statNumber: { fontSize: 24, fontWeight: '700', color: COLORS.primary, fontFamily: 'Outfit' },
  statLabel: { fontSize: 11, color: COLORS.textSecondary, marginTop: 4 },
  settingsCard: { marginBottom: 24 },
  settingsRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 12 },
  settingsLabel: { fontSize: 15, color: COLORS.textPrimary, fontWeight: '500' },
  settingsValue: { fontSize: 13, color: COLORS.textTertiary },
  divider: { height: 1, backgroundColor: COLORS.divider },
  version: { textAlign: 'center', fontSize: 12, color: COLORS.textTertiary },
});
