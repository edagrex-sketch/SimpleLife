import React from 'react';
import { StyleSheet, Text, View, FlatList } from 'react-native';
import Animated, { FadeInUp } from 'react-native-reanimated';
import { useMood } from '../context/MoodContext';
import EntryCard from '../components/EntryCard';

export default function TimelineScreen() {
  const { entries } = useMood();

  return (
    <View style={styles.container}>
      <Animated.View entering={FadeInUp.springify()} style={styles.header}>
        <Text style={styles.title}>Línea de tiempo</Text>
        <Text style={styles.subtitle}>{entries.length} registros</Text>
      </Animated.View>
      <FlatList
        data={entries}
        keyExtractor={item => item.id}
        renderItem={({ item, index }) => <EntryCard entry={item} index={index} />}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <Text style={styles.empty}>No hay registros aún</Text>
        }
      />
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
  list: { paddingTop: 16, paddingBottom: 40 },
  empty: { textAlign: 'center', color: '#9CA3AF', fontSize: 15, marginTop: 60 },
});
