"use client";
import { useSupabaseAuth } from '../hooks/useSupabaseAuth';
import { useRouter, usePathname } from 'next/navigation';
import { useEffect } from 'react';

export default function AuthGuard({ children }: { children: React.ReactNode }) {
  const { user, loading } = useSupabaseAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (
      !loading &&
      !user &&
      pathname !== '/login' &&
      pathname !== '/login-test'
    ) {
      router.replace('/login');
    }
  }, [user, loading, router, pathname]);

  if (
    loading ||
    (!user && pathname !== '/login' && pathname !== '/login-test')
  )
    return null;

  return <>{children}</>;
} 