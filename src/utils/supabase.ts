import 'react-native-url-polyfill/auto';
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://laompxcerncxqwsqsocy.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_PbqXkpP3cGJdcV9abmwiwA_7dDHKaA0';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
