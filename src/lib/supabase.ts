import { createClient } from '@supabase/supabase-js';

// Thông tin kết nối Supabase của dự án Lớp 5/4 - TH Lê Văn Tám
const DEFAULT_SUPABASE_URL = 'https://hmcrpmovyghnzbmvzwzf.supabase.co';
const DEFAULT_SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhtY3JwbW92eWdobnpibXZ6d3pmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODk5NzQzNzksImV4cCI6MjEwNTU1MDM3OX0.blV531Y20Vdo_W-uvcBk8VxDoeDl6HxnUrof-poUb4Q';

const envUrl = import.meta.env.VITE_SUPABASE_URL || '';
const envKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

const localUrl = typeof window !== 'undefined' ? localStorage.getItem('CUSTOM_SUPABASE_URL') : null;
const localKey = typeof window !== 'undefined' ? localStorage.getItem('CUSTOM_SUPABASE_ANON_KEY') : null;

export const supabaseUrl = localUrl || envUrl || DEFAULT_SUPABASE_URL;
export const supabaseAnonKey = localKey || envKey || DEFAULT_SUPABASE_ANON_KEY;

export const isSupabaseConfigured = () => {
  return Boolean(supabaseUrl && supabaseUrl.startsWith('https://') && supabaseAnonKey);
};

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
