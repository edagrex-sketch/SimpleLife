import React from 'react';
import { View, Text, Pressable, ScrollView, StyleSheet } from 'react-native';
import { COLORS, SHADOWS } from '../utils/colors';
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
          {f.count > 0 && (
            <View style={[styles.badge, activeFilter === f.id && styles.badgeActive]}>
              <Text style={[styles.badgeText, activeFilter === f.id && styles.badgeTextActive]}>
                {f.count}
              </Text>
            </View>
          )}
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
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 22,
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.divider,
    gap: 6,
    minHeight: 44,
  },
  chipActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  label: {
    fontSize: 13,
    color: COLORS.textSecondary,
    fontWeight: '600',
  },
  labelActive: {
    color: COLORS.surface,
  },
  badge: {
    backgroundColor: COLORS.surfaceSecondary,
    borderRadius: 10,
    paddingHorizontal: 7,
    paddingVertical: 2,
    minWidth: 22,
    alignItems: 'center',
  },
  badgeActive: {
    backgroundColor: 'rgba(255,255,255,0.25)',
  },
  badgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.textSecondary,
  },
  badgeTextActive: {
    color: COLORS.surface,
  },
});
