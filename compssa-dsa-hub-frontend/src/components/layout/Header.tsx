'use client';

import { useState } from 'react';
import { Search, Bell } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';
import { useAuthStore } from '@/lib/stores/authStore';
import { useRouter } from 'next/navigation';

export default function Header() {
  const { user, logout } = useAuthStore();
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  return (
    <header className="sticky top-0 z-40 w-full border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80">
      <div className="flex h-16 items-center justify-between px-6">
        {/* Search Bar */}
        <div className="flex-1 max-w-md">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search platform..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full h-10 pl-10 pr-16 bg-foreground/5 border border-border rounded-lg text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
            />
            <kbd className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none inline-flex h-5 select-none items-center gap-1 rounded border border-border bg-foreground/5 px-1.5 font-mono text-[10px] font-medium text-muted-foreground">
              <span className="text-xs">⌘</span>K
            </kbd>
          </div>
        </div>

        {/* Right side */}
        <div className="flex items-center gap-4">
          {/* Notifications */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="relative hover:bg-foreground/5 text-muted-foreground hover:text-foreground"
              >
                <Bell className="w-5 h-5" />
                <Badge className="absolute -top-1 -right-1 w-5 h-5 flex items-center justify-center p-0 bg-primary text-primary-foreground text-xs border-0">
                  3
                </Badge>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-80 bg-card border-border">
              <DropdownMenuLabel className="text-foreground">Notifications</DropdownMenuLabel>
              <DropdownMenuSeparator className="bg-border" />
              <div className="max-h-[400px] overflow-y-auto">
                <DropdownMenuItem className="flex flex-col items-start gap-1 p-3 focus:bg-foreground/5 cursor-pointer">
                  <p className="text-sm font-medium text-foreground">New contest starting soon!</p>
                  <p className="text-xs text-muted-foreground">Weekly Challenge #42 starts in 2 hours</p>
                </DropdownMenuItem>
                <DropdownMenuItem className="flex flex-col items-start gap-1 p-3 focus:bg-foreground/5 cursor-pointer">
                  <p className="text-sm font-medium text-foreground">Achievement unlocked</p>
                  <p className="text-xs text-muted-foreground">You've solved 50 problems!</p>
                </DropdownMenuItem>
                <DropdownMenuItem className="flex flex-col items-start gap-1 p-3 focus:bg-foreground/5 cursor-pointer">
                  <p className="text-sm font-medium text-foreground">New daily challenge</p>
                  <p className="text-xs text-muted-foreground">Check out today's problem</p>
                </DropdownMenuItem>
              </div>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* User Menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="relative h-10 w-10 rounded-full p-0 hover:bg-foreground/5">
                <Avatar className="h-10 w-10 border border-border">
                  <AvatarImage src={user?.profilePicture || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.username || 'guest'}`} alt={user?.username || 'User'} />
                  <AvatarFallback className="bg-primary text-primary-foreground">
                    {user?.username?.[0]?.toUpperCase() || 'U'}
                  </AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56 bg-card border-border">
              <DropdownMenuLabel className="font-normal">
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-medium leading-none text-foreground">
                    {user?.username || 'Guest'}
                  </p>
                  <p className="text-xs leading-none text-muted-foreground">
                    {user?.email || 'guest@example.com'}
                  </p>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator className="bg-border" />
              <DropdownMenuItem 
                className="focus:bg-foreground/5 text-muted-foreground hover:text-foreground cursor-pointer"
                onClick={() => router.push('/profile')}
              >
                Profile
              </DropdownMenuItem>
              <DropdownMenuItem 
                className="focus:bg-foreground/5 text-muted-foreground hover:text-foreground cursor-pointer"
                onClick={() => router.push('/settings')}
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