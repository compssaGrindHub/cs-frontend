"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Search,
  Bell,
  CheckCircle2,
  Trophy,
  Calendar,
  TrendingUp,
  AlertTriangle,
  Info,
  Menu,
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { useAuthStore } from "@/lib/stores/authStore";
import { useSidebar } from "@/contexts/SidebarContext";
import { useRouter } from "next/navigation";
import {
  getNotifications,
  getUnreadCount,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  Notification,
} from "@/lib/api/notifications";
import { formatDistanceToNow } from "date-fns";
import { toast } from "sonner";

const getNotificationIcon = (type: string) => {
  switch (type) {
    case "CONTEST_REMINDER":
      return Calendar;
    case "DAILY_QUESTION":
      return CheckCircle2;
    case "ACHIEVEMENT_UNLOCKED":
      return Trophy;
    case "RANK_CHANGE":
      return TrendingUp;
    case "STREAK_WARNING":
      return AlertTriangle;
    case "SYSTEM_ANNOUNCEMENT":
      return Info;
    default:
      return Bell;
  }
};

const getNotificationColor = (type: string) => {
  switch (type) {
    case "CONTEST_REMINDER":
      return "text-blue-500 bg-blue-500/10";
    case "DAILY_QUESTION":
      return "text-green-500 bg-green-500/10";
    case "ACHIEVEMENT_UNLOCKED":
      return "text-yellow-500 bg-yellow-500/10";
    case "RANK_CHANGE":
      return "text-purple-500 bg-purple-500/10";
    case "STREAK_WARNING":
      return "text-orange-500 bg-orange-500/10";
    case "SYSTEM_ANNOUNCEMENT":
      return "text-gray-500 bg-gray-500/10";
    default:
      return "text-muted-foreground bg-muted";
  }
};

export default function Header() {
  const { user, logout } = useAuthStore();
  const router = useRouter();
  const queryClient = useQueryClient();
  const [searchQuery, setSearchQuery] = useState("");

  // Fetch notifications
  const { data: notificationsData, isLoading: notificationsLoading } = useQuery(
    {
      queryKey: ["notifications"],
      queryFn: () => getNotifications({ limit: 10 }),
      enabled: !!user,
      refetchInterval: 30000, // Refetch every 30 seconds
    },
  );

  // Fetch unread count
  const { data: unreadCount } = useQuery({
    queryKey: ["unreadCount"],
    queryFn: () => getUnreadCount(),
    enabled: !!user,
    refetchInterval: 30000,
  });

  const notifications = notificationsData?.data || [];
  const count = unreadCount || 0;

  const markAsReadMutation = useMutation({
    mutationFn: (id: string) => markNotificationAsRead(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
      queryClient.invalidateQueries({ queryKey: ["unreadCount"] });
    },
  });

  const markAllAsReadMutation = useMutation({
    mutationFn: () => markAllNotificationsAsRead(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
      queryClient.invalidateQueries({ queryKey: ["unreadCount"] });
      toast.success("All notifications marked as read");
    },
  });

  const handleNotificationClick = (notification: Notification) => {
    if (!notification.read) {
      markAsReadMutation.mutate(notification.id);
    }

    // Navigate based on notification type
    if (notification.metadata) {
      if (notification.metadata.contestId) {
        router.push(`/contests`);
      } else if (
        notification.metadata.problemId ||
        notification.metadata.problemSlug
      ) {
        router.push(
          `/problems/${notification.metadata.problemSlug || notification.metadata.problemId}`,
        );
      } else if (notification.metadata.achievementId) {
        router.push(`/profile`);
      }
    }
  };

  const handleLogout = async () => {
    // logout() from store handles API call and clearing state
    await logout();
    router.push("/login");
  };

  const { toggleMobile, isMobile } = useSidebar();

  return (
    <header className="sticky top-0 z-30 w-full border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80">
      <div className="flex h-16 items-center justify-between px-4 md:px-6 gap-4">
        {/* Mobile Menu Button */}
        <Button
          variant="ghost"
          size="icon"
          className="lg:hidden hover:bg-foreground/5 text-muted-foreground hover:text-foreground flex-shrink-0"
          onClick={toggleMobile}
        >
          <Menu className="w-5 h-5" />
        </Button>

        {/* Search Bar */}
        <div className="flex-1 max-w-md hidden sm:block">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search platform..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full h-10 pl-10 pr-16 bg-foreground/5 border border-border rounded-lg text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
            />
            <kbd className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none hidden md:inline-flex h-5 select-none items-center gap-1 rounded border border-border bg-foreground/5 px-1.5 font-mono text-[10px] font-medium text-muted-foreground">
              <span className="text-xs">⌘</span>K
            </kbd>
          </div>
        </div>

        {/* Mobile Search Button */}
        <Button
          variant="ghost"
          size="icon"
          className="sm:hidden hover:bg-foreground/5 text-muted-foreground hover:text-foreground"
        >
          <Search className="w-5 h-5" />
        </Button>

        {/* Right side */}
        <div className="flex items-center gap-2 md:gap-4">
          {/* Notifications */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="relative hover:bg-foreground/5 text-muted-foreground hover:text-foreground"
              >
                <Bell className="w-5 h-5" />
                {count > 0 && (
                  <Badge className="absolute -top-1 -right-1 w-5 h-5 flex items-center justify-center p-0 bg-primary text-primary-foreground text-xs border-0">
                    {count > 9 ? "9+" : count}
                  </Badge>
                )}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              align="end"
              className="w-80 bg-card border-border"
            >
              <div className="flex items-center justify-between px-2 py-2">
                <DropdownMenuLabel className="text-foreground">
                  Notifications
                </DropdownMenuLabel>
                {notifications.length > 0 && count > 0 && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-xs text-primary hover:text-primary/80 h-auto py-1"
                    onClick={(e) => {
                      e.stopPropagation();
                      markAllAsReadMutation.mutate();
                    }}
                    disabled={markAllAsReadMutation.isPending}
                  >
                    Mark all read
                  </Button>
                )}
              </div>
              <DropdownMenuSeparator className="bg-border" />
              <div className="max-h-[400px] overflow-y-auto">
                {notificationsLoading ? (
                  <div className="p-4 text-center text-sm text-muted-foreground">
                    Loading notifications...
                  </div>
                ) : notifications.length === 0 ? (
                  <div className="p-4 text-center text-sm text-muted-foreground">
                    No notifications
                  </div>
                ) : (
                  notifications.map((notification: Notification) => {
                    const Icon = getNotificationIcon(notification.type);
                    const colorClass = getNotificationColor(notification.type);

                    return (
                      <DropdownMenuItem
                        key={notification.id}
                        className={`flex items-start gap-3 p-3 focus:bg-foreground/5 cursor-pointer ${!notification.read ? "bg-primary/5" : ""}`}
                        onClick={() => handleNotificationClick(notification)}
                      >
                        <div
                          className={`w-8 h-8 rounded-lg ${colorClass} flex items-center justify-center flex-shrink-0 mt-0.5`}
                        >
                          <Icon className="w-4 h-4" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2">
                            <p
                              className={`text-sm font-medium ${!notification.read ? "text-foreground" : "text-muted-foreground"}`}
                            >
                              {notification.title}
                            </p>
                            {!notification.read && (
                              <div className="w-2 h-2 rounded-full bg-primary flex-shrink-0 mt-1.5" />
                            )}
                          </div>
                          <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                            {notification.message}
                          </p>
                          <p className="text-xs text-muted-foreground mt-1">
                            {formatDistanceToNow(
                              new Date(notification.createdAt),
                              { addSuffix: true },
                            )}
                          </p>
                        </div>
                      </DropdownMenuItem>
                    );
                  })
                )}
              </div>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* User Menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                className="relative h-10 w-10 rounded-full p-0 hover:bg-foreground/5"
              >
                <Avatar className="h-10 w-10 border border-border">
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
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              align="end"
              className="w-56 bg-card border-border"
            >
              <DropdownMenuLabel className="font-normal">
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-medium leading-none text-foreground">
                    {user?.username || "Guest"}
                  </p>
                  <p className="text-xs leading-none text-muted-foreground">
                    {user?.email || "guest@example.com"}
                  </p>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator className="bg-border" />
              <DropdownMenuItem
                className="focus:bg-foreground/5 text-muted-foreground hover:text-foreground cursor-pointer"
                onClick={() => router.push("/profile")}
              >
                Profile
              </DropdownMenuItem>
              <DropdownMenuItem
                className="focus:bg-foreground/5 text-muted-foreground hover:text-foreground cursor-pointer"
                onClick={() => router.push("/settings")}
              >
                Settings
              </DropdownMenuItem>
              <DropdownMenuSeparator className="bg-border" />
              <DropdownMenuItem
                className="focus:bg-foreground/5 text-red-400 hover:text-red-300 cursor-pointer"
                onClick={handleLogout}
              >
                Log out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}
