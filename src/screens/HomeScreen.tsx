import React, { useEffect } from 'react';
import { StyleSheet, Text, View, ScrollView } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  withDelay,
  FadeInUp,
} from 'react-native-reanimated';
import { useMood } from '../context/MoodContext';
import { MOODS } from '../utils/colors';
import AnimatedGradient from '../components/AnimatedGradient';
import EntryCard from '../components/EntryCard';

const StatBox = ({ label, value, color, delay }: { label: string; value: string; color: string; delay: number }) => {
  const scale = useSharedValue(0);

  useEffect(() => {
    scale.value = withDelay(delay, withSpring(1, { damping: 10 }));
  }, []);

  const animStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    opacity: scale.value,
  }));

  return (
    <Animated.View style={[styles.statBox, { borderColor: color + '40' }, animStyle]}>
      <Text style={[styles.statValue, { color }]}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </Animated.View>
  );
};

export default function HomeScreen({ onNavigate }: { onNavigate: (screen: string) => void }) {
  const { entries, todayEntry } = useMood();
  const currentMood = todayEntry?.mood ?? 'happy';
  const mood = MOODS[currentMood];
  const recentEntries = entries.slice(0, 5);

  const streak = (() => {
    let count = 0;
    const today = new Date();
    for (let i = 0; i < 365; i++) {
      const d = new Date(today);
      d.setDate(d.getDate() - i);
      const ds = d.toISOString().split('T')[0];
      if (entries.some(e => e.date === ds)) count++;
      else break;
    }
    return count;
  })();

  const moodCounts = entries.reduce((acc, e) => {
    acc[e.mood] = (acc[e.mood] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);
  const topMood = Object.entries(moodCounts).sort((a, b) => b[1] - a[1])[0];
  const topMoodLabel = topMood ? MOODS[topMood[0] as keyof typeof MOODS]?.label : '-';

  return (
    <View style={styles.container}>
      <AnimatedGradient mood={currentMood} />
      <ScrollView style={styles.scroll} contentContainerStyle={styles.content}>
        <View style={styles.header}>
          <Animated.Text
            entering={FadeInUp.delay(100).springify()}
            style={styles.greeting}>
            {todayEntry ? `Hoy te sientes` : '¿Cómo te sientes hoy?'}
          </Animated.Text>
          {todayEntry ? (
            <Animated.View
              entering={FadeInUp.delay(200).springify()}
              style={styles.todayCard}>
              <Text style={styles.todayEmoji}>{mood.emoji}</Text>
              <Text style={[styles.todayMood, { color: mood.color }]}>
                {mood.label}
              </Text>
              {todayEntry.note ? (
                <Text style={styles.todayNote}>{todayEntry.note}</Text>
              ) : null}
            </Animated.View>
          ) : (
            <Animated.View entering={FadeInUp.delay(200).springify()}>
              <Text style={styles.subtitle}>
                Toca + para registrar tu estado de ánimo
              </Text>
            </Animated.View>
          )}
        </View>

        <View style={styles.statsRow}>
          <StatBox label="Días seguidos" value={`${streak}`} color={mood.color} delay={300} />
          <StatBox label="Registros" value={`${entries.length}`} color={mood.color} delay={400} />
          <StatBox label="Estado común" value={topMoodLabel} color={mood.color} delay={500} />
        </View>

        <Text style={styles.sectionTitle}>Registros recientes</Text>
        {recentEntries.length === 0 ? (
          <Text style={styles.emptyText}>Aún no hay registros. ¡Empieza hoy!</Text>
        ) : (
          recentEntries.map((entry, i) => (
            <EntryCard key={entry.id} entry={entry} index={i} />
          ))
        )}

        <View style={{ height: 100 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scroll: { flex: 1 },
  content: { paddingTop: 80 },
  header: { alignItems: 'center', paddingHorizontal: 24, marginBottom: 24 },
  greeting: {
    fontSize: 20,
    fontWeight: '600',
    color: '#fff',
    textShadowColor: 'rgba(0,0,0,0.2)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
    marginBottom: 16,
  },
  todayCard: {
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 24,
    padding: 24,
    minWidth: 200,

  },
  todayEmoji: { fontSize: 64, marginBottom: 8 },
  todayMood: { fontSize: 24, fontWeight: '800' },
  todayNote: {
    fontSize: 14,
    color: '#fff',
    marginTop: 8,
    textAlign: 'center',
    opacity: 0.9,
  },
  subtitle: {
    fontSize: 16,
    color: 'rgba(255,255,255,0.8)',
    textAlign: 'center',
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 12,
    paddingHorizontal: 16,
    marginBottom: 24,
  },
  statBox: {
    backgroundColor: 'rgba(255,255,255,0.9)',
    borderRadius: 16,
    padding: 14,
    alignItems: 'center',
    flex: 1,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  statValue: { fontSize: 22, fontWeight: '800' },
  statLabel: { fontSize: 11, color: '#6B7280', marginTop: 4, textAlign: 'center' },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1F2937',
    marginLeft: 20,
    marginBottom: 12,
  },
  emptyText: {
    textAlign: 'center',
    color: '#9CA3AF',
    fontSize: 15,
    marginTop: 20,
  },
});
