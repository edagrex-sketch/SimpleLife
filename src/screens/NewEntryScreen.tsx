import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  Pressable,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withSequence,
  FadeInUp,
} from 'react-native-reanimated';
import { useMood } from '../context/MoodContext';
import { MOODS } from '../utils/colors';
import { MoodType } from '../types';
import EmotionPicker from '../components/EmotionPicker';

const INTENSITIES = [
  { label: 'Muy bajo', value: 1 },
  { label: 'Bajo', value: 2 },
  { label: 'Normal', value: 3 },
  { label: 'Fuerte', value: 4 },
  { label: 'Muy fuerte', value: 5 },
];

export default function NewEntryScreen({ onBack }: { onBack: () => void }) {
  const { addNewEntry } = useMood();
  const [selectedMood, setSelectedMood] = useState<MoodType | null>(null);
  const [note, setNote] = useState('');
  const [intensity, setIntensity] = useState(3);
  const [saving, setSaving] = useState(false);

  const scale = useSharedValue(1);
  const intensityValues = INTENSITIES.map(() => useSharedValue(1));

  const handleSave = async () => {
    if (!selectedMood) return;
    setSaving(true);
    scale.value = withSequence(withSpring(0.95), withSpring(1));
    await addNewEntry(selectedMood, note, intensity);
    onBack();
  };

  const moodColor = selectedMood ? MOODS[selectedMood].color : '#6B7280';

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <Animated.View entering={FadeInUp.springify()} style={styles.header}>
        <Pressable onPress={onBack} style={styles.backButton}>
          <Text style={styles.backText}>Cancelar</Text>
        </Pressable>
        <Text style={styles.title}>Nuevo registro</Text>
        <View style={{ width: 60 }} />
      </Animated.View>

      <Animated.View entering={FadeInUp.delay(100).springify()} style={styles.section}>
        <Text style={styles.sectionLabel}>¿Cómo te sientes?</Text>
        <EmotionPicker selected={selectedMood} onSelect={setSelectedMood} />
      </Animated.View>

      <Animated.View entering={FadeInUp.delay(200).springify()} style={styles.section}>
        <Text style={styles.sectionLabel}>Intensidad</Text>
        <View style={styles.intensityRow}>
          {INTENSITIES.map((item, i) => {
            const isActive = intensity === item.value;
            return (
              <Pressable
                key={item.value}
                onPress={() => setIntensity(item.value)}
                style={[
                  styles.intensityBox,
                  { borderColor: moodColor + '30' },
                  isActive && { backgroundColor: moodColor + '20', borderColor: moodColor },
                ]}>
                <Text style={[styles.intensityText, isActive && { color: moodColor }]}>
                  {item.label}
                </Text>
              </Pressable>
            );
          })}
        </View>
      </Animated.View>

      <Animated.View entering={FadeInUp.delay(300).springify()} style={styles.section}>
        <Text style={styles.sectionLabel}>Nota (opcional)</Text>
        <TextInput
          style={[styles.input, { borderColor: moodColor + '30' }]}
          placeholder="¿Qué pasó hoy?"
          placeholderTextColor="#9CA3AF"
          multiline
          value={note}
          onChangeText={setNote}
          maxLength={280}
        />
      </Animated.View>

      <Animated.View entering={FadeInUp.delay(400).springify()} style={styles.footer}>
        <Pressable
          onPress={handleSave}
          disabled={!selectedMood || saving}
          style={[
            styles.saveButton,
            { backgroundColor: moodColor },
            !selectedMood && styles.saveDisabled,
          ]}>
          <Text style={styles.saveText}>
            {saving ? 'Guardando...' : 'Guardar registro'}
          </Text>
        </Pressable>
      </Animated.View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F3F4F6' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 60,
    paddingHorizontal: 20,
    paddingBottom: 16,
  },
  backButton: { padding: 8 },
  backText: { fontSize: 16, color: '#6B7280', fontWeight: '600' },
  title: { fontSize: 18, fontWeight: '800', color: '#1F2937' },
  section: { paddingHorizontal: 20, marginBottom: 24 },
  sectionLabel: {
    fontSize: 15,
    fontWeight: '700',
    color: '#374151',
    marginBottom: 12,
  },
  intensityRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 6,
  },
  intensityBox: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 12,
    borderWidth: 2,
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  intensityText: { fontSize: 11, fontWeight: '600', color: '#6B7280', textAlign: 'center' },
  input: {
    backgroundColor: '#fff',
    borderRadius: 16,
    borderWidth: 2,
    padding: 16,
    fontSize: 16,
    color: '#1F2937',
    minHeight: 100,
    textAlignVertical: 'top',
  },
  footer: { paddingHorizontal: 20, marginTop: 'auto', paddingBottom: 40 },
  saveButton: {
    borderRadius: 16,
    paddingVertical: 16,
    alignItems: 'center',
  },
  saveDisabled: { opacity: 0.4 },
  saveText: { fontSize: 17, fontWeight: '700', color: '#fff' },
});
