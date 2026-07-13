import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { supabase } from '../utils/supabase';
import { useAuth } from './AuthContext';
import { Expense } from '../types';

interface ExpensesContextType {
  expenses: Expense[];
  loading: boolean;
  fetchExpenses: () => Promise<void>;
  addExpense: (expense: Omit<Expense, 'id' | 'created_at' | 'user_id'>) => Promise<void>;
  deleteExpense: (id: string) => Promise<void>;
}

const ExpensesContext = createContext<ExpensesContextType>({
  expenses: [], loading: false, fetchExpenses: async () => {}, addExpense: async () => {}, deleteExpense: async () => {},
});

export function ExpensesProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchExpenses = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    const { data } = await supabase
      .from('expenses')
      .select('*')
      .eq('user_id', user.id)
      .order('date', { ascending: false });
    if (data) setExpenses(data as Expense[]);
    setLoading(false);
  }, [user]);

  useEffect(() => { fetchExpenses(); }, [fetchExpenses]);

  const addExpense = useCallback(async (expense: Omit<Expense, 'id' | 'created_at' | 'user_id'>) => {
    if (!user) return;
    await supabase.from('expenses').insert({ ...expense, user_id: user.id });
    await fetchExpenses();
  }, [user, fetchExpenses]);

  const deleteExpense = useCallback(async (id: string) => {
    await supabase.from('expenses').delete().eq('id', id);
    await fetchExpenses();
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
