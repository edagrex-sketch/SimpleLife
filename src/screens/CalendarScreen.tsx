import React, { useState } from 'react';
import { View, Text, ScrollView, Pressable, TextInput, Modal, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import EventCard from '../components/EventCard';
import EmptyState from '../components/EmptyState';
import { COLORS } from '../utils/colors';
import { useCalendar } from '../context/CalendarContext';
import { MONTHS, DAYS, getMonthDays, formatDate } from '../utils/helpers';

export default function CalendarScreen() {
  const { events, addEvent, deleteEvent } = useCalendar();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDay, setSelectedDay] = useState<number | null>(new Date().getDate());
  const [showModal, setShowModal] = useState(false);

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const days = getMonthDays(year, month);

  const selectedDate = selectedDay
    ? `${year}-${String(month + 1).padStart(2, '0')}-${String(selectedDay).padStart(2, '0')}`
    : null;

  const dayEvents = selectedDate
    ? events.filter(e => e.event_date === selectedDate)
    : [];

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');

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
    return events.some(e => e.event_date === dateStr);
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.title}>Calendario</Text>
        <Text style={styles.count}>{events.length} eventos</Text>
      </View>

      <View style={styles.monthNav}>
        <Pressable onPress={prevMonth}><Text style={styles.navArrow}>◀</Text></Pressable>
        <Text style={styles.monthTitle}>{MONTHS[month]} {year}</Text>
        <Pressable onPress={nextMonth}><Text style={styles.navArrow}>▶</Text></Pressable>
      </View>

      <View style={styles.weekdays}>
        {DAYS.map(d => <Text key={d} style={styles.weekday}>{d}</Text>)}
      </View>

      <View style={styles.grid}>
        {days.map((d, i) => (
          <Pressable
            key={i}
            style={[
              styles.dayCell,
              d === selectedDay && styles.dayCellActive,
              d === new Date().getDate() && month === new Date().getMonth() && year === new Date().getFullYear() && styles.dayCellToday,
            ]}
            onPress={() => d && setSelectedDay(d)}
            disabled={!d}
          >
            <Text style={[styles.dayText, d === selectedDay && styles.dayTextActive]}>{d}</Text>
            {d && hasEvent(d) && <View style={styles.dayDot} />}
          </Pressable>
        ))}
      </View>

      <View style={styles.eventsSection}>
        <Text style={styles.eventsTitle}>{selectedDate ? formatDate(selectedDate) : 'Selecciona un día'}</Text>
        <ScrollView style={styles.eventsList} showsVerticalScrollIndicator={false}>
          {dayEvents.length === 0 ? (
            <EmptyState icon="📅" title="Sin eventos" subtitle="Agrega un evento a este día" />
          ) : (
            dayEvents.map(event => (
              <EventCard key={event.id} event={event} onPress={() => deleteEvent(event.id)} />
            ))
          )}
        </ScrollView>
      </View>

      <Pressable style={styles.fab} onPress={() => setShowModal(true)}>
        <Text style={styles.fabText}>+</Text>
      </Pressable>

      <Modal visible={showModal} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modal}>
            <Text style={styles.modalTitle}>Nuevo Evento</Text>
            <TextInput style={styles.input} placeholder="Título" placeholderTextColor={COLORS.textTertiary} value={title} onChangeText={setTitle} />
            <TextInput style={styles.input} placeholder="Descripción" placeholderTextColor={COLORS.textTertiary} value={description} onChangeText={setDescription} multiline />
            <TextInput style={styles.input} placeholder="Hora inicio (HH:MM)" placeholderTextColor={COLORS.textTertiary} value={startTime} onChangeText={setStartTime} />
            <TextInput style={styles.input} placeholder="Hora fin (HH:MM)" placeholderTextColor={COLORS.textTertiary} value={endTime} onChangeText={setEndTime} />
            <View style={styles.modalButtons}>
              <Pressable style={styles.cancelButton} onPress={() => setShowModal(false)}>
                <Text style={styles.cancelText}>Cancelar</Text>
              </Pressable>
              <Pressable style={styles.saveButton} onPress={handleAdd}>
                <Text style={styles.saveText}>Crear</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, paddingTop: 20 },
  title: { fontSize: 28, fontWeight: '700', color: COLORS.textPrimary },
  count: { fontSize: 13, color: COLORS.textSecondary },
  monthNav: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, marginTop: 16, marginBottom: 8 },
  navArrow: { fontSize: 18, color: COLORS.primary, padding: 8 },
  monthTitle: { fontSize: 18, fontWeight: '600', color: COLORS.textPrimary },
  weekdays: { flexDirection: 'row', paddingHorizontal: 16, marginBottom: 4 },
  weekday: { flex: 1, textAlign: 'center', fontSize: 11, color: COLORS.textTertiary, fontWeight: '600' },
  grid: { flexDirection: 'row', flexWrap: 'wrap', paddingHorizontal: 16 },
  dayCell: { width: '14.28%', aspectRatio: 1, alignItems: 'center', justifyContent: 'center', borderRadius: 12 },
  dayCellActive: { backgroundColor: COLORS.primary },
  dayCellToday: { borderWidth: 1.5, borderColor: COLORS.primary },
  dayText: { fontSize: 14, color: COLORS.textPrimary, fontWeight: '500' },
  dayTextActive: { color: '#fff', fontWeight: '700' },
  dayDot: { width: 5, height: 5, borderRadius: 3, backgroundColor: COLORS.primary, marginTop: 2 },
  eventsSection: { flex: 1, paddingHorizontal: 20, marginTop: 12 },
  eventsTitle: { fontSize: 16, fontWeight: '600', color: COLORS.textPrimary, marginBottom: 8 },
  eventsList: { flex: 1 },
  fab: {
    position: 'absolute', bottom: 20, right: 20, width: 56, height: 56, borderRadius: 28,
    backgroundColor: COLORS.primary, alignItems: 'center', justifyContent: 'center',
    shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.2, shadowRadius: 8, elevation: 6,
  },
  fabText: { fontSize: 28, color: '#fff', lineHeight: 30 },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'flex-end' },
  modal: { backgroundColor: COLORS.surface, borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 24, gap: 12 },
  modalTitle: { fontSize: 20, fontWeight: '700', color: COLORS.textPrimary, marginBottom: 8 },
  input: { backgroundColor: COLORS.background, borderRadius: 12, paddingHorizontal: 14, paddingVertical: 12, fontSize: 14, color: COLORS.textPrimary },
  modalButtons: { flexDirection: 'row', gap: 12, marginTop: 16 },
  cancelButton: { flex: 1, paddingVertical: 14, borderRadius: 12, alignItems: 'center', backgroundColor: COLORS.background },
  cancelText: { fontSize: 14, fontWeight: '600', color: COLORS.textSecondary },
  saveButton: { flex: 1, paddingVertical: 14, borderRadius: 12, alignItems: 'center', backgroundColor: COLORS.primary },
  saveText: { fontSize: 14, fontWeight: '600', color: '#fff' },
});
