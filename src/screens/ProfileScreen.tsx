import React from 'react';
import { View, Text, ScrollView, Pressable, Alert, StyleSheet } from 'react-native';
import Animated from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { COLORS, SHADOWS } from '../utils/colors';
import { useAuth } from '../context/AuthContext';
import { useTasks } from '../context/TaskContext';
import { useExpenses } from '../context/ExpensesContext';
import { useNotifications } from '../context/NotificationsContext';
import { useFadeIn } from '../hooks/useFadeIn';
import { useStagger } from '../hooks/useStagger';

interface ProfileScreenProps {
  onOpenNotifications?: () => void;
}

export default function ProfileScreen({ onOpenNotifications }: ProfileScreenProps) {
  const { profile, signOut } = useAuth();
  const { tasks } = useTasks();
  const { expenses } = useExpenses();
  const { unreadCount } = useNotifications();

  const completedTasks = tasks.filter((t) => t.is_done).length;

  const headerAnim = useFadeIn({ delay: 0, translateY: 15 });
  const avatarAnim = useFadeIn({ delay: 150, translateY: 25 });
  const statsAnim = useFadeIn({ delay: 300, translateY: 20 });
  const menuAnim = useFadeIn({ delay: 450, translateY: 20 });
  const logoutAnim = useFadeIn({ delay: 550, translateY: 15 });

  const menuItems = [
    { icon: 'person-outline', label: 'Cuenta' },
    { icon: 'notifications-outline', label: 'Notificaciones' },
    { icon: 'lock-closed-outline', label: 'Privacidad' },
    { icon: 'help-circle-outline', label: 'Ayuda' },
  ];

  const menuAnimations = menuItems.map((_, index) =>
    useStagger({ index, staggerDelay: 60, translateY: 12 })
  );

  const handleSignOut = () => {
    Alert.alert('Cerrar Sesión', '¿Estás seguro?', [
      { text: 'Cancelar', style: 'cancel' },
      { text: 'Salir', style: 'destructive', onPress: signOut },
    ]);
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
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

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
        {/* Avatar */}
        <Animated.View style={[styles.avatarSection, avatarAnim.animatedStyle]}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>
              {profile?.name?.charAt(0)?.toUpperCase() || 'U'}
              {profile?.name?.split(' ')[1]?.charAt(0)?.toUpperCase() || ''}
            </Text>
          </View>
          <Text style={styles.name}>{profile?.name || 'Usuario'}</Text>
          <Text style={styles.email}>{profile?.email || ''}</Text>
        </Animated.View>

        {/* Stats Grid */}
        <Animated.View style={[styles.statsGrid, statsAnim.animatedStyle]}>
          <View style={styles.statCard}>
            <View style={styles.statIconContainer}>
              <Ionicons name="flame-outline" size={20} color={COLORS.primary} />
            </View>
            <Text style={styles.statNumber}>—</Text>
            <Text style={styles.statLabel}>Días siguientes</Text>
          </View>
          <View style={styles.statCard}>
            <View style={styles.statIconContainer}>
              <Ionicons name="checkmark-circle-outline" size={20} color={COLORS.primary} />
            </View>
            <Text style={styles.statNumber}>{completedTasks}</Text>
            <Text style={styles.statLabel}>Tareas completadas</Text>
          </View>
          <View style={styles.statCard}>
            <View style={styles.statIconContainer}>
              <Ionicons name="people-outline" size={20} color={COLORS.primary} />
            </View>
            <Text style={styles.statNumber}>—</Text>
            <Text style={styles.statLabel}>Espacios</Text>
          </View>
          <View style={styles.statCard}>
            <View style={styles.statIconContainer}>
              <Ionicons name="trophy-outline" size={20} color={COLORS.primary} />
            </View>
            <Text style={styles.statNumber}>—</Text>
            <Text style={styles.statLabel}>Logros</Text>
          </View>
        </Animated.View>

        {/* Menu Items */}
        <Animated.View style={[styles.menuCard, menuAnim.animatedStyle]}>
          {menuItems.map((item, index) => (
            <React.Fragment key={item.label}>
              <Animated.View style={menuAnimations[index].animatedStyle}>
                <Pressable style={styles.menuItem}>
                  <Ionicons name={item.icon as any} size={20} color={COLORS.textSecondary} />
                  <Text style={styles.menuLabel}>{item.label}</Text>
                  <Ionicons name="chevron-forward" size={18} color={COLORS.textTertiary} />
                </Pressable>
              </Animated.View>
              {index < menuItems.length - 1 && <View style={styles.menuDivider} />}
            </React.Fragment>
          ))}
        </Animated.View>

        {/* Logout */}
        <Animated.View style={logoutAnim.animatedStyle}>
          <Pressable style={styles.logoutButton} onPress={handleSignOut}>
            <Ionicons name="log-out-outline" size={18} color={COLORS.textTertiary} />
            <Text style={styles.logoutText}>Cerrar sesión</Text>
          </Pressable>
        </Animated.View>

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
  scroll: {
    paddingHorizontal: 20,
  },
  avatarSection: {
    alignItems: 'center',
    marginBottom: 28,
  },
  avatar: {
    width: 88,
    height: 88,
    borderRadius: 44,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 14,
  },
  avatarText: {
    fontSize: 30,
    fontWeight: '700',
    color: COLORS.surface,
  },
  name: {
    fontSize: 22,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  email: {
    fontSize: 13,
    color: COLORS.textTertiary,
    marginTop: 4,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginBottom: 24,
  },
  statCard: {
    width: '47%',
    backgroundColor: COLORS.surface,
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
    ...SHADOWS.small,
  },
  statIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: COLORS.primarySurface,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  statNumber: {
    fontSize: 24,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  statLabel: {
    fontSize: 11,
    color: COLORS.textTertiary,
    marginTop: 4,
    fontWeight: '500',
  },
  menuCard: {
    backgroundColor: COLORS.surface,
    borderRadius: 16,
    paddingHorizontal: 16,
    marginBottom: 20,
    ...SHADOWS.small,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    gap: 12,
  },
  menuLabel: {
    flex: 1,
    fontSize: 15,
    fontWeight: '500',
    color: COLORS.textPrimary,
  },
  menuDivider: {
    height: 1,
    backgroundColor: COLORS.divider,
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    gap: 8,
  },
  logoutText: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.textTertiary,
  },
});
