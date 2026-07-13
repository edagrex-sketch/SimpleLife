import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { supabase } from '../utils/supabase';
import { useAuth } from './AuthContext';
import { Space, SpaceMember, SpaceActivity } from '../types';

interface SpacesContextType {
  spaces: Space[];
  members: SpaceMember[];
  activities: SpaceActivity[];
  loading: boolean;
  fetchSpaces: () => Promise<void>;
  createSpace: (name: string) => Promise<void>;
  joinSpace: (inviteCode: string) => Promise<string | null>;
  leaveSpace: (spaceId: string) => Promise<void>;
}

const SpacesContext = createContext<SpacesContextType>({
  spaces: [], members: [], activities: [], loading: false,
  fetchSpaces: async () => {}, createSpace: async () => {},
  joinSpace: async () => null, leaveSpace: async () => {},
});

export function SpacesProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const [spaces, setSpaces] = useState<Space[]>([]);
  const [members, setMembers] = useState<SpaceMember[]>([]);
  const [activities, setActivities] = useState<SpaceActivity[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchSpaces = useCallback(async () => {
    if (!user) return;
    setLoading(true);
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
    }
    setLoading(false);
  }, [user]);

  useEffect(() => { fetchSpaces(); }, [fetchSpaces]);

  const createSpace = useCallback(async (name: string) => {
    if (!user) return;
    const code = Math.random().toString(36).substr(2, 8).toUpperCase();
    const { data } = await supabase.from('spaces').insert({ name, owner_id: user.id, invite_code: code }).select().single();
    if (data) {
      await supabase.from('space_members').insert({ space_id: data.id, user_id: user.id });
      await fetchSpaces();
    }
  }, [user, fetchSpaces]);

  const joinSpace = useCallback(async (inviteCode: string): Promise<string | null> => {
    if (!user) return 'Debes iniciar sesión';
    const { data: space } = await supabase.from('spaces').select('*').eq('invite_code', inviteCode).single();
    if (!space) return 'Código inválido';
    const { error } = await supabase.from('space_members').insert({ space_id: space.id, user_id: user.id });
    if (error) return 'Ya eres miembro de este espacio';
    await fetchSpaces();
    return null;
  }, [user, fetchSpaces]);

  const leaveSpace = useCallback(async (spaceId: string) => {
    if (!user) return;
    await supabase.from('space_members').delete().eq('space_id', spaceId).eq('user_id', user.id);
    await fetchSpaces();
  }, [user, fetchSpaces]);

  return (
    <SpacesContext.Provider value={{ spaces, members, activities, loading, fetchSpaces, createSpace, joinSpace, leaveSpace }}>
      {children}
    </SpacesContext.Provider>
  );
}

export function useSpaces() {
  return useContext(SpacesContext);
}
