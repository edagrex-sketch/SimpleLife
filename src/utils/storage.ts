import AsyncStorage from '@react-native-async-storage/async-storage';
import { MoodEntry } from '../types';

const STORAGE_KEY = '@aura_entries';

export async function loadEntries(): Promise<MoodEntry[]> {
  try {
    const data = await AsyncStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
}

export async function saveEntries(entries: MoodEntry[]): Promise<void> {
  try {
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(entries));
  } catch {}
}

export async function addEntry(entry: MoodEntry): Promise<void> {
  const entries = await loadEntries();
  entries.unshift(entry);
  await saveEntries(entries);
}

export async function getTodayEntry(): Promise<MoodEntry | undefined> {
  const entries = await loadEntries();
  const today = new Date().toISOString().split('T')[0];
  return entries.find(e => e.date === today);
}
