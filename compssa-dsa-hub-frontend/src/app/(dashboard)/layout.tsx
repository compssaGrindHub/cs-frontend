'use client';

import { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/lib/stores/authStore';
import Sidebar from '@/components/layout/Sidebar';
import Header from '@/components/layout/Header';
import { Loading } from '@/components/common/Loading';
import { SidebarProvider, useSidebar } from '@/contexts/SidebarContext';
import { startActivitySession, pingActivity, endActivitySession } from '@/lib/api/activity';

function DashboardLayoutContent({
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

    // Start session (non-blocking, don't wait for it)
    const startSession = async () => {
      try {
        // Use Promise.race to add a timeout fallback
        await Promise.race([
          startActivitySession(),
          new Promise((_, reject) => 
            setTimeout(() => reject(new Error('Session start timeout')), 5000)
          )
        ]);
        isSessionStartedRef.current = true;
      } catch (error) {
        // Silently fail - don't block the UI
        console.warn('Activity session start failed (non-critical):', error);
        // Still mark as started to allow pings to work
        isSessionStartedRef.current = true;
      }
    };

    // Don't await - let it run in background
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
      // End session when leaving (fail silently - non-critical)
      if (isSessionStartedRef.current) {
        endActivitySession().catch(() => {
          // Silently fail - activity tracking is non-critical
        });
      }
    };
  }, [user?.id]);

  // Handle page visibility changes
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (!user?.id || !isSessionStartedRef.current) return;

      if (document.hidden) {
        // Page is hidden, end session (non-blocking with timeout)
        // Use a shorter timeout and fail silently - activity tracking is non-critical
        Promise.race([
          endActivitySession(),
          new Promise((_, reject) => 
            setTimeout(() => reject(new Error('Session end timeout')), 2000)
          )
        ])
          .then(() => {
            isSessionStartedRef.current = false;
          })
          .catch(() => {
            // Silently fail - don't log errors for activity tracking
            // The session will be cleaned up on next ping or when user returns
            isSessionStartedRef.current = false; // Still mark as ended to allow restart
          });
      } else {
        // Page is visible, start new session (non-blocking)
        startActivitySession()
          .then(() => {
            isSessionStartedRef.current = true;
          })
          .catch((error) => {
            console.warn('Activity session start failed (non-critical):', error);
            // Still mark as started to allow pings to work
            isSessionStartedRef.current = true;
          });
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [user?.id]);

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Sidebar />
      <div className={isCollapsed ? 'pl-20 transition-all duration-300' : 'pl-64 transition-all duration-300'}>
        <Header />
        <main className="min-h-[calc(100vh-4rem)] bg-background">
          {children}
        </main>
      </div>
    </div>
  );
}

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
    <SidebarProvider>
      <DashboardLayoutContent>{children}</DashboardLayoutContent>
    </SidebarProvider>
  );
}
