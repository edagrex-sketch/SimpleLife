import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  Pressable,
  TextInput,
  Modal,
  StyleSheet,
} from 'react-native';
import Animated from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';
import Ionicons from 'react-native-vector-icons/Ionicons';
import EventCard from '../components/EventCard';
import { COLORS } from '../utils/colors';
import { useCalendar } from '../context/CalendarContext';
import { MONTHS, DAYS, getMonthDays, formatDate } from '../utils/helpers';
import { useFadeIn } from '../hooks/useFadeIn';

export default function CalendarScreen() {
  const { events, addEvent, deleteEvent } = useCalendar();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDay, setSelectedDay] = useState<number | null>(
    new Date().getDate()
  );
  const [showModal, setShowModal] = useState(false);

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const days = getMonthDays(year, month);

  const selectedDate = selectedDay
    ? `${year}-${String(month + 1).padStart(2, '0')}-${String(selectedDay).padStart(2, '0')}`
    : null;

  const dayEvents = selectedDate
    ? events.filter((e) => e.event_date === selectedDate)
    : [];

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');

  const headerAnim = useFadeIn({ delay: 0, translateY: 15 });
  const calendarAnim = useFadeIn({ delay: 150, translateY: 20 });
  const eventsAnim = useFadeIn({ delay: 300, translateY: 20 });

  const handleAdd = async () => {
    if (!title.trim() || !selectedDate) return;
    await addEvent({
      title: title.trim(),
      description,
      event_date: selectedDate,
      start_time: startTime || undefined,
      end_time: endTime || undefined,
      category: 'General',
    });
    setTitle('');
    setDescription('');
    setStartTime('');
    setEndTime('');
    setShowModal(false);
  };

  const prevMonth = () => setCurrentDate(new Date(year, month - 1, 1));
  const nextMonth = () => setCurrentDate(new Date(year, month + 1, 1));

  const hasEvent = (d: number) => {
    const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
    return events.some((e) => e.event_date === dateStr);
  };

  const isToday = (d: number) => {
    const today = new Date();
    return (
      d === today.getDate() &&
      month === today.getMonth() &&
      year === today.getFullYear()
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <Animated.View style={[styles.header, headerAnim.animatedStyle]}>
        <View>
          <Text style={styles.title}>Calendario</Text>
          <Text style={styles.subtitle}>{events.length} eventos este mes</Text>
        </View>
      </Animated.View>

      {/* Month Navigation + Calendar */}
      <Animated.View style={calendarAnim.animatedStyle}>
        <View style={styles.monthNav}>
          <Pressable style={styles.navButton} onPress={prevMonth}>
            <Ionicons name="chevron-back" size={22} color={COLORS.primary} />
          </Pressable>
          <Text style={styles.monthTitle}>
            {MONTHS[month]} {year}
          </Text>
          <Pressable style={styles.navButton} onPress={nextMonth}>
            <Ionicons name="chevron-forward" size={22} color={COLORS.primary} />
          </Pressable>
        </View>

        {/* Weekday Headers */}
        <View style={styles.weekdays}>
          {DAYS.map((d) => (
            <Text key={d} style={styles.weekday}>
              {d}
            </Text>
          ))}
        </View>

        {/* Calendar Grid */}
        <View style={styles.grid}>
          {days.map((d, i) => (
            <Pressable
              key={i}
              style={[
                styles.dayCell,
                d === selectedDay && styles.dayCellActive,
                isToday(d!) && styles.dayCellToday,
              ]}
              onPress={() => d && setSelectedDay(d)}
              disabled={!d}
            >
              <Text
                style={[
                  styles.dayText,
                  d === selectedDay && styles.dayTextActive,
                  isToday(d!) && !selectedDay && styles.dayTextToday,
                ]}
              >
                {d}
              </Text>
              {d && hasEvent(d) && (
                <View
                  style={[
                    styles.dayDot,
                    d === selectedDay && styles.dayDotActive,
                  ]}
                />
              )}
            </Pressable>
          ))}
        </View>
      </Animated.View>

      {/* Events Section */}
      <Animated.View style={[styles.eventsSection, eventsAnim.animatedStyle]}>
        <View style={styles.eventsHeader}>
          <Text style={styles.eventsTitle}>
            {selectedDate ? formatDate(selectedDate) : 'Selecciona un día'}
          </Text>
          <View style={styles.eventsBadge}>
            <Text style={styles.eventsBadgeText}>{dayEvents.length}</Text>
          </View>
        </View>
        <ScrollView style={styles.eventsList} showsVerticalScrollIndicator={false}>
          {dayEvents.length === 0 ? (
            <View style={styles.emptyCard}>
              <Ionicons
                name="calendar-outline"
                size={40}
                color={COLORS.textTertiary}
              />
              <Text style={styles.emptyTitle}>Sin eventos</Text>
              <Text style={styles.emptyText}>
                Agrega un evento a este día
              </Text>
            </View>
          ) : (
            dayEvents.map((event) => (
              <EventCard
                key={event.id}
                event={event}
                onPress={() => deleteEvent(event.id)}
              />
            ))
          )}
        </ScrollView>
      </Animated.View>

      {/* Add Modal */}
      <Modal visible={showModal} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modal}>
            <View style={styles.modalHandle} />
            <Text style={styles.modalTitle}>Nuevo Evento</Text>

            <View style={styles.inputContainer}>
              <Ionicons
                name="document-text-outline"
                size={20}
                color={COLORS.textSecondary}
                style={styles.inputIcon}
              />
              <TextInput
                style={styles.input}
                placeholder="Título del evento"
                placeholderTextColor={COLORS.textTertiary}
                value={title}
                onChangeText={setTitle}
              />
            </View>

            <View style={styles.inputContainer}>
              <Ionicons
                name="information-circle-outline"
                size={20}
                color={COLORS.textSecondary}
                style={styles.inputIcon}
              />
              <TextInput
                style={styles.input}
                placeholder="Descripción (opcional)"
                placeholderTextColor={COLORS.textTertiary}
                value={description}
                onChangeText={setDescription}
                multiline
              />
            </View>

            <View style={styles.timeRow}>
              <View style={[styles.inputContainer, { flex: 1 }]}>
                <Ionicons
                  name="time-outline"
                  size={20}
                  color={COLORS.textSecondary}
                  style={styles.inputIcon}
                />
                <TextInput
                  style={styles.input}
                  placeholder="Inicio (HH:MM)"
                  placeholderTextColor={COLORS.textTertiary}
                  value={startTime}
                  onChangeText={setStartTime}
                />
              </View>
              <View style={[styles.inputContainer, { flex: 1 }]}>
                <Ionicons
                  name="time-outline"
                  size={20}
                  color={COLORS.textSecondary}
                  style={styles.inputIcon}
                />
                <TextInput
                  style={styles.input}
                  placeholder="Fin (HH:MM)"
                  placeholderTextColor={COLORS.textTertiary}
                  value={endTime}
                  onChangeText={setEndTime}
                />
              </View>
            </View>

            <View style={styles.modalButtons}>
              <Pressable
                style={styles.cancelButton}
                onPress={() => setShowModal(false)}
              >
                <Text style={styles.cancelText}>Cancelar</Text>
              </Pressable>
              <Pressable style={styles.saveButton} onPress={handleAdd}>
                <Text style={styles.saveText}>Crear Evento</Text>
              </Pressable>
            </View>
          </View>
        </View>
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
    paddingTop: 16,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: COLORS.textPrimary,
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 13,
    color: COLORS.textSecondary,
    marginTop: 2,
    fontWeight: '500',
  },
  monthNav: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginTop: 16,
    marginBottom: 12,
  },
  navButton: {
    width: 36,
    height: 36,
    borderRadius: 12,
    backgroundColor: COLORS.surface,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: COLORS.divider,
  },
  monthTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.textPrimary,
  },
  weekdays: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    marginBottom: 8,
  },
  weekday: {
    flex: 1,
    textAlign: 'center',
    fontSize: 11,
    color: COLORS.textTertiary,
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 16,
  },
  dayCell: {
    width: '14.28%',
    aspectRatio: 1,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 12,
  },
  dayCellActive: {
    backgroundColor: COLORS.primary,
  },
  dayCellToday: {
    borderWidth: 1.5,
    borderColor: COLORS.primary,
  },
  dayText: {
    fontSize: 14,
    color: COLORS.textPrimary,
    fontWeight: '500',
  },
  dayTextActive: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  dayTextToday: {
    color: COLORS.primary,
    fontWeight: '700',
  },
  dayDot: {
    width: 5,
    height: 5,
    borderRadius: 3,
    backgroundColor: COLORS.primary,
    marginTop: 2,
  },
  dayDotActive: {
    backgroundColor: '#FFFFFF',
  },
  eventsSection: {
    flex: 1,
    paddingHorizontal: 20,
    marginTop: 12,
  },
  eventsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  eventsTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.textPrimary,
  },
  eventsBadge: {
    backgroundColor: COLORS.primarySurface,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 10,
  },
  eventsBadgeText: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.primary,
  },
  eventsList: {
    flex: 1,
  },
  emptyCard: {
    backgroundColor: COLORS.surface,
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    gap: 6,
    borderWidth: 1,
    borderColor: COLORS.divider,
  },
  emptyTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: COLORS.textPrimary,
  },
  emptyText: {
    fontSize: 12,
    color: COLORS.textSecondary,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'flex-end',
  },
  modal: {
    backgroundColor: COLORS.surface,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    gap: 12,
  },
  modalHandle: {
    width: 36,
    height: 4,
    borderRadius: 2,
    backgroundColor: COLORS.divider,
    alignSelf: 'center',
    marginBottom: 8,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: COLORS.textPrimary,
    marginBottom: 8,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surfaceSecondary,
    borderRadius: 12,
    paddingHorizontal: 14,
    borderWidth: 1,
    borderColor: COLORS.divider,
  },
  inputIcon: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    paddingVertical: 12,
    fontSize: 14,
    color: COLORS.textPrimary,
  },
  timeRow: {
    flexDirection: 'row',
    gap: 10,
  },
  modalButtons: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 16,
  },
  cancelButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    backgroundColor: COLORS.surfaceSecondary,
    borderWidth: 1,
    borderColor: COLORS.divider,
  },
  cancelText: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.textSecondary,
  },
  saveButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    backgroundColor: COLORS.primary,
  },
  saveText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
  },
});
