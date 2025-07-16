import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';

export function useSupabaseAuth() {
  const [user, setUser] = useState<any>(null);
  const [role, setRole] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const getSession = async () => {
      try {
        const {
          data: { session },
          error,
        } = await supabase.auth.getSession();
        if (error) {
          console.error("Error fetching session", error);
        }
        setUser(session?.user ?? null);
      } catch (err) {
        console.error("Supabase auth error", err);
        setUser(null);
      } finally {
        setLoading(false);
      }
    };
    getSession();

    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => {
      listener?.subscription.unsubscribe();
    };
  }, []);

  useEffect(() => {
    const fetchRole = async () => {
      if (user) {
        const { data, error } = await supabase
          .from('users')
          .select('role')
          .eq('email', user.email)
          .single();
        setRole(data?.role ?? null);
      } else {
        setRole(null);
      }
    };
    fetchRole();
  }, [user]);

  const signUp = (email: string, password: string) =>
    supabase.auth.signUp({ email, password });

  const signIn = (email: string, password: string) =>
    supabase.auth.signInWithPassword({ email, password });

  const signOut = () => supabase.auth.signOut();

  return { user, role, loading, signUp, signIn, signOut };
} 