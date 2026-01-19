"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/lib/stores/authStore";
import AdminSidebar from "@/components/layout/AdminSidebar";
import Header from "@/components/layout/Header";
import { Loading } from "@/components/common/Loading";
import { SidebarProvider, useSidebar } from "@/contexts/SidebarContext";
import {
  startActivitySession,
  pingActivity,
  endActivitySession,
} from "@/lib/api/activity";

function AdminLayoutContent({ children }: { children: React.ReactNode }) {
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
        // Activity tracking is non-critical, fail silently
        console.warn("Activity session start failed (non-critical):", error);
        isSessionStartedRef.current = true;
      }
    };

    startSession();

    // Ping every 2 minutes to keep session alive
    pingIntervalRef.current = setInterval(
      async () => {
        if (isSessionStartedRef.current) {
          try {
            await pingActivity();
          } catch (error) {
            // Activity tracking is non-critical, fail silently
            console.warn("Failed to ping activity (non-critical):", error);
          }
        }
      },
      2 * 60 * 1000,
    ); // 2 minutes

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
    const handleVisibilityChange = async () => {
      if (!user?.id || !isSessionStartedRef.current) return;

      if (document.hidden) {
        // Page is hidden, end session (non-blocking)
        endActivitySession()
          .then(() => {
            isSessionStartedRef.current = false;
          })
          .catch(() => {
            // Silently fail - activity tracking is non-critical
            isSessionStartedRef.current = false;
          });
      } else {
        // Page is visible, start new session (non-blocking)
        startActivitySession()
          .then(() => {
            isSessionStartedRef.current = true;
          })
          .catch((error) => {
            console.warn(
              "Activity session start failed (non-critical):",
              error,
            );
            isSessionStartedRef.current = true;
          });
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [user?.id]);

  return (
    <div className="min-h-screen bg-background text-foreground">
      <AdminSidebar />
      <div
        className={
          isCollapsed
            ? "ml-20 transition-all duration-300"
            : "ml-64 transition-all duration-300"
        }
      >
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
  const { user, isAuthenticated, syncAuthState } = useAuthStore();
  const router = useRouter();
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    // First, sync auth state from localStorage
    syncAuthState();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    // After syncing, check if we need to redirect
    if (!isAuthenticated || !user) {
      // Redirect to login only if not authenticated
      router.push("/login");
      return;
    }

    // Only ADMIN role users can access admin pages
    // USER and INSTRUCTOR roles are not allowed (as per user requirement: only ADMIN)
    if (user.role !== "ADMIN") {
      // Redirect non-admin users to dashboard
      router.push("/dashboard");
      return;
    }

    setIsChecking(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, isAuthenticated]);

  // Don't show loading if we already have a valid user
  if (isChecking && (!user || user.role !== "ADMIN")) {
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
