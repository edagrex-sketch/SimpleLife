import React from 'react';
import { View, Text, Pressable, ScrollView, StyleSheet } from 'react-native';
import { COLORS } from '../utils/colors';
import { hapticSelection } from '../hooks/useHaptic';

interface TaskFilter {
  id: string;
  label: string;
  count: number;
}

interface TaskFiltersProps {
  filters: TaskFilter[];
  activeFilter: string;
  onFilterPress: (filterId: string) => void;
}

export default function TaskFilters({ filters, activeFilter, onFilterPress }: TaskFiltersProps) {
  const handlePress = (filterId: string) => {
    hapticSelection();
    onFilterPress(filterId);
  };

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.container}
    >
      {filters.map((f) => (
        <Pressable
          key={f.id}
          style={[styles.chip, activeFilter === f.id && styles.chipActive]}
          onPress={() => handlePress(f.id)}
        >
          <Text style={[styles.label, activeFilter === f.id && styles.labelActive]}>
            {f.label}
          </Text>
          <Text style={[styles.count, activeFilter === f.id && styles.countActive]}>
            {f.count}
          </Text>
        </Pressable>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 20,
    gap: 8,
    marginBottom: 16,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.divider,
    gap: 6,
  },
  chipActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  label: {
    fontSize: 13,
    color: COLORS.textSecondary,
    fontWeight: '500',
  },
  labelActive: {
    color: COLORS.surface,
    fontWeight: '600',
  },
  count: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.textTertiary,
    backgroundColor: COLORS.surfaceSecondary,
    borderRadius: 8,
    paddingHorizontal: 6,
    paddingVertical: 1,
    overflow: 'hidden',
  },
  countActive: {
    color: COLORS.surface,
    backgroundColor: 'rgba(255,255,255,0.25)',
  },
});
