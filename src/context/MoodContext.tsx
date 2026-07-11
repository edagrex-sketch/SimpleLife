import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { MoodEntry, MoodType } from '../types';
import { loadEntries, addEntry, saveEntries } from '../utils/storage';

interface MoodContextType {
  entries: MoodEntry[];
  todayEntry: MoodEntry | undefined;
  addNewEntry: (mood: MoodType, note: string, intensity: number) => Promise<void>;
  refresh: () => Promise<void>;
}

const MoodContext = createContext<MoodContextType>({
  entries: [],
  todayEntry: undefined,
  addNewEntry: async () => {},
  refresh: async () => {},
});

export function MoodProvider({ children }: { children: React.ReactNode }) {
  const [entries, setEntries] = useState<MoodEntry[]>([]);
  const [todayEntry, setTodayEntry] = useState<MoodEntry | undefined>();

  const refresh = useCallback(async () => {
    const loaded = await loadEntries();
    setEntries(loaded);
    const today = new Date().toISOString().split('T')[0];
    setTodayEntry(loaded.find(e => e.date === today));
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const addNewEntry = useCallback(async (mood: MoodType, note: string, intensity: number) => {
    const entry: MoodEntry = {
      id: Date.now().toString(),
      date: new Date().toISOString().split('T')[0],
      mood,
      note,
      intensity,
    };
    await addEntry(entry);
    await refresh();
  }, [refresh]);

  return (
    <MoodContext.Provider value={{ entries, todayEntry, addNewEntry, refresh }}>
      {children}
    </MoodContext.Provider>
  );
}

export function useMood() {
  return useContext(MoodContext);
}
