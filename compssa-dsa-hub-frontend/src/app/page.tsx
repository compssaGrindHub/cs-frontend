'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/lib/stores/authStore';
import { Loading } from '@/components/common/Loading';

export default function Home() {
  const router = useRouter();
  const { isAuthenticated, user, syncAuthState } = useAuthStore();
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    // Sync auth state with localStorage tokens on mount
    syncAuthState();
  }, [syncAuthState]);

  useEffect(() => {
    // Redirect based on authentication status
    if (isAuthenticated && user) {
      // Redirect authenticated users based on role
      if (user.role === 'ADMIN') {
        router.push('/admin');
      } else {
        router.push('/dashboard');
      }
    } else {
      // Redirect unauthenticated users to login
      router.push('/login');
    }
    setIsChecking(false);
  }, [isAuthenticated, user, router]);

  // Show loading state during redirect
  if (isChecking) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loading size="lg" label="Loading..." />
      </div>
    );
  }

  return null;
}
