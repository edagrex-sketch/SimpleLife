import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import Animated from 'react-native-reanimated';
import GlassBox from './GlassBox';
import { CalendarEvent } from '../types';
import { COLORS } from '../utils/colors';
import { formatTime } from '../utils/helpers';
import { useScalePress } from '../hooks/useScalePress';

interface EventCardProps {
  event: CalendarEvent;
  onPress: () => void;
}

export default function EventCard({ event, onPress }: EventCardProps) {
  const { animatedStyle, onPressIn, onPressOut } = useScalePress();

  return (
    <Pressable onPress={onPress} onPressIn={onPressIn} onPressOut={onPressOut}>
      <Animated.View style={animatedStyle}>
        <GlassBox style={styles.card}>
          <View style={styles.row}>
            <View style={styles.timeCol}>
              {event.start_time && <Text style={styles.time}>{formatTime(event.start_time)}</Text>}
              {event.end_time && <Text style={styles.timeEnd}>{formatTime(event.end_time)}</Text>}
            </View>
            <View style={styles.divider} />
            <View style={styles.content}>
              <Text style={styles.title} numberOfLines={1}>{event.title}</Text>
              {event.description ? (
                <Text style={styles.desc} numberOfLines={1}>{event.description}</Text>
              ) : null}
              <Text style={styles.category}>{event.category || 'General'}</Text>
            </View>
          </View>
        </GlassBox>
      </Animated.View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: { marginBottom: 8, paddingVertical: 10, paddingHorizontal: 14 },
  row: { flexDirection: 'row', alignItems: 'center' },
  timeCol: { alignItems: 'center', minWidth: 52 },
  time: { fontSize: 13, fontWeight: '600', color: COLORS.primary },
  timeEnd: { fontSize: 11, color: COLORS.textTertiary, marginTop: 2 },
  divider: { width: 2, height: 32, backgroundColor: COLORS.divider, marginHorizontal: 12, borderRadius: 1 },
  content: { flex: 1 },
  title: { fontSize: 15, fontWeight: '600', color: COLORS.textPrimary },
  desc: { fontSize: 12, color: COLORS.textSecondary, marginTop: 2 },
  category: { fontSize: 11, color: COLORS.textTertiary, marginTop: 2 },
});
