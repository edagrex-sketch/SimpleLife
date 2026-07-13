import React from 'react';
import { View, Text, ScrollView, Pressable, StyleSheet } from 'react-native';
import Animated from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { COLORS } from '../utils/colors';
import { useAuth } from '../context/AuthContext';
import { useTasks } from '../context/TaskContext';
import { useCalendar } from '../context/CalendarContext';
import { today, getMonthDays, MONTHS, DAYS, formatDate } from '../utils/helpers';
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

  const EVENT_COLORS: Record<string, string> = {
    Trabajo: '#C56A49',
    Social: '#91AC9F',
    Salud: '#DFAD6D',
    General: '#8A7A6A',
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

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
        {/* Calendar Section */}
        <Animated.View style={calendarAnim.animatedStyle}>
          <View style={styles.sectionLabel}>
            <Text style={styles.sectionLabelText}>PLANEACIÓN</Text>
          </View>
          <Text style={styles.sectionTitle}>Calendario</Text>

          <View style={styles.calendarCard}>
            {/* Month Header */}
            <View style={styles.monthHeader}>
              <Text style={styles.monthTitle}>
                {MONTHS[month]} {year}
              </Text>
              <View style={styles.monthArrows}>
                <Pressable style={styles.arrowButton}>
                  <Ionicons name="chevron-back" size={18} color="#C56A49" />
                </Pressable>
                <Pressable style={styles.arrowButton}>
                  <Ionicons name="chevron-forward" size={18} color="#C56A49" />
                </Pressable>
              </View>
            </View>

            {/* Weekday Headers */}
            <View style={styles.weekdays}>
              {DAYS.map((d) => (
                <Text key={d} style={styles.weekday}>{d}</Text>
              ))}
            </View>

            {/* Calendar Grid */}
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

        {/* Events Section */}
        <Animated.View style={eventsAnim.animatedStyle}>
          <View style={styles.eventsHeader}>
            <Text style={styles.eventsSectionTitle}>Eventos de hoy</Text>
            <Text style={styles.eventsCount}>{dayEvents.length} actividades</Text>
          </View>

          {dayEvents.length === 0 ? (
            <View style={styles.emptyEvents}>
              <Ionicons name="calendar-outline" size={32} color="#CCC" />
              <Text style={styles.emptyText}>No hay eventos hoy</Text>
            </View>
          ) : (
            dayEvents.map((event, index) => {
              const itemAnim = useStagger({ index, staggerDelay: 80, translateY: 16 });
              return (
                <Animated.View key={event.id} style={[styles.eventCard, itemAnim.animatedStyle]}>
                  <View
                    style={[
                      styles.eventBorder,
                      { backgroundColor: EVENT_COLORS[event.category || 'General'] || '#C56A49' },
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
            })
          )}
        </Animated.View>

        <View style={{ height: 100 }} />
      </ScrollView>
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
  scroll: {
    paddingHorizontal: 20,
  },
  sectionLabel: {
    marginBottom: 4,
  },
  sectionLabelText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#AA9A8A',
    letterSpacing: 1.5,
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#3D2B1F',
    marginBottom: 16,
  },
  calendarCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
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
    color: '#3D2B1F',
  },
  monthArrows: {
    flexDirection: 'row',
    gap: 8,
  },
  arrowButton: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: '#F9F6F2',
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
    color: '#AA9A8A',
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
    width: 36,
    height: 36,
  },
  dayButton: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dayButtonActive: {
    backgroundColor: '#C56A49',
  },
  dayText: {
    fontSize: 14,
    color: '#3D2B1F',
    fontWeight: '500',
  },
  dayTextActive: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  dayDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#C56A49',
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
    color: '#3D2B1F',
  },
  eventsCount: {
    fontSize: 13,
    color: '#AA9A8A',
    fontWeight: '500',
  },
  emptyEvents: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 32,
    alignItems: 'center',
    gap: 8,
  },
  emptyText: {
    fontSize: 14,
    color: '#AA9A8A',
  },
  eventCard: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    marginBottom: 10,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 1,
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
    color: '#AA9A8A',
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  eventTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#3D2B1F',
    marginBottom: 4,
  },
  eventTime: {
    fontSize: 12,
    color: '#8A7A6A',
  },
});
