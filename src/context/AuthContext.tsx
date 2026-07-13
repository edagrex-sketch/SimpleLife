import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { supabase } from '../utils/supabase';
import { User, Profile } from '../types';

interface AuthContextType {
  user: User | null;
  profile: Profile | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<string | null>;
  signUp: (email: string, password: string, name: string) => Promise<string | null>;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  profile: null,
  loading: true,
  signIn: async () => null,
  signUp: async () => null,
  signOut: async () => {},
  refreshProfile: async () => {},
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchProfile = useCallback(async (userId: string) => {
    const { data } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();
    if (data) setProfile(data);
  }, []);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        const u = { id: session.user.id, email: session.user.email };
        setUser(u);
        fetchProfile(u.id);
      }
      setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        const u = { id: session.user.id, email: session.user.email };
        setUser(u);
        fetchProfile(u.id);
      } else {
        setUser(null);
        setProfile(null);
      }
    });

    return () => subscription.unsubscribe();
  }, [fetchProfile]);

  const signIn = useCallback(async (email: string, password: string): Promise<string | null> => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    return error ? error.message : null;
  }, []);

  const signUp = useCallback(async (email: string, password: string, name: string): Promise<string | null> => {
    const { data, error } = await supabase.auth.signUp({ email, password });
    if (error) return error.message;
    if (data.user) {
      const { error: profileError } = await supabase.from('profiles').upsert({
        id: data.user.id,
        name,
        email,
      });
      if (profileError) return profileError.message;
    }
    return null;
  }, []);

  const signOut = useCallback(async () => {
    await supabase.auth.signOut();
  }, []);

  const refreshProfile = useCallback(async () => {
    if (user) await fetchProfile(user.id);
  }, [user, fetchProfile]);

  return (
    <AuthContext.Provider value={{ user, profile, loading, signIn, signUp, signOut, refreshProfile }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
