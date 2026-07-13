import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { supabase } from '../utils/supabase';
import { useAuth } from './AuthContext';
import { Task } from '../types';

interface TaskContextType {
  tasks: Task[];
  loading: boolean;
  fetchTasks: () => Promise<void>;
  addTask: (task: Omit<Task, 'id' | 'created_at' | 'user_id'>) => Promise<string | null>;
  toggleTask: (taskId: string) => Promise<void>;
  deleteTask: (taskId: string) => Promise<void>;
  updateTask: (taskId: string, updates: Partial<Task>) => Promise<string | null>;
}

const TaskContext = createContext<TaskContextType>({
  tasks: [], loading: false,
  fetchTasks: async () => {}, addTask: async () => null,
  toggleTask: async () => {}, deleteTask: async () => {}, updateTask: async () => null,
});

export function TaskProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchTasks = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    try {
      const { data } = await supabase
        .from('tasks')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });
      if (data) setTasks(data as Task[]);
    } catch (e) {
      console.error('Error fetching tasks:', e);
    }
    setLoading(false);
  }, [user]);

  useEffect(() => { fetchTasks(); }, [fetchTasks]);

  useEffect(() => {
    if (!user) return;
    const channel = supabase
      .channel('tasks-realtime')
      .on('postgres_changes',
        { event: '*', schema: 'public', table: 'tasks', filter: `user_id=eq.${user.id}` },
        () => { fetchTasks(); }
      )
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [user, fetchTasks]);

  const addTask = useCallback(async (task: Omit<Task, 'id' | 'created_at' | 'user_id'>) => {
    if (!user) return 'No hay sesión';
    try {
      const { error } = await supabase.from('tasks').insert({ ...task, user_id: user.id });
      if (error) return error.message;
      await fetchTasks();
      return null;
    } catch (e: any) {
      return e.message || 'Error al crear tarea';
    }
  }, [user, fetchTasks]);

  const toggleTask = useCallback(async (taskId: string) => {
    try {
      const task = tasks.find(t => t.id === taskId);
      if (!task) return;
      await supabase.from('tasks').update({ is_done: !task.is_done }).eq('id', taskId);
      await fetchTasks();
    } catch (e) {
      console.error('Error toggling task:', e);
    }
  }, [tasks, fetchTasks]);

  const deleteTask = useCallback(async (taskId: string) => {
    try {
      await supabase.from('tasks').delete().eq('id', taskId);
      await fetchTasks();
    } catch (e) {
      console.error('Error deleting task:', e);
    }
  }, [fetchTasks]);

  const updateTask = useCallback(async (taskId: string, updates: Partial<Task>) => {
    try {
      const { error } = await supabase.from('tasks').update(updates).eq('id', taskId);
      if (error) return error.message;
      await fetchTasks();
      return null;
    } catch (e: any) {
      return e.message || 'Error al actualizar tarea';
    }
  }, [fetchTasks]);

  return (
    <TaskContext.Provider value={{ tasks, loading, fetchTasks, addTask, toggleTask, deleteTask, updateTask }}>
      {children}
    </TaskContext.Provider>
  );
}

export function useTasks() {
  return useContext(TaskContext);
}
