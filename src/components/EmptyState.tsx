import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { COLORS } from '../utils/colors';

interface EmptyStateProps {
  icon: string;
  title: string;
  subtitle?: string;
}

export default function EmptyState({ icon, title, subtitle }: EmptyStateProps) {
  return (
    <View style={styles.container}>
      <Text style={styles.icon}>{icon}</Text>
      <Text style={styles.title}>{title}</Text>
      {subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingVertical: 60 },
  icon: { fontSize: 48, marginBottom: 16, opacity: 0.6 },
  title: { fontSize: 18, fontWeight: '600', color: COLORS.textSecondary, textAlign: 'center' },
  subtitle: { fontSize: 13, color: COLORS.textTertiary, marginTop: 4, textAlign: 'center' },
});
