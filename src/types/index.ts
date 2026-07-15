export type TaskPriority = 'baja' | 'media' | 'alta';

export interface Task {
  id: string;
  user_id: string;
  title: string;
  description?: string;
  priority: TaskPriority;
  time?: string;
  project?: string;
  is_done?: boolean;
  due_date?: string;
  space_id?: string;
  completed_by_id?: string;
  assigned_to_id?: string;
  created_at?: string;
}

export interface Expense {
  id: string;
  user_id: string;
  title: string;
  amount: number;
  category?: string;
  date?: string;
  notes?: string;
  space_id?: string;
  created_at?: string;
}

export interface CalendarEvent {
  id: string;
  user_id: string;
  title: string;
  description?: string;
  event_date: string;
  start_time?: string;
  end_time?: string;
  category?: string;
  color?: string;
  space_id?: string;
  created_at?: string;
}

export interface Space {
  id: string;
  name: string;
  owner_id: string;
  invite_code?: string;
  created_at?: string;
}

export interface SpaceMember {
  space_id: string;
  user_id: string;
  joined_at?: string;
}

export interface SpaceActivity {
  id: string;
  space_id: string;
  user_id: string;
  action: string;
  entity_title?: string;
  created_at?: string;
}

export interface Profile {
  id: string;
  name?: string;
  email?: string;
  avatar_url?: string;
}

export interface User {
  id: string;
  email?: string;
}

export interface Notification {
  id: string;
  user_id: string;
  title: string;
  message: string;
  type: 'task_assigned' | 'space_invite' | 'event_reminder' | 'general';
  read: boolean;
  link_to?: string;
  created_at?: string;
}
