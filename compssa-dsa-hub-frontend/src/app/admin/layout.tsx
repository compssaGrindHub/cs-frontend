'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/lib/stores/authStore';
import AdminSidebar from '@/components/layout/AdminSidebar';
import Header from '@/components/layout/Header';
import { Loading } from '@/components/common/Loading';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, isAuthenticated } = useAuthStore();
  const router = useRouter();
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    // Check authentication first
    if (!isAuthenticated || !user) {
      router.push('/login');
      return;
    }

    // Only ADMIN role users can access admin pages
    // USER and INSTRUCTOR roles are not allowed (as per user requirement: only ADMIN)
    if (user.role !== 'ADMIN') {
      // Redirect non-admin users to dashboard
      router.push('/dashboard');
      return;
    }

    setIsChecking(false);
  }, [user, isAuthenticated, router]);

  // Show loading during redirect or auth check
  if (isChecking || !isAuthenticated || !user || user.role !== 'ADMIN') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loading size="lg" label="Loading..." />
      </div>
    );
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
