import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { COLORS } from '../utils/colors';

interface TaskEmptyStateProps {
  filter: string;
}

const FILTER_EMPTY: Record<string, { icon: string; title: string; text: string; color: string }> = {
  Todas: {
    icon: 'checkmark-done-circle-outline',
    title: 'Sin tareas',
    text: 'Crea tu primera tarea tocando el botón +',
    color: COLORS.textTertiary,
  },
  Hoy: {
    icon: 'sunny-outline',
    title: 'Día libre',
    text: 'No tienes tareas para hoy. Añade una o revisa otras fechas.',
    color: COLORS.tertiary,
  },
  Pendientes: {
    icon: 'trophy-outline',
    title: '¡Todo completado!',
    text: 'No hay tareas pendientes. ¡Buen trabajo!',
    color: COLORS.success,
  },
  Completadas: {
    icon: 'flag-outline',
    title: 'Nada aún',
    text: 'Aún no has completado ninguna tarea. ¡Vamos!',
    color: COLORS.primary,
  },
};

export default function TaskEmptyState({ filter }: TaskEmptyStateProps) {
  const config = FILTER_EMPTY[filter] || FILTER_EMPTY.Todas;

  return (
    <View style={styles.container}>
      <View style={[styles.iconContainer, { backgroundColor: config.color + '15' }]}>
        <Ionicons name={config.icon as any} size={40} color={config.color} />
      </View>
      <Text style={styles.title}>{config.title}</Text>
      <Text style={styles.text}>{config.text}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    paddingVertical: 48,
    paddingHorizontal: 32,
  },
  iconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.textPrimary,
    marginBottom: 8,
  },
  text: {
    fontSize: 14,
    color: COLORS.textSecondary,
    textAlign: 'center',
    lineHeight: 21,
  },
});
