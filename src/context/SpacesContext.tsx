import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { supabase } from '../utils/supabase';
import { useAuth } from './AuthContext';
import { Space } from '../types';

interface SpacesContextType {
  spaces: Space[];
  loading: boolean;
  fetchSpaces: () => Promise<void>;
  createSpace: (name: string) => Promise<string | null>;
  joinSpace: (inviteCode: string) => Promise<string | null>;
  leaveSpace: (spaceId: string) => Promise<void>;
}

const SpacesContext = createContext<SpacesContextType>({
  spaces: [], loading: false,
  fetchSpaces: async () => {}, createSpace: async () => null,
  joinSpace: async () => null, leaveSpace: async () => {},
});

export function SpacesProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const [spaces, setSpaces] = useState<Space[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchSpaces = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    try {
      const { data: memberSpaces } = await supabase
        .from('space_members')
        .select('space_id')
        .eq('user_id', user.id);
      if (memberSpaces && memberSpaces.length > 0) {
        const spaceIds = memberSpaces.map(m => m.space_id);
        const { data: spacesData } = await supabase
          .from('spaces')
          .select('*')
          .in('id', spaceIds);
        if (spacesData) setSpaces(spacesData as Space[]);
      } else {
        setSpaces([]);
      }
    } catch (e) {
      console.error('Error fetching spaces:', e);
    }
    setLoading(false);
  }, [user]);

  useEffect(() => { fetchSpaces(); }, [fetchSpaces]);

  const createSpace = useCallback(async (name: string) => {
    if (!user) return 'No hay sesión';
    try {
      const code = Math.random().toString(36).substr(2, 8).toUpperCase();
      const { data, error } = await supabase
        .from('spaces')
        .insert({ name, owner_id: user.id, invite_code: code })
        .select()
        .single();
      if (error) return error.message;
      if (data) {
        await supabase.from('space_members').insert({ space_id: data.id, user_id: user.id });
        await fetchSpaces();
      }
      return null;
    } catch (e: any) {
      return e.message || 'Error al crear espacio';
    }
  }, [user, fetchSpaces]);

  const joinSpace = useCallback(async (inviteCode: string) => {
    if (!user) return 'Debes iniciar sesión';
    try {
      const { data: space } = await supabase
        .from('spaces')
        .select('*')
        .eq('invite_code', inviteCode)
        .single();
      if (!space) return 'Código inválido';
      const { error } = await supabase
        .from('space_members')
        .insert({ space_id: space.id, user_id: user.id });
      if (error) return 'Ya eres miembro de este espacio';
      await fetchSpaces();
      return null;
    } catch (e: any) {
      return e.message || 'Error al unirse al espacio';
    }
  }, [user, fetchSpaces]);

  const leaveSpace = useCallback(async (spaceId: string) => {
    if (!user) return;
    try {
      await supabase
        .from('space_members')
        .delete()
        .eq('space_id', spaceId)
        .eq('user_id', user.id);
      await fetchSpaces();
    } catch (e) {
      console.error('Error leaving space:', e);
    }
  }, [user, fetchSpaces]);

  return (
    <SpacesContext.Provider value={{ spaces, loading, fetchSpaces, createSpace, joinSpace, leaveSpace }}>
      {children}
    </SpacesContext.Provider>
  );
}

export function useSpaces() {
  return useContext(SpacesContext);
}
