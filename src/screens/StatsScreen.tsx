import React, { useEffect } from 'react';
import { StyleSheet, Text, View, ScrollView, Dimensions } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withDelay,
  FadeInUp,
} from 'react-native-reanimated';
import Svg, { Circle, Line, Path } from 'react-native-svg';
import { useMood } from '../context/MoodContext';
import { MOODS, MOOD_LIST } from '../utils/colors';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const SIZE = SCREEN_WIDTH - 64;
const RADIUS = SIZE / 2 - 20;

function AnimatedDonut() {
  const { entries } = useMood();
  const progress = useSharedValue(0);

  useEffect(() => {
    progress.value = withTiming(1, { duration: 1200 });
  }, [entries]);

  const total = entries.length || 1;
  const segments = MOOD_LIST.map(m => {
    const count = entries.filter(e => e.mood === m.key).length;
    const pct = (count / total) * 100;
    return { ...m, count, pct: Math.round(pct * 10) / 10 };
  }).filter(s => s.count > 0);

  let cumulativeAngle = -90;
  const arcs = segments.map(s => {
    const angle = (s.pct / 100) * 360;
    const start = cumulativeAngle;
    cumulativeAngle += angle;
    return { ...s, startAngle: start, endAngle: start + angle };
  });

  return (
    <View style={styles.chartContainer}>
      <Svg width={SIZE} height={SIZE}>
        {arcs.map((arc, i) => {
          const startRad = (arc.startAngle * Math.PI) / 180;
          const endRad = (arc.endAngle * Math.PI) / 180;
          const x1 = RADIUS + RADIUS * Math.cos(startRad);
          const y1 = RADIUS + RADIUS * Math.sin(startRad);
          const x2 = RADIUS + RADIUS * Math.cos(endRad);
          const y2 = RADIUS + RADIUS * Math.sin(endRad);
          const largeArc = arc.endAngle - arc.startAngle > 180 ? 1 : 0;

          return (
            <Path
              key={i}
              d={`M ${RADIUS + RADIUS} ${RADIUS} A ${RADIUS} ${RADIUS} 0 ${largeArc} 1 ${x2} ${y2}`}
              stroke={arc.color}
              strokeWidth={24}
              fill="none"
              strokeLinecap="round"
              opacity={progress.value}
            />
          );
        })}
      </Svg>
      <View style={styles.centerLabel}>
        <Text style={styles.centerCount}>{entries.length}</Text>
        <Text style={styles.centerText}>total</Text>
      </View>
    </View>
  );
}

function MoodBar({ label, color, emoji, count, max, delay }: {
  label: string; color: string; emoji: string; count: number; max: number; delay: number;
}) {
  const w = useSharedValue(0);

  useEffect(() => {
    w.value = withDelay(delay, withTiming(1, { duration: 600 }));
  }, [count]);

  const animStyle = useAnimatedStyle(() => ({
    width: `${w.value * (count / max) * 100}%`,
  }));

  return (
    <Animated.View entering={FadeInUp.delay(delay).springify()} style={styles.barRow}>
      <Text style={styles.barEmoji}>{emoji}</Text>
      <View style={styles.barTrack}>
        <Animated.View style={[styles.barFill, { backgroundColor: color }, animStyle]} />
      </View>
      <Text style={styles.barCount}>{count}</Text>
    </Animated.View>
  );
}

export default function StatsScreen() {
  const { entries } = useMood();
  const maxCount = Math.max(...MOOD_LIST.map(m => entries.filter(e => e.mood === m.key).length), 1);

  const weekDays = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
  const today = new Date();
  const weekData = weekDays.map((day, i) => {
    const d = new Date(today);
    d.setDate(d.getDate() - (6 - i));
    const ds = d.toISOString().split('T')[0];
    const entry = entries.find(e => e.date === ds);
    return { day, date: ds, mood: entry?.mood || null };
  });

  return (
    <View style={styles.container}>
      <Animated.View entering={FadeInUp.springify()} style={styles.header}>
        <Text style={styles.title}>Estadísticas</Text>
        <Text style={styles.subtitle}>Tu estado de ánimo en datos</Text>
      </Animated.View>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Distribución</Text>
          <AnimatedDonut />
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Esta semana</Text>
          <View style={styles.weekRow}>
            {weekData.map((d, i) => (
              <Animated.View
                key={d.date}
                entering={FadeInUp.delay(i * 60).springify()}
                style={styles.weekItem}>
                <View
                  style={[
                    styles.weekOrb,
                    { backgroundColor: d.mood ? MOODS[d.mood].color : '#E5E7EB' },
                  ]}>
                  <Text style={styles.weekEmoji}>{d.mood ? MOODS[d.mood].emoji : '-'}</Text>
                </View>
                <Text style={styles.weekLabel}>{d.day}</Text>
              </Animated.View>
            ))}
          </View>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Frecuencia</Text>
          {MOOD_LIST.map((m, i) => (
            <MoodBar
              key={m.key}
              label={m.label}
              color={m.color}
              emoji={m.emoji}
              count={entries.filter(e => e.mood === m.key).length}
              max={maxCount}
              delay={i * 80}
            />
          ))}
        </View>

        <View style={{ height: 60 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F3F4F6' },
  header: {
    paddingTop: 80,
    paddingHorizontal: 24,
    paddingBottom: 16,
    backgroundColor: '#fff',
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 12,
    elevation: 4,
  },
  title: { fontSize: 28, fontWeight: '800', color: '#1F2937' },
  subtitle: { fontSize: 14, color: '#6B7280', marginTop: 4 },
  content: { padding: 16, gap: 16 },
  card: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
  },
  cardTitle: { fontSize: 17, fontWeight: '700', color: '#1F2937', marginBottom: 16 },
  chartContainer: { alignItems: 'center', justifyContent: 'center' },
  centerLabel: { position: 'absolute', alignItems: 'center' },
  centerCount: { fontSize: 36, fontWeight: '800', color: '#1F2937' },
  centerText: { fontSize: 14, color: '#6B7280' },
  weekRow: { flexDirection: 'row', justifyContent: 'space-between' },
  weekItem: { alignItems: 'center', gap: 6 },
  weekOrb: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  weekEmoji: { fontSize: 18 },
  weekLabel: { fontSize: 11, color: '#6B7280', fontWeight: '600' },
  barRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 10 },
  barEmoji: { fontSize: 18, width: 28, textAlign: 'center' },
  barTrack: {
    flex: 1,
    height: 10,
    backgroundColor: '#F3F4F6',
    borderRadius: 5,
    overflow: 'hidden',
  },
  barFill: { height: '100%', borderRadius: 5 },
  barCount: { fontSize: 14, fontWeight: '700', color: '#374151', width: 28, textAlign: 'right' },
});
