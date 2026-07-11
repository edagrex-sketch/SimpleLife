import { MoodConfig, MoodType } from '../types';

export const MOODS: Record<MoodType, MoodConfig> = {
  happy: {
    emoji: '😊',
    label: 'Feliz',
    color: '#F59E0B',
    gradient: ['#F59E0B', '#F97316'] as const,
  },
  calm: {
    emoji: '😌',
    label: 'Tranquilo',
    color: '#3B82F6',
    gradient: ['#3B82F6', '#06B6D4'] as const,
  },
  neutral: {
    emoji: '😐',
    label: 'Neutral',
    color: '#6B7280',
    gradient: ['#6B7280', '#9CA3AF'] as const,
  },
  sad: {
    emoji: '😢',
    label: 'Triste',
    color: '#8B5CF6',
    gradient: ['#7C3AED', '#8B5CF6'] as const,
  },
  angry: {
    emoji: '😡',
    label: 'Enojado',
    color: '#EF4444',
    gradient: ['#DC2626', '#EF4444'] as const,
  },
  excited: {
    emoji: '🥳',
    label: 'Emocionado',
    color: '#EC4899',
    gradient: ['#EC4899', '#F43F5E'] as const,
  },
};

export const MOOD_LIST = Object.entries(MOODS).map(([key, value]) => ({
  key: key as MoodType,
  ...value,
}));
