import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';

export function useSupabaseAuth() {
  const [user, setUser] = useState<any>(null);
  const [role, setRole] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const getSession = async () => {
      if (!supabase) {
        console.warn('Supabase client not initialized. Auth disabled.');
        setLoading(false);
        return;
      }
      try {
        const {
          data: { session },
          error,
        } = await supabase.auth.getSession();
        if (error) {
          console.error('Error fetching session', error);
        }
        setUser(session?.user ?? null);
      } catch (err) {
        console.error('Supabase auth error', err);
        setUser(null);
      } finally {
        setLoading(false);
      }
    };
    getSession();

    if (!supabase) return;

    const { data: listener } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setUser(session?.user ?? null);
      }
    );

    return () => {
      listener?.subscription.unsubscribe();
    };
  }, []);

  useEffect(() => {
    const fetchRole = async () => {
      if (!supabase) {
        setRole(null);
        return;
      }
      if (user) {
        const { data, error } = await supabase
          .from('users')
          .select('role')
          .eq('email', user.email)
          .single();
        if (error) console.error('Error fetching role', error);
        setRole(data?.role ?? null);
      } else {
        setRole(null);
      }
    };
    fetchRole();
  }, [user]);

  const signUp = (email: string, password: string) =>
    supabase ? supabase.auth.signUp({ email, password }) : { data: null, error: new Error('Supabase not configured') };

  const signIn = (email: string, password: string) =>
    supabase ? supabase.auth.signInWithPassword({ email, password }) : { data: null, error: new Error('Supabase not configured') };

  const signOut = () =>
    supabase ? supabase.auth.signOut() : Promise.resolve();

  return { user, role, loading, signUp, signIn, signOut };
} 