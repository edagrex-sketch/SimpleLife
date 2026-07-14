import React from 'react';
import { View, Text, ScrollView, Pressable, StyleSheet } from 'react-native';
import Animated from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { COLORS, SHADOWS, CATEGORY_COLORS } from '../utils/colors';
import { useAuth } from '../context/AuthContext';
import { useTasks } from '../context/TaskContext';
import { useCalendar } from '../context/CalendarContext';
import { today, getMonthDays, MONTHS, DAYS } from '../utils/helpers';
import { useFadeIn } from '../hooks/useFadeIn';
import { useStagger } from '../hooks/useStagger';

export default function HomeScreen() {
  const { profile } = useAuth();
  const { tasks } = useTasks();
  const { events } = useCalendar();

  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth();
  const days = getMonthDays(year, month);
  const todayNum = now.getDate();
  const todayStr = today();

  const todayTasks = tasks.filter((t) => t.due_date === todayStr && !t.is_done);
  const dayEvents = events.filter((e) => e.event_date === todayStr);

  const headerAnim = useFadeIn({ delay: 0, translateY: 15 });
  const calendarAnim = useFadeIn({ delay: 200, translateY: 20 });
  const eventsAnim = useFadeIn({ delay: 350, translateY: 20 });

  const hasEvent = (d: number) => {
    const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
    return events.some((e) => e.event_date === dateStr);
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <Animated.View style={[styles.header, headerAnim.animatedStyle]}>
        <Pressable style={styles.menuButton}>
          <Ionicons name="menu" size={24} color={COLORS.textPrimary} />
        </Pressable>
        <Text style={styles.headerTitle}>Lifestyle</Text>
        <Pressable style={styles.bellButton}>
          <Ionicons name="notifications-outline" size={22} color={COLORS.textPrimary} />
        </Pressable>
      </Animated.View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
        <Animated.View style={calendarAnim.animatedStyle}>
          <View style={styles.sectionLabel}>
            <Text style={styles.sectionLabelText}>PLANEACIÓN</Text>
          </View>
          <Text style={styles.sectionTitle}>Calendario</Text>

          <View style={styles.calendarCard}>
            <View style={styles.monthHeader}>
              <Text style={styles.monthTitle}>
                {MONTHS[month]} {year}
              </Text>
              <View style={styles.monthArrows}>
                <Pressable style={styles.arrowButton}>
                  <Ionicons name="chevron-back" size={18} color={COLORS.primary} />
                </Pressable>
                <Pressable style={styles.arrowButton}>
                  <Ionicons name="chevron-forward" size={18} color={COLORS.primary} />
                </Pressable>
              </View>
            </View>

            <View style={styles.weekdays}>
              {DAYS.map((d) => (
                <Text key={d} style={styles.weekday}>{d}</Text>
              ))}
            </View>

            <View style={styles.grid}>
              {days.map((d, i) => (
                <View key={i} style={styles.dayCell}>
                  {d ? (
                    <Pressable
                      style={[
                        styles.dayButton,
                        d === todayNum && styles.dayButtonActive,
                      ]}
                    >
                      <Text
                        style={[
                          styles.dayText,
                          d === todayNum && styles.dayTextActive,
                        ]}
                      >
                        {d}
                      </Text>
                      {hasEvent(d) && <View style={styles.dayDot} />}
                    </Pressable>
                  ) : (
                    <View style={styles.dayEmpty} />
                  )}
                </View>
              ))}
            </View>
          </View>
        </Animated.View>

        <Animated.View style={eventsAnim.animatedStyle}>
          <View style={styles.eventsHeader}>
            <Text style={styles.eventsSectionTitle}>Eventos de hoy</Text>
            <Text style={styles.eventsCount}>{dayEvents.length} actividades</Text>
          </View>

          {dayEvents.length === 0 ? (
            <View style={styles.emptyEvents}>
              <Ionicons name="calendar-outline" size={32} color={COLORS.textTertiary} />
              <Text style={styles.emptyText}>No hay eventos hoy</Text>
            </View>
          ) : (
            dayEvents.map((event, index) => (
              <EventCardWithStagger key={event.id} event={event} index={index} />
            ))
          )}
        </Animated.View>

        <View style={{ height: 100 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

function EventCardWithStagger({ event, index }: { event: any; index: number }) {
  const itemAnim = useStagger({ index, staggerDelay: 80, translateY: 16 });

  return (
    <Animated.View style={[styles.eventCard, itemAnim.animatedStyle]}>
      <View
        style={[
          styles.eventBorder,
          { backgroundColor: CATEGORY_COLORS[event.category || 'General'] || COLORS.primary },
        ]}
      />
      <View style={styles.eventContent}>
        <Text style={styles.eventCategory}>
          {(event.category || 'General').toUpperCase()}
        </Text>
        <Text style={styles.eventTitle}>{event.title}</Text>
        {event.start_time && (
          <Text style={styles.eventTime}>
            {event.start_time}
            {event.end_time ? ` - ${event.end_time}` : ''}
          </Text>
        )}
      </View>
    </Animated.View>
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
  scroll: {
    paddingHorizontal: 20,
  },
  sectionLabel: {
    marginBottom: 4,
  },
  sectionLabelText: {
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.textTertiary,
    letterSpacing: 1.5,
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: COLORS.textPrimary,
    marginBottom: 16,
  },
  calendarCard: {
    backgroundColor: COLORS.surface,
    borderRadius: 16,
    padding: 16,
    marginBottom: 24,
    ...SHADOWS.small,
  },
  monthHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  monthTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  monthArrows: {
    flexDirection: 'row',
    gap: 8,
  },
  arrowButton: {
    width: 44,
    height: 44,
    borderRadius: 10,
    backgroundColor: COLORS.surfaceSecondary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  weekdays: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  weekday: {
    flex: 1,
    textAlign: 'center',
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.textTertiary,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  dayCell: {
    width: '14.28%',
    aspectRatio: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dayEmpty: {
    width: 44,
    height: 44,
  },
  dayButton: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dayButtonActive: {
    backgroundColor: COLORS.primary,
  },
  dayText: {
    fontSize: 14,
    color: COLORS.textPrimary,
    fontWeight: '500',
  },
  dayTextActive: {
    color: COLORS.surface,
    fontWeight: '700',
  },
  dayDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: COLORS.primary,
    marginTop: 1,
  },
  eventsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  eventsSectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  eventsCount: {
    fontSize: 13,
    color: COLORS.textTertiary,
    fontWeight: '500',
  },
  emptyEvents: {
    backgroundColor: COLORS.surface,
    borderRadius: 16,
    padding: 32,
    alignItems: 'center',
    gap: 8,
    ...SHADOWS.small,
  },
  emptyText: {
    fontSize: 14,
    color: COLORS.textTertiary,
  },
  eventCard: {
    flexDirection: 'row',
    backgroundColor: COLORS.surface,
    borderRadius: 14,
    marginBottom: 10,
    overflow: 'hidden',
    ...SHADOWS.small,
  },
  eventBorder: {
    width: 4,
  },
  eventContent: {
    flex: 1,
    padding: 14,
  },
  eventCategory: {
    fontSize: 10,
    fontWeight: '700',
    color: COLORS.textTertiary,
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  eventTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: COLORS.textPrimary,
    marginBottom: 4,
  },
  eventTime: {
    fontSize: 12,
    color: COLORS.textSecondary,
  },
});
