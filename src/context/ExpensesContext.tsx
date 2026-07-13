import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { supabase } from '../utils/supabase';
import { useAuth } from './AuthContext';
import { Expense } from '../types';

interface ExpensesContextType {
  expenses: Expense[];
  loading: boolean;
  fetchExpenses: () => Promise<void>;
  addExpense: (expense: Omit<Expense, 'id' | 'created_at' | 'user_id'>) => Promise<string | null>;
  deleteExpense: (id: string) => Promise<void>;
}

const ExpensesContext = createContext<ExpensesContextType>({
  expenses: [], loading: false, fetchExpenses: async () => {}, addExpense: async () => null, deleteExpense: async () => {},
});

export function ExpensesProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchExpenses = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    try {
      const { data } = await supabase
        .from('expenses')
        .select('*')
        .eq('user_id', user.id)
        .order('date', { ascending: false });
      if (data) setExpenses(data as Expense[]);
    } catch (e) {
      console.error('Error fetching expenses:', e);
    }
    setLoading(false);
  }, [user]);

  useEffect(() => { fetchExpenses(); }, [fetchExpenses]);

  const addExpense = useCallback(async (expense: Omit<Expense, 'id' | 'created_at' | 'user_id'>) => {
    if (!user) return 'No hay sesión';
    try {
      const { error } = await supabase.from('expenses').insert({ ...expense, user_id: user.id });
      if (error) return error.message;
      await fetchExpenses();
      return null;
    } catch (e: any) {
      return e.message || 'Error al crear gasto';
    }
  }, [user, fetchExpenses]);

  const deleteExpense = useCallback(async (id: string) => {
    try {
      await supabase.from('expenses').delete().eq('id', id);
      await fetchExpenses();
    } catch (e) {
      console.error('Error deleting expense:', e);
    }
  }, [fetchExpenses]);

  return (
    <ExpensesContext.Provider value={{ expenses, loading, fetchExpenses, addExpense, deleteExpense }}>
      {children}
    </ExpensesContext.Provider>
  );
}

export function useExpenses() {
  return useContext(ExpensesContext);
}
