export type MoodType = 'happy' | 'calm' | 'neutral' | 'sad' | 'angry' | 'excited';

export interface MoodEntry {
  id: string;
  date: string;
  mood: MoodType;
  note: string;
  intensity: number;
}

export interface MoodConfig {
  emoji: string;
  label: string;
  color: string;
  gradient: readonly [string, string];
}
