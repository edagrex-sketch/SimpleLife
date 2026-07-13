import React from 'react';
import {
  View,
  Text,
  ScrollView,
  Pressable,
  Alert,
  StyleSheet,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SHADOWS } from '../utils/colors';
import { useAuth } from '../context/AuthContext';
import { useTasks } from '../context/TaskContext';
import { useExpenses } from '../context/ExpensesContext';

export default function ProfileScreen() {
  const { profile, signOut } = useAuth();
  const { tasks } = useTasks();
  const { expenses } = useExpenses();

  const totalTasks = tasks.length;
  const completedTasks = tasks.filter((t) => t.is_done).length;
  const completionRate =
    totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;
  const totalExpenses = expenses.reduce((s, e) => s + e.amount, 0);

  const handleSignOut = () => {
    Alert.alert('Cerrar Sesión', '¿Estás seguro que deseas cerrar sesión?', [
      { text: 'Cancelar', style: 'cancel' },
      { text: 'Salir', style: 'destructive', onPress: signOut },
    ]);
  };

  const menuItems = [
    {
      icon: 'notifications-outline',
      title: 'Notificaciones',
      subtitle: 'Próximamente',
      color: COLORS.primary,
    },
    {
      icon: 'moon-outline',
      title: 'Modo oscuro',
      subtitle: 'Próximamente',
      color: COLORS.secondary,
    },
    {
      icon: 'sparkles',
      title: 'Asistente IA',
      subtitle: 'Próximamente',
      color: COLORS.tertiary,
    },
    {
      icon: 'shield-checkmark-outline',
      title: 'Privacidad',
      subtitle: 'Próximamente',
      color: COLORS.primary,
    },
  ];

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scroll}
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Perfil</Text>
        </View>

        {/* Profile Card */}
        <View style={styles.profileCard}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>
              {profile?.name?.charAt(0)?.toUpperCase() || 'U'}
            </Text>
          </View>
          <Text style={styles.name}>{profile?.name || 'Usuario'}</Text>
          <Text style={styles.email}>{profile?.email || ''}</Text>

          {/* Stats Row */}
          <View style={styles.statsRow}>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>{totalTasks}</Text>
              <Text style={styles.statLabel}>Tareas</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>{completionRate}%</Text>
              <Text style={styles.statLabel}>Completado</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>{expenses.length}</Text>
              <Text style={styles.statLabel}>Gastos</Text>
            </View>
          </View>
        </View>

        {/* Quick Stats */}
        <View style={styles.quickStats}>
          <View
            style={[
              styles.quickStatCard,
              { backgroundColor: COLORS.primarySurface },
            ]}
          >
            <Ionicons name="wallet-outline" size={22} color={COLORS.primary} />
            <Text style={[styles.quickStatNumber, { color: COLORS.primary }]}>
              ${totalExpenses.toFixed(0)}
            </Text>
            <Text style={styles.quickStatLabel}>Total gastado</Text>
          </View>
          <View
            style={[
              styles.quickStatCard,
              { backgroundColor: COLORS.secondarySurface },
            ]}
          >
            <Ionicons
              name="checkmark-done-outline"
              size={22}
              color={COLORS.secondary}
            />
            <Text style={[styles.quickStatNumber, { color: COLORS.secondary }]}>
              {completedTasks}
            </Text>
            <Text style={styles.quickStatLabel}>Completadas</Text>
          </View>
        </View>

        {/* Menu Items */}
        <View style={styles.menuCard}>
          {menuItems.map((item, index) => (
            <React.Fragment key={item.title}>
              <Pressable style={styles.menuItem}>
                <View
                  style={[
                    styles.menuIcon,
                    { backgroundColor: item.color + '15' },
                  ]}
                >
                  <Ionicons name={item.icon as any} size={20} color={item.color} />
                </View>
                <View style={styles.menuContent}>
                  <Text style={styles.menuTitle}>{item.title}</Text>
                  <Text style={styles.menuSubtitle}>{item.subtitle}</Text>
                </View>
                <Ionicons
                  name="chevron-forward"
                  size={18}
                  color={COLORS.textTertiary}
                />
              </Pressable>
              {index < menuItems.length - 1 && (
                <View style={styles.menuDivider} />
              )}
            </React.Fragment>
          ))}
        </View>

        {/* Logout Button */}
        <Pressable style={styles.logoutButton} onPress={handleSignOut}>
          <Ionicons name="log-out-outline" size={20} color={COLORS.error} />
          <Text style={styles.logoutText}>Cerrar Sesión</Text>
        </Pressable>

        {/* Version */}
        <Text style={styles.version}>VidaSimple v1.0.0</Text>

        <View style={{ height: 100 }} />
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
    marginBottom: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: COLORS.textPrimary,
    letterSpacing: -0.5,
  },
  profileCard: {
    backgroundColor: COLORS.surface,
    borderRadius: 20,
    padding: 24,
    alignItems: 'center',
    marginBottom: 16,
    borderWidth: 1,
    borderColor: COLORS.divider,
    ...SHADOWS.medium,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  avatarText: {
    fontSize: 32,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  name: {
    fontSize: 22,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  email: {
    fontSize: 13,
    color: COLORS.textSecondary,
    marginTop: 4,
  },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 20,
    paddingTop: 20,
    borderTopWidth: 1,
    borderTopColor: COLORS.divider,
    width: '100%',
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 20,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  statLabel: {
    fontSize: 11,
    color: COLORS.textSecondary,
    marginTop: 2,
    fontWeight: '500',
  },
  statDivider: {
    width: 1,
    height: 30,
    backgroundColor: COLORS.divider,
  },
  quickStats: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 16,
  },
  quickStatCard: {
    flex: 1,
    padding: 16,
    borderRadius: 16,
    alignItems: 'center',
    gap: 4,
  },
  quickStatNumber: {
    fontSize: 18,
    fontWeight: '700',
  },
  quickStatLabel: {
    fontSize: 11,
    color: COLORS.textSecondary,
    fontWeight: '500',
  },
  menuCard: {
    backgroundColor: COLORS.surface,
    borderRadius: 16,
    padding: 4,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: COLORS.divider,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
  },
  menuIcon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  menuContent: {
    flex: 1,
  },
  menuTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: COLORS.textPrimary,
  },
  menuSubtitle: {
    fontSize: 11,
    color: COLORS.textTertiary,
    marginTop: 1,
  },
  menuDivider: {
    height: 1,
    backgroundColor: COLORS.divider,
    marginLeft: 62,
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.errorSurface,
    borderRadius: 14,
    paddingVertical: 14,
    gap: 8,
    marginBottom: 16,
  },
  logoutText: {
    fontSize: 15,
    fontWeight: '600',
    color: COLORS.error,
  },
  version: {
    textAlign: 'center',
    fontSize: 12,
    color: COLORS.textTertiary,
  },
});
