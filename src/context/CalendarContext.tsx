import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { supabase } from '../utils/supabase';
import { useAuth } from './AuthContext';
import { CalendarEvent } from '../types';

interface CalendarContextType {
  events: CalendarEvent[];
  loading: boolean;
  fetchEvents: () => Promise<void>;
  addEvent: (event: Omit<CalendarEvent, 'id' | 'created_at' | 'user_id'>) => Promise<string | null>;
  deleteEvent: (id: string) => Promise<void>;
  updateEvent: (id: string, updates: Partial<CalendarEvent>) => Promise<string | null>;
}

const CalendarContext = createContext<CalendarContextType>({
  events: [], loading: false, fetchEvents: async () => {},
  addEvent: async () => null, deleteEvent: async () => {}, updateEvent: async () => null,
});

export function CalendarProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchEvents = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    try {
      const { data } = await supabase
        .from('calendar_events')
        .select('*')
        .eq('user_id', user.id)
        .order('event_date', { ascending: true });
      if (data) setEvents(data as CalendarEvent[]);
    } catch (e) {
      console.error('Error fetching events:', e);
    }
    setLoading(false);
  }, [user]);

  useEffect(() => { fetchEvents(); }, [fetchEvents]);

  const addEvent = useCallback(async (event: Omit<CalendarEvent, 'id' | 'created_at' | 'user_id'>) => {
    if (!user) return 'No hay sesión';
    try {
      const { error } = await supabase.from('calendar_events').insert({ ...event, user_id: user.id });
      if (error) return error.message;
      await fetchEvents();
      return null;
    } catch (e: any) {
      return e.message || 'Error al crear evento';
    }
  }, [user, fetchEvents]);

  const deleteEvent = useCallback(async (id: string) => {
    try {
      await supabase.from('calendar_events').delete().eq('id', id);
      await fetchEvents();
    } catch (e) {
      console.error('Error deleting event:', e);
    }
  }, [fetchEvents]);

  const updateEvent = useCallback(async (id: string, updates: Partial<CalendarEvent>) => {
    try {
      const { error } = await supabase.from('calendar_events').update(updates).eq('id', id);
      if (error) return error.message;
      await fetchEvents();
      return null;
    } catch (e: any) {
      return e.message || 'Error al actualizar evento';
    }
  }, [fetchEvents]);

  return (
    <CalendarContext.Provider value={{ events, loading, fetchEvents, addEvent, deleteEvent, updateEvent }}>
      {children}
    </CalendarContext.Provider>
  );
}

export function useCalendar() {
  return useContext(CalendarContext);
}
