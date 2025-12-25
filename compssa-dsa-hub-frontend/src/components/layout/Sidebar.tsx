'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import Image from 'next/image';
import { 
  LayoutDashboard, 
  Code2, 
  Trophy, 
  BarChart3, 
  User, 
  Settings,
  CalendarClock,
  Shield,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useAuthStore } from '@/lib/stores/authStore';

const navItems = [
  {
    name: 'Dashboard',
    href: '/dashboard',
    icon: LayoutDashboard,
  },
  {
    name: 'Problems',
    href: '/problems',
    icon: Code2,
  },
  {
    name: 'Contests',
    href: '/contests',
    icon: Trophy,
  },
  {
    name: 'Sessions',
    href: '/sessions',
    icon: CalendarClock,
  },
  {
    name: 'Attendance',
    href: '/attendance',
    icon: CalendarClock,
  },
  {
    name: 'Leaderboard',
    href: '/leaderboard',
    icon: BarChart3,
  },
  {
    name: 'Profile',
    href: '/profile',
    icon: User,
  },
];

export default function Sidebar() {
  const pathname = usePathname();
  const { user } = useAuthStore();

  return (
    <aside className="fixed left-0 top-0 h-screen w-64 bg-card/95 supports-[backdrop-filter]:bg-card/85 backdrop-blur border-r border-border/80 shadow-sm flex flex-col">
      {/* Logo */}
      <div className="p-6 border-b border-border">
        <Link href="/dashboard" className="flex items-center gap-3">
          <Image
            src="/assets/logo.png"
            alt="CompSSA"
            width={32}
            height={32}
            className="w-8 h-8 object-contain"
          />
          <span className="text-lg font-semibold text-foreground">CompSSA</span>
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-1">
        {navItems.map((item) => {
          const isActive = pathname === item.href || pathname?.startsWith(item.href + '/');
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
        {/* Admin Panel Link - Only for ADMIN/INSTRUCTOR */}
        {(user?.role === 'ADMIN' || user?.role === 'INSTRUCTOR') && (
          <Link
            href="/admin"
            className={cn(
              'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors',
              pathname?.startsWith('/admin')
                ? 'bg-primary/20 text-primary'
                : 'text-muted-foreground hover:text-foreground hover:bg-foreground/5'
            )}
          >
            <Shield className="w-4 h-4" />
            Admin Panel
          </Link>
        )}
        
        <Link
          href="/settings"
          className={cn(
            'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors',
            pathname === '/settings'
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
            <AvatarImage src={user?.profilePicture || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.username || 'guest'}`} alt={user?.username || 'User'} />
            <AvatarFallback className="bg-primary text-primary-foreground">
              {user?.username?.[0]?.toUpperCase() || 'U'}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-foreground truncate">
              {user?.username || 'Guest'}
            </p>
            <p className="text-xs text-muted-foreground">
              Rank #{user?.globalRank || '--'}
            </p>
          </div>
          <div className="text-sm font-semibold text-yellow-500">
            {user?.totalRating || 0}
          </div>
        </Link>
      </div>
    </aside>
  );
}