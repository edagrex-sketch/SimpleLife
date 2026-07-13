import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import Animated from 'react-native-reanimated';
import GlassBox from './GlassBox';
import { Expense } from '../types';
import { COLORS, CATEGORY_COLORS } from '../utils/colors';
import { formatDate, formatAmount } from '../utils/helpers';
import { useScalePress } from '../hooks/useScalePress';

interface ExpenseCardProps {
  expense: Expense;
  onDelete: () => void;
}

export default function ExpenseCard({ expense, onDelete }: ExpenseCardProps) {
  const catColor = CATEGORY_COLORS[expense.category || 'Otros'] || COLORS.textTertiary;
  const { animatedStyle, onPressIn, onPressOut } = useScalePress();

  return (
    <Pressable onLongPress={onDelete} onPressIn={onPressIn} onPressOut={onPressOut}>
      <Animated.View style={animatedStyle}>
        <GlassBox style={styles.card}>
          <View style={styles.row}>
            <View style={[styles.categoryDot, { backgroundColor: catColor }]} />
            <View style={styles.content}>
              <View style={styles.topRow}>
                <Text style={styles.title} numberOfLines={1}>{expense.title}</Text>
                <Text style={styles.amount}>{formatAmount(expense.amount)}</Text>
              </View>
              <Text style={styles.category}>{expense.category || 'Otros'}</Text>
              {expense.date && <Text style={styles.date}>{formatDate(expense.date)}</Text>}
            </View>
          </View>
        </GlassBox>
      </Animated.View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: { marginBottom: 8, paddingVertical: 12, paddingHorizontal: 14 },
  row: { flexDirection: 'row', alignItems: 'center' },
  categoryDot: { width: 4, height: 36, borderRadius: 2, marginRight: 12 },
  content: { flex: 1 },
  topRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  title: { fontSize: 15, fontWeight: '600', color: COLORS.textPrimary, flex: 1 },
  amount: { fontSize: 16, fontWeight: '700', color: COLORS.primary },
  category: { fontSize: 12, color: COLORS.textSecondary, marginTop: 2 },
  date: { fontSize: 11, color: COLORS.textTertiary, marginTop: 2 },
});
