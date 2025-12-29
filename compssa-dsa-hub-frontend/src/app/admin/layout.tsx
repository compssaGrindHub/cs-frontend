'use client';

import { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/lib/stores/authStore';
import AdminSidebar from '@/components/layout/AdminSidebar';
import Header from '@/components/layout/Header';
import { Loading } from '@/components/common/Loading';
import { SidebarProvider, useSidebar } from '@/contexts/SidebarContext';
import { startActivitySession, pingActivity, endActivitySession } from '@/lib/api/activity';

function AdminLayoutContent({
  children,
}: {
  children: React.ReactNode;
}) {
  const { isCollapsed } = useSidebar();
  const { user } = useAuthStore();
  const pingIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const isSessionStartedRef = useRef(false);

  useEffect(() => {
    if (!user?.id) return;

    // Start session
    const startSession = async () => {
      try {
        await startActivitySession();
        isSessionStartedRef.current = true;
      } catch (error) {
        console.error('Failed to start activity session:', error);
      }
    };

    startSession();

    // Ping every 2 minutes to keep session alive
    pingIntervalRef.current = setInterval(async () => {
      if (isSessionStartedRef.current) {
        try {
          await pingActivity();
        } catch (error) {
          console.error('Failed to ping activity:', error);
        }
      }
    }, 2 * 60 * 1000); // 2 minutes

    // Cleanup on unmount
    return () => {
      if (pingIntervalRef.current) {
        clearInterval(pingIntervalRef.current);
      }
      // End session when leaving
      if (isSessionStartedRef.current) {
        endActivitySession().catch((error) => {
          console.error('Failed to end activity session:', error);
        });
      }
    };
  }, [user?.id]);

  // Handle page visibility changes
  useEffect(() => {
    const handleVisibilityChange = async () => {
      if (!user?.id || !isSessionStartedRef.current) return;

      if (document.hidden) {
        // Page is hidden, end session
        try {
          await endActivitySession();
          isSessionStartedRef.current = false;
        } catch (error) {
          console.error('Failed to end activity session:', error);
        }
      } else {
        // Page is visible, start new session
        try {
          await startActivitySession();
          isSessionStartedRef.current = true;
        } catch (error) {
          console.error('Failed to start activity session:', error);
        }
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [user?.id]);

  return (
    <div className="min-h-screen bg-background text-foreground">
      <AdminSidebar />
      <div className={isCollapsed ? 'ml-20 transition-all duration-300' : 'ml-64 transition-all duration-300'}>
        <Header />
        <main className="pt-16 p-8">{children}</main>
      </div>
    </div>
  );
}

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
    <SidebarProvider>
      <AdminLayoutContent>{children}</AdminLayoutContent>
    </SidebarProvider>
  );
}
