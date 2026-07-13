import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { supabase } from '../utils/supabase';
import { useAuth } from './AuthContext';
import { CalendarEvent } from '../types';

interface CalendarContextType {
  events: CalendarEvent[];
  loading: boolean;
  fetchEvents: () => Promise<void>;
  addEvent: (event: Omit<CalendarEvent, 'id' | 'created_at' | 'user_id'>) => Promise<void>;
  deleteEvent: (id: string) => Promise<void>;
  updateEvent: (id: string, updates: Partial<CalendarEvent>) => Promise<void>;
}

const CalendarContext = createContext<CalendarContextType>({
  events: [], loading: false, fetchEvents: async () => {},
  addEvent: async () => {}, deleteEvent: async () => {}, updateEvent: async () => {},
});

export function CalendarProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchEvents = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    const { data } = await supabase
      .from('calendar_events')
      .select('*')
      .eq('user_id', user.id)
      .order('event_date', { ascending: true });
    if (data) setEvents(data as CalendarEvent[]);
    setLoading(false);
  }, [user]);

  useEffect(() => { fetchEvents(); }, [fetchEvents]);

  const addEvent = useCallback(async (event: Omit<CalendarEvent, 'id' | 'created_at' | 'user_id'>) => {
    if (!user) return;
    await supabase.from('calendar_events').insert({ ...event, user_id: user.id });
    await fetchEvents();
  }, [user, fetchEvents]);

  const deleteEvent = useCallback(async (id: string) => {
    await supabase.from('calendar_events').delete().eq('id', id);
    await fetchEvents();
  }, [fetchEvents]);

  const updateEvent = useCallback(async (id: string, updates: Partial<CalendarEvent>) => {
    await supabase.from('calendar_events').update(updates).eq('id', id);
    await fetchEvents();
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
