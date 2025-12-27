'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/lib/stores/authStore';
import Sidebar from '@/components/layout/Sidebar';
import Header from '@/components/layout/Header';
import { Loading } from '@/components/common/Loading';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, isAuthenticated } = useAuthStore();
  const router = useRouter();
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    // Check if user is authenticated
    if (!isAuthenticated || !user) {
      router.push('/login');
      return;
    }

    // All authenticated users (USER, ADMIN, INSTRUCTOR) can access user pages
    // This includes ADMIN users who can access both admin and user pages
    // No role restriction needed here - all authenticated users are allowed
    setIsChecking(false);
  }, [user, isAuthenticated, router]);

  // Show loading during redirect or auth check
  if (isChecking || !isAuthenticated || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loading size="lg" label="Loading..." />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Sidebar />
      <div className="pl-64">
        <Header />
        <main className="min-h-[calc(100vh-4rem)] bg-background">
          {children}
        </main>
      </div>
    </div>
  );
}
