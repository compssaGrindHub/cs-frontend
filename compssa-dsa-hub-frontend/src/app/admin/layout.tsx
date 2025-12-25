'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/lib/stores/authStore';
import AdminSidebar from '@/components/layout/AdminSidebar';
import Header from '@/components/layout/Header';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, isAuthenticated } = useAuthStore();
  const router = useRouter();

  useEffect(() => {
    // Dev mode bypass: if no auth system, skip check
    const isDev = process.env.NEXT_PUBLIC_DEV_MODE === 'true';
    
    if (!isDev) {
      // In production, check authentication and role
      if (!isAuthenticated) {
        router.push('/login');
        return;
      }

      if (user?.role !== 'ADMIN' && user?.role !== 'INSTRUCTOR') {
        router.push('/dashboard');
        return;
      }
    }
  }, [user, isAuthenticated, router]);

  // Show loading or null during redirect
  if (!user && process.env.NEXT_PUBLIC_DEV_MODE !== 'true') {
    return null;
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      <AdminSidebar />
      <div className="ml-64">
        <Header />
        <main className="pt-16 p-8">{children}</main>
      </div>
    </div>
  );
}
