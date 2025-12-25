'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import Image from 'next/image';
import { 
  LayoutDashboard, 
  CalendarClock,
  UserCheck,
  Code2,
  Trophy,
  Award,
  Users,
  BarChart3,
  ChevronLeft,
  Settings,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useAuthStore } from '@/lib/stores/authStore';
import { Button } from '@/components/ui/button';

const adminNavItems = [
  {
    name: 'Admin Dashboard',
    href: '/admin',
    icon: LayoutDashboard,
  },
  {
    name: 'Sessions',
    href: '/admin/sessions',
    icon: CalendarClock,
  },
  {
    name: 'Attendance',
    href: '/admin/attendance',
    icon: UserCheck,
  },
  {
    name: 'Problems',
    href: '/admin/problems',
    icon: Code2,
  },
  {
    name: 'Contests',
    href: '/admin/contests',
    icon: Trophy,
  },
  {
    name: 'Achievements',
    href: '/admin/achievements',
    icon: Award,
  },
  {
    name: 'Users',
    href: '/admin/users',
    icon: Users,
  },
  {
    name: 'Analytics',
    href: '/admin/analytics',
    icon: BarChart3,
  },
];

export default function AdminSidebar() {
  const pathname = usePathname();
  const { user } = useAuthStore();

  return (
    <aside className="fixed left-0 top-0 h-screen w-64 bg-card/95 supports-[backdrop-filter]:bg-card/85 backdrop-blur border-r border-border/80 shadow-sm flex flex-col">
      {/* Logo */}
      <div className="p-6 border-b border-border">
        <Link href="/admin" className="flex items-center gap-3">
          <Image
            src="/assets/logo.png"
            alt="CompSSA"
            width={32}
            height={32}
            className="w-8 h-8 object-contain"
          />
          <div className="flex flex-col">
            <span className="text-lg font-semibold text-foreground">CompSSA</span>
            <span className="text-xs text-muted-foreground">Admin Panel</span>
          </div>
        </Link>
      </div>

      {/* Back to Dashboard */}
      <div className="px-3 pt-4 pb-2">
        <Link href="/dashboard">
          <Button variant="outline" size="sm" className="w-full justify-start gap-2">
            <ChevronLeft className="w-4 h-4" />
            Back to Dashboard
          </Button>
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-1">
        {adminNavItems.map((item) => {
          const isActive = pathname === item.href || (item.href !== '/admin' && pathname?.startsWith(item.href + '/'));
          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors',
                isActive
                  ? 'bg-primary/20 text-primary'
                  : 'text-muted-foreground hover:text-foreground hover:bg-foreground/5'
              )}
            >
              <Icon className="w-4 h-4" />
              {item.name}
            </Link>
          );
        })}
      </nav>

      {/* Settings */}
      <div className="px-3 pb-4 space-y-1">
        <Link
          href="/admin/settings"
          className={cn(
            'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors',
            pathname === '/admin/settings'
              ? 'bg-primary/20 text-primary'
              : 'text-muted-foreground hover:text-foreground hover:bg-foreground/5'
          )}
        >
          <Settings className="w-4 h-4" />
          Settings
        </Link>
      </div>

      {/* User Profile */}
      <div className="p-4 border-t border-border">
        <Link href="/profile" className="flex items-center gap-3 group">
          <Avatar className="w-10 h-10 border border-border">
            <AvatarImage src={user?.profilePicture || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.username || 'admin'}`} alt={user?.username || 'Admin'} />
            <AvatarFallback className="bg-primary text-primary-foreground">
              {user?.username?.[0]?.toUpperCase() || 'A'}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-foreground truncate">
              {user?.username || 'Admin'}
            </p>
            <p className="text-xs text-muted-foreground">
              {user?.role || 'ADMIN'}
            </p>
          </div>
        </Link>
      </div>
    </aside>
  );
}
