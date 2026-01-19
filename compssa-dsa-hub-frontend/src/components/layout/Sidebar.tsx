"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import Image from "next/image";
import {
  LayoutDashboard,
  Code2,
  Trophy,
  BarChart3,
  User,
  Settings,
  CalendarClock,
  Shield,
  ChevronLeft,
  ChevronRight,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useAuthStore } from "@/lib/stores/authStore";
import { useSidebar } from "@/contexts/SidebarContext";

const navItems = [
  {
    name: "Dashboard",
    href: "/dashboard",
    icon: LayoutDashboard,
  },
  {
    name: "Problems",
    href: "/problems",
    icon: Code2,
  },
  {
    name: "Contests",
    href: "/contests",
    icon: Trophy,
  },
  {
    name: "Sessions",
    href: "/sessions",
    icon: CalendarClock,
  },
  {
    name: "Attendance",
    href: "/attendance",
    icon: CalendarClock,
  },
  {
    name: "Leaderboard",
    href: "/leaderboard",
    icon: BarChart3,
  },
  {
    name: "Profile",
    href: "/profile",
    icon: User,
  },
];

export default function Sidebar() {
  const pathname = usePathname();
  const { user } = useAuthStore();
  const { isCollapsed, isMobileOpen, isMobile, toggleSidebar, closeMobile } =
    useSidebar();

  // On mobile, always show full sidebar (not collapsed) when open
  const showCollapsed = !isMobile && isCollapsed;

  return (
    <>
      {/* Mobile Overlay */}
      {isMobile && isMobileOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={closeMobile}
        />
      )}

      <aside
        className={cn(
          "fixed left-0 top-0 h-screen bg-card/95 supports-[backdrop-filter]:bg-card/85 backdrop-blur border-r border-border/80 shadow-sm flex flex-col transition-all duration-300 z-50",
          // Desktop: show based on collapsed state
          "lg:translate-x-0",
          showCollapsed ? "lg:w-20" : "lg:w-64",
          // Mobile: show/hide based on isMobileOpen, always full width when visible
          isMobileOpen ? "translate-x-0 w-64" : "-translate-x-full w-64",
          "lg:z-40",
        )}
      >
        {/* Logo */}
        <div
          className={cn(
            "border-b border-border flex items-center justify-between",
            showCollapsed ? "p-4" : "p-6",
          )}
        >
          <Link
            href="/dashboard"
            className={cn(
              "flex items-center gap-3",
              showCollapsed && "justify-center w-full",
            )}
            onClick={isMobile ? closeMobile : undefined}
          >
            <Image
              src="/assets/logo.png"
              alt="CompSSA"
              width={32}
              height={32}
              className="w-8 h-8 object-contain flex-shrink-0"
            />
            {!showCollapsed && (
              <span className="text-lg font-semibold text-foreground whitespace-nowrap">
                CompSSA
              </span>
            )}
          </Link>

          {/* Desktop collapse button */}
          {!isMobile && (
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 hover:bg-foreground/10 hidden lg:flex"
              onClick={toggleSidebar}
            >
              {showCollapsed ? (
                <ChevronRight className="h-4 w-4" />
              ) : (
                <ChevronLeft className="h-4 w-4" />
              )}
            </Button>
          )}

          {/* Mobile close button */}
          {isMobile && (
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 hover:bg-foreground/10 lg:hidden"
              onClick={closeMobile}
            >
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          {navItems.map((item) => {
            const isActive =
              pathname === item.href || pathname?.startsWith(item.href + "/");
            const Icon = item.icon;

            const linkClassName = cn(
              "flex items-center gap-3 rounded-lg text-sm font-medium transition-colors",
              showCollapsed ? "justify-center px-3 py-2.5" : "px-3 py-2.5",
              isActive
                ? "bg-primary/20 text-primary"
                : "text-muted-foreground hover:text-foreground hover:bg-foreground/5",
            );

            if (showCollapsed) {
              return (
                <Tooltip key={item.href}>
                  <TooltipTrigger asChild>
                    <Link href={item.href} className={linkClassName}>
                      <Icon className="w-4 h-4 flex-shrink-0" />
                    </Link>
                  </TooltipTrigger>
                  <TooltipContent side="right">
                    <p>{item.name}</p>
                  </TooltipContent>
                </Tooltip>
              );
            }

            return (
              <Link
                key={item.href}
                href={item.href}
                className={linkClassName}
                onClick={isMobile ? closeMobile : undefined}
              >
                <Icon className="w-4 h-4 flex-shrink-0" />
                <span className="whitespace-nowrap">{item.name}</span>
              </Link>
            );
          })}
        </nav>

        {/* Settings */}
        <div className="px-3 pb-4 space-y-1">
          {/* Admin Panel Link - Only for ADMIN/INSTRUCTOR */}
          {(user?.role === "ADMIN" || user?.role === "INSTRUCTOR") && (
            <>
              {showCollapsed ? (
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Link
                      href="/admin"
                      className={cn(
                        "flex items-center justify-center px-3 py-2.5 rounded-lg text-sm font-medium transition-colors",
                        pathname?.startsWith("/admin")
                          ? "bg-primary/20 text-primary"
                          : "text-muted-foreground hover:text-foreground hover:bg-foreground/5",
                      )}
                    >
                      <Shield className="w-4 h-4" />
                    </Link>
                  </TooltipTrigger>
                  <TooltipContent side="right">
                    <p>Admin Panel</p>
                  </TooltipContent>
                </Tooltip>
              ) : (
                <Link
                  href="/admin"
                  className={cn(
                    "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors",
                    pathname?.startsWith("/admin")
                      ? "bg-primary/20 text-primary"
                      : "text-muted-foreground hover:text-foreground hover:bg-foreground/5",
                  )}
                  onClick={isMobile ? closeMobile : undefined}
                >
                  <Shield className="w-4 h-4" />
                  Admin Panel
                </Link>
              )}
            </>
          )}

          {showCollapsed ? (
            <Tooltip>
              <TooltipTrigger asChild>
                <Link
                  href="/settings"
                  className={cn(
                    "flex items-center justify-center px-3 py-2.5 rounded-lg text-sm font-medium transition-colors",
                    pathname === "/settings"
                      ? "bg-primary/20 text-primary"
                      : "text-muted-foreground hover:text-foreground hover:bg-foreground/5",
                  )}
                >
                  <Settings className="w-4 h-4" />
                </Link>
              </TooltipTrigger>
              <TooltipContent side="right">
                <p>Settings</p>
              </TooltipContent>
            </Tooltip>
          ) : (
            <Link
              href="/settings"
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors",
                pathname === "/settings"
                  ? "bg-primary/20 text-primary"
                  : "text-muted-foreground hover:text-foreground hover:bg-foreground/5",
              )}
              onClick={isMobile ? closeMobile : undefined}
            >
              <Settings className="w-4 h-4" />
              Settings
            </Link>
          )}
        </div>

        {/* User Profile */}
        <div
          className={cn(
            "border-t border-border",
            showCollapsed ? "p-4" : "p-4",
          )}
        >
          {showCollapsed ? (
            <Tooltip>
              <TooltipTrigger asChild>
                <Link
                  href="/profile"
                  className="flex items-center justify-center"
                >
                  <Avatar className="w-10 h-10 border border-border">
                    <AvatarImage
                      src={
                        user?.profilePicture ||
                        `https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.username || "guest"}`
                      }
                      alt={user?.username || "User"}
                    />
                    <AvatarFallback className="bg-primary text-primary-foreground">
                      {user?.username?.[0]?.toUpperCase() || "U"}
                    </AvatarFallback>
                  </Avatar>
                </Link>
              </TooltipTrigger>
              <TooltipContent side="right">
                <div>
                  <p className="font-medium">{user?.username || "Guest"}</p>
                  <p className="text-xs text-muted-foreground">
                    Rank #{user?.globalRank || "--"}
                  </p>
                  <p className="text-xs text-yellow-500">
                    {user?.totalRating || 0} rating
                  </p>
                </div>
              </TooltipContent>
            </Tooltip>
          ) : (
            <Link
              href="/profile"
              className="flex items-center gap-3 group"
              onClick={isMobile ? closeMobile : undefined}
            >
              <Avatar className="w-10 h-10 border border-border flex-shrink-0">
                <AvatarImage
                  src={
                    user?.profilePicture ||
                    `https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.username || "guest"}`
                  }
                  alt={user?.username || "User"}
                />
                <AvatarFallback className="bg-primary text-primary-foreground">
                  {user?.username?.[0]?.toUpperCase() || "U"}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-foreground truncate">
                  {user?.username || "Guest"}
                </p>
                <p className="text-xs text-muted-foreground">
                  Rank #{user?.globalRank || "--"}
                </p>
              </div>
              <div className="text-sm font-semibold text-yellow-500">
                {user?.totalRating || 0}
              </div>
            </Link>
          )}
        </div>
      </aside>
    </>
  );
}
