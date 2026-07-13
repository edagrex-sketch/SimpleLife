import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { supabase } from '../utils/supabase';
import { useAuth } from './AuthContext';
import { Task } from '../types';

interface TaskContextType {
  tasks: Task[];
  loading: boolean;
  fetchTasks: () => Promise<void>;
  addTask: (task: Omit<Task, 'id' | 'created_at' | 'user_id'>) => Promise<void>;
  toggleTask: (taskId: string) => Promise<void>;
  deleteTask: (taskId: string) => Promise<void>;
  updateTask: (taskId: string, updates: Partial<Task>) => Promise<void>;
}

const TaskContext = createContext<TaskContextType>({
  tasks: [],
  loading: false,
  fetchTasks: async () => {},
  addTask: async () => {},
  toggleTask: async () => {},
  deleteTask: async () => {},
  updateTask: async () => {},
});

export function TaskProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchTasks = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    const { data } = await supabase
      .from('tasks')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });
    if (data) setTasks(data as Task[]);
    setLoading(false);
  }, [user]);

  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

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
    if (!user) return;
    await supabase.from('tasks').insert({ ...task, user_id: user.id });
    await fetchTasks();
  }, [user, fetchTasks]);

  const toggleTask = useCallback(async (taskId: string) => {
    const task = tasks.find(t => t.id === taskId);
    if (!task) return;
    await supabase.from('tasks').update({ is_done: !task.is_done }).eq('id', taskId);
    await fetchTasks();
  }, [tasks, fetchTasks]);

  const deleteTask = useCallback(async (taskId: string) => {
    await supabase.from('tasks').delete().eq('id', taskId);
    await fetchTasks();
  }, [fetchTasks]);

  const updateTask = useCallback(async (taskId: string, updates: Partial<Task>) => {
    await supabase.from('tasks').update(updates).eq('id', taskId);
    await fetchTasks();
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
