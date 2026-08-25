import { createClient } from '@supabase/supabase-js';
import type { Database } from './database.types';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables in Next.js app');
}

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
    storageKey: 'sb-sponsorstudio-auth',
    storage: {
      getItem: (key) => {
        if (typeof document === 'undefined') return null;
        return document.cookie.split('; ').find(row => row.startsWith(key + '='))?.split('=')[1] || localStorage.getItem(key);
      },
      setItem: (key, value) => {
        if (typeof document === 'undefined') return;
        const isProd = window.location.hostname !== 'localhost' && !window.location.hostname.includes('127.0.0.1');
        const domain = isProd ? '; domain=.sponsorstudio.in' : '';
        document.cookie = `${key}=${value}; path=/${domain}; max-age=31536000; SameSite=Lax; Secure`;
        localStorage.setItem(key, value);
      },
      removeItem: (key) => {
        if (typeof document === 'undefined') return;
        const isProd = window.location.hostname !== 'localhost' && !window.location.hostname.includes('127.0.0.1');
        const domain = isProd ? '; domain=.sponsorstudio.in' : '';
        document.cookie = `${key}=; path=/${domain}; expires=Thu, 01 Jan 1970 00:00:00 GMT`;
        localStorage.removeItem(key);
      }
    }
  },
});
