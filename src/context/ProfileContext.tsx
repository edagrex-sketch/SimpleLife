import React, { createContext, useContext, useCallback } from 'react';
import { supabase } from '../utils/supabase';
import { useAuth } from './AuthContext';
import { Profile } from '../types';

interface ProfileContextType {
  updateProfile: (updates: Partial<Profile>) => Promise<string | null>;
}

const ProfileContext = createContext<ProfileContextType>({
  updateProfile: async () => null,
});

export function ProfileProvider({ children }: { children: React.ReactNode }) {
  const { user, refreshProfile } = useAuth();

  const updateProfile = useCallback(async (updates: Partial<Profile>): Promise<string | null> => {
    if (!user) return 'No hay sesión';
    const { error } = await supabase.from('profiles').update(updates).eq('id', user.id);
    if (error) return error.message;
    await refreshProfile();
    return null;
  }, [user, refreshProfile]);

  return (
    <ProfileContext.Provider value={{ updateProfile }}>
      {children}
    </ProfileContext.Provider>
  );
}

export function useProfile() {
  return useContext(ProfileContext);
}
