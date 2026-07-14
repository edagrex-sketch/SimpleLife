import React, { useMemo } from 'react';
import {
  View,
  Text,
  ScrollView,
  Pressable,
  StyleSheet,
  FlatList,
  RefreshControl,
} from 'react-native';
import Animated from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { COLORS, SHADOWS, PRIORITY_COLORS, CATEGORY_COLORS } from '../utils/colors';
import { useAuth } from '../context/AuthContext';
import { useTasks } from '../context/TaskContext';
import { useCalendar } from '../context/CalendarContext';
import { useExpenses } from '../context/ExpensesContext';
import { useNotifications } from '../context/NotificationsContext';
import { today, formatAmount } from '../utils/helpers';
import { useFadeIn } from '../hooks/useFadeIn';
import { useStagger } from '../hooks/useStagger';
import { useScalePress } from '../hooks/useScalePress';
import GlassBox from '../components/GlassBox';
import { TabId } from '../components/FloatingTabBar';

interface HomeScreenProps {
  onNavigate?: (tab: TabId) => void;
  onOpenNotifications?: () => void;
}

const DAYS_SHORT = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];

function getGreeting(): string {
  const h = new Date().getHours();
  if (h < 12) return 'Buenos días';
  if (h < 19) return 'Buenas tardes';
  return 'Buenas noches';
}

export default function HomeScreen({ onNavigate, onOpenNotifications }: HomeScreenProps) {
  const { profile } = useAuth();
  const { tasks, loading: tasksLoading } = useTasks();
  const { events, loading: eventsLoading } = useCalendar();
  const { expenses, loading: expensesLoading } = useExpenses();
  const { unreadCount } = useNotifications();

  const [refreshing, setRefreshing] = React.useState(false);
  const [selectedDay, setSelectedDay] = React.useState(new Date());

  const now = new Date();
  const todayStr = today();
  const todayTasks = useMemo(
    () => tasks.filter((t) => t.due_date === todayStr && !t.is_done),
    [tasks, todayStr]
  );
  const dayEvents = useMemo(
    () => events.filter((e) => e.event_date === formatDateStr(selectedDay)),
    [events, selectedDay]
  );

  const monthExpenses = useMemo(() => {
    const currentMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
    return expenses
      .filter((e) => e.date?.startsWith(currentMonth))
      .reduce((sum, e) => sum + (e.amount || 0), 0);
  }, [expenses, now]);

  const totalPendingTasks = useMemo(
    () => tasks.filter((t) => !t.is_done).length,
    [tasks]
  );

  const headerAnim = useFadeIn({ delay: 0, translateY: 15 });
  const statsAnim = useFadeIn({ delay: 100, translateY: 20 });
  const dayStripAnim = useFadeIn({ delay: 200, translateY: 20 });
  const timelineAnim = useFadeIn({ delay: 300, translateY: 20 });
  const actionsAnim = useFadeIn({ delay: 400, translateY: 20 });
  const coachAnim = useFadeIn({ delay: 500, translateY: 20 });

  const dayStrip = useMemo(() => {
    const days = [];
    for (let i = -3; i <= 3; i++) {
      const d = new Date();
      d.setDate(d.getDate() + i);
      days.push(d);
    }
    return days;
  }, []);

  const handleRefresh = React.useCallback(async () => {
    setRefreshing(true);
    await new Promise<void>((r) => setTimeout(r, 800));
    setRefreshing(false);
  }, []);

  const timelineItems = useMemo(() => {
    const items: Array<{
      id: string;
      type: 'task' | 'event';
      title: string;
      time?: string;
      priority?: string;
      category?: string;
    }> = [];

    todayTasks.forEach((t) => {
      items.push({
        id: `task-${t.id}`,
        type: 'task',
        title: t.title,
        time: t.time,
        priority: t.priority,
      });
    });

    dayEvents.forEach((e) => {
      items.push({
        id: `event-${e.id}`,
        type: 'event',
        title: e.title,
        time: e.start_time,
        category: e.category,
      });
    });

    items.sort((a, b) => {
      if (!a.time) return 1;
      if (!b.time) return -1;
      return a.time.localeCompare(b.time);
    });

    return items;
  }, [todayTasks, dayEvents]);

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <Animated.View style={[styles.header, headerAnim.animatedStyle]}>
        <Pressable style={styles.menuButton}>
          <Ionicons name="menu" size={22} color={COLORS.textPrimary} />
        </Pressable>
        <View style={styles.headerCenter}>
          <Text style={styles.greeting}>{getGreeting()}</Text>
          <Text style={styles.userName}>{profile?.name || 'Usuario'}</Text>
        </View>
        <Pressable style={styles.bellButton} onPress={onOpenNotifications}>
          <Ionicons name="notifications-outline" size={22} color={COLORS.textPrimary} />
          {unreadCount > 0 && <View style={styles.badge} />}
        </Pressable>
      </Animated.View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scroll}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            tintColor={COLORS.primary}
          />
        }
      >
        {/* Hero Stats */}
        <Animated.View style={[statsAnim.animatedStyle]}>
          <GlassBox style={styles.heroCard} variant="dark">
            <Text style={styles.heroLabel}>Resumen de hoy</Text>
            <View style={styles.statsRow}>
              <View style={styles.statItem}>
                <View style={[styles.statIcon, { backgroundColor: 'rgba(197,106,73,0.2)' }]}>
                  <Ionicons name="checkbox-outline" size={18} color={COLORS.primaryLight} />
                </View>
                <Text style={styles.statNumber}>{totalPendingTasks}</Text>
                <Text style={styles.statLabel}>Pendientes</Text>
              </View>
              <View style={styles.statDivider} />
              <View style={styles.statItem}>
                <View style={[styles.statIcon, { backgroundColor: 'rgba(145,172,159,0.2)' }]}>
                  <Ionicons name="calendar-outline" size={18} color={COLORS.secondaryLight} />
                </View>
                <Text style={styles.statNumber}>{dayEvents.length}</Text>
                <Text style={styles.statLabel}>Eventos</Text>
              </View>
              <View style={styles.statDivider} />
              <View style={styles.statItem}>
                <View style={[styles.statIcon, { backgroundColor: 'rgba(223,173,109,0.2)' }]}>
                  <Ionicons name="wallet-outline" size={18} color={COLORS.tertiaryLight} />
                </View>
                <Text style={styles.statNumber}>{formatAmount(monthExpenses)}</Text>
                <Text style={styles.statLabel}>Este mes</Text>
              </View>
            </View>
          </GlassBox>
        </Animated.View>

        {/* Day Strip */}
        <Animated.View style={[dayStripAnim.animatedStyle]}>
          <Text style={styles.sectionTitle}>Tu semana</Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.dayStripContent}
          >
            {dayStrip.map((d) => {
              const isSelected =
                d.toDateString() === selectedDay.toDateString();
              const isToday = d.toDateString() === now.toDateString();
              const dateStr = formatDateStr(d);
              const hasEvent = events.some((e) => e.event_date === dateStr);
              return (
                <Pressable
                  key={d.toISOString()}
                  style={[styles.dayPill, isSelected && styles.dayPillActive]}
                  onPress={() => setSelectedDay(d)}
                >
                  <Text
                    style={[
                      styles.dayPillLabel,
                      isSelected && styles.dayPillLabelActive,
                    ]}
                  >
                    {DAYS_SHORT[d.getDay()]}
                  </Text>
                  <Text
                    style={[
                      styles.dayPillNumber,
                      isSelected && styles.dayPillNumberActive,
                    ]}
                  >
                    {d.getDate()}
                  </Text>
                  {hasEvent && !isSelected && <View style={styles.dayDot} />}
                  {isToday && !isSelected && <View style={styles.todayDot} />}
                </Pressable>
              );
            })}
          </ScrollView>
        </Animated.View>

        {/* Timeline */}
        <Animated.View style={[timelineAnim.animatedStyle]}>
          <View style={styles.timelineHeader}>
            <Text style={styles.sectionTitle}>Tu día</Text>
            <Text style={styles.timelineCount}>
              {timelineItems.length} {timelineItems.length === 1 ? 'actividad' : 'actividades'}
            </Text>
          </View>

          {timelineItems.length === 0 ? (
            <GlassBox style={styles.emptyCard}>
              <View style={styles.emptyIconContainer}>
                <Ionicons name="sunny-outline" size={36} color={COLORS.tertiary} />
              </View>
              <Text style={styles.emptyTitle}>¡Día libre!</Text>
              <Text style={styles.emptyText}>
                No tienes tareas ni eventos pendientes para hoy.
              </Text>
            </GlassBox>
          ) : (
            timelineItems.map((item, index) => (
              <TimelineItem key={item.id} item={item} index={index} />
            ))
          )}
        </Animated.View>

        {/* Quick Actions */}
        <Animated.View style={[actionsAnim.animatedStyle]}>
          <Text style={styles.sectionTitle}>Acciones rápidas</Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.actionsContent}
          >
            <ActionPill
              icon="checkbox-outline"
              label="Nueva tarea"
              color={COLORS.primary}
              onPress={() => onNavigate?.('tasks')}
            />
            <ActionPill
              icon="calendar-outline"
              label="Nuevo evento"
              color={COLORS.secondary}
              onPress={() => onNavigate?.('calendar')}
            />
            <ActionPill
              icon="wallet-outline"
              label="Gasto"
              color={COLORS.tertiary}
              onPress={() => onNavigate?.('expenses')}
            />
            <ActionPill
              icon="layers-outline"
              label="Espacio"
              color={COLORS.info}
              onPress={() => onNavigate?.('spaces')}
            />
          </ScrollView>
        </Animated.View>

        {/* AI Coach CTA */}
        <Animated.View style={[coachAnim.animatedStyle]}>
          <Pressable onPress={() => {}}>
            <GlassBox style={styles.coachCard}>
              <View style={styles.coachIconContainer}>
                <Ionicons name="sparkles" size={24} color={COLORS.primary} />
              </View>
              <View style={styles.coachContent}>
                <Text style={styles.coachTitle}>Coach IA</Text>
                <Text style={styles.coachText}>
                  Habla con tu asistente para organizar tu día
                </Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color={COLORS.textTertiary} />
            </GlassBox>
          </Pressable>
        </Animated.View>

        <View style={{ height: 120 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

function formatDateStr(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

function TimelineItem({
  item,
  index,
}: {
  item: {
    id: string;
    type: 'task' | 'event';
    title: string;
    time?: string;
    priority?: string;
    category?: string;
  };
  index: number;
}) {
  const itemAnim = useStagger({ index, staggerDelay: 60, translateY: 12 });
  const isTask = item.type === 'task';
  const dotColor = isTask
    ? PRIORITY_COLORS[item.priority || 'low']
    : CATEGORY_COLORS[item.category || 'General'] || COLORS.primary;

  return (
    <Animated.View style={[styles.timelineItem, itemAnim.animatedStyle]}>
      <View style={styles.timelineLeft}>
        <View style={[styles.timelineDot, { backgroundColor: dotColor }]} />
        <View style={styles.timelineLine} />
      </View>
      <GlassBox style={styles.timelineCard}>
        <View style={styles.timelineCardHeader}>
          <View style={[styles.typeBadge, { backgroundColor: dotColor + '15' }]}>
            <Ionicons
              name={isTask ? 'checkbox-outline' : 'calendar-outline'}
              size={12}
              color={dotColor}
            />
            <Text style={[styles.typeBadgeText, { color: dotColor }]}>
              {isTask ? 'Tarea' : 'Evento'}
            </Text>
          </View>
          {item.time && (
            <Text style={styles.timelineTime}>{item.time}</Text>
          )}
        </View>
        <Text style={styles.timelineTitle} numberOfLines={2}>
          {item.title}
        </Text>
      </GlassBox>
    </Animated.View>
  );
}

function ActionPill({
  icon,
  label,
  color,
  onPress,
}: {
  icon: string;
  label: string;
  color: string;
  onPress: () => void;
}) {
  const { animatedStyle, onPressIn, onPressOut } = useScalePress();

  return (
    <Pressable onPress={onPress} onPressIn={onPressIn} onPressOut={onPressOut}>
      <Animated.View style={[styles.actionPill, animatedStyle]}>
        <View style={[styles.actionIcon, { backgroundColor: color + '15' }]}>
          <Ionicons name={icon} size={20} color={color} />
        </View>
        <Text style={styles.actionLabel}>{label}</Text>
      </Animated.View>
    </Pressable>
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
  headerCenter: {
    flex: 1,
    alignItems: 'center',
  },
  greeting: {
    fontSize: 13,
    color: COLORS.textSecondary,
    fontWeight: '500',
  },
  userName: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.textPrimary,
    marginTop: 1,
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
  scroll: {
    paddingHorizontal: 20,
  },
  heroCard: {
    marginBottom: 24,
    paddingVertical: 18,
    paddingHorizontal: 16,
  },
  heroLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.textInverseSecondary,
    marginBottom: 14,
  },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statIcon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  statNumber: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.textInverse,
    marginBottom: 2,
  },
  statLabel: {
    fontSize: 11,
    color: COLORS.textInverseSecondary,
    fontWeight: '500',
  },
  statDivider: {
    width: 1,
    height: 40,
    backgroundColor: 'rgba(255,255,255,0.10)',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.textPrimary,
    marginBottom: 12,
  },
  dayStripContent: {
    paddingRight: 20,
    gap: 8,
    marginBottom: 24,
  },
  dayPill: {
    width: 52,
    height: 68,
    borderRadius: 16,
    backgroundColor: COLORS.surface,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: COLORS.divider,
    ...SHADOWS.small,
  },
  dayPillActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  dayPillLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: COLORS.textTertiary,
    marginBottom: 2,
  },
  dayPillLabelActive: {
    color: 'rgba(255,255,255,0.8)',
  },
  dayPillNumber: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  dayPillNumberActive: {
    color: '#FFFFFF',
  },
  dayDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: COLORS.primary,
    marginTop: 4,
  },
  todayDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: COLORS.tertiary,
    marginTop: 4,
  },
  timelineHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  timelineCount: {
    fontSize: 13,
    color: COLORS.textTertiary,
    fontWeight: '500',
  },
  timelineItem: {
    flexDirection: 'row',
    marginBottom: 4,
  },
  timelineLeft: {
    width: 20,
    alignItems: 'center',
  },
  timelineDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginTop: 16,
  },
  timelineLine: {
    flex: 1,
    width: 2,
    backgroundColor: COLORS.divider,
    marginTop: 4,
  },
  timelineCard: {
    flex: 1,
    marginBottom: 8,
    paddingVertical: 10,
    paddingHorizontal: 14,
    marginLeft: 8,
  },
  timelineCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  typeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    gap: 4,
  },
  typeBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
  timelineTime: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.textSecondary,
  },
  timelineTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.textPrimary,
    lineHeight: 20,
  },
  actionsContent: {
    paddingRight: 20,
    gap: 10,
    marginBottom: 24,
  },
  actionPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    borderRadius: 14,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: COLORS.divider,
    gap: 10,
    ...SHADOWS.small,
  },
  actionIcon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.textPrimary,
  },
  coachCard: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  coachIconContainer: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: COLORS.primarySurface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  coachContent: {
    flex: 1,
    marginLeft: 12,
  },
  coachTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: COLORS.textPrimary,
    marginBottom: 2,
  },
  coachText: {
    fontSize: 12,
    color: COLORS.textSecondary,
  },
  emptyCard: {
    alignItems: 'center',
    paddingVertical: 32,
  },
  emptyIconContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: COLORS.tertiarySurface,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.textPrimary,
    marginBottom: 4,
  },
  emptyText: {
    fontSize: 13,
    color: COLORS.textSecondary,
    textAlign: 'center',
  },
});
