'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Search, Users, TrendingUp, Award, Trash2, ExternalLink, Calendar } from 'lucide-react';
import { format } from 'date-fns';

interface User {
  id: string;
  username: string;
  email: string;
  role: 'USER' | 'ADMIN' | 'INSTRUCTOR';
  totalRating: number;
  globalRank: number;
  currentStreak: number;
  problemsSolved: number;
  contestsParticipated: number;
  createdAt: string;
}

const roleColors = {
  USER: 'bg-gray-500/10 text-gray-500 border-gray-500/20',
  ADMIN: 'bg-red-500/10 text-red-500 border-red-500/20',
  INSTRUCTOR: 'bg-blue-500/10 text-blue-500 border-blue-500/20',
};

const mockUsers: User[] = [
  {
    id: '1',
    username: 'alice_dev',
    email: 'alice@compssa.com',
    role: 'USER',
    totalRating: 2450,
    globalRank: 1,
    currentStreak: 15,
    problemsSolved: 342,
    contestsParticipated: 28,
    createdAt: '2024-08-15T10:00:00Z',
  },
  {
    id: '2',
    username: 'bob_coder',
    email: 'bob@compssa.com',
    role: 'USER',
    totalRating: 2180,
    globalRank: 2,
    currentStreak: 8,
    problemsSolved: 287,
    contestsParticipated: 22,
    createdAt: '2024-09-10T14:30:00Z',
  },
  {
    id: '3',
    username: 'charlie_algo',
    email: 'charlie@compssa.com',
    role: 'INSTRUCTOR',
    totalRating: 2850,
    globalRank: 0,
    currentStreak: 42,
    problemsSolved: 521,
    contestsParticipated: 45,
    createdAt: '2024-01-05T08:00:00Z',
  },
  {
    id: '4',
    username: 'diana_data',
    email: 'diana@compssa.com',
    role: 'USER',
    totalRating: 1920,
    globalRank: 3,
    currentStreak: 3,
    problemsSolved: 198,
    contestsParticipated: 15,
    createdAt: '2024-10-20T16:45:00Z',
  },
  {
    id: '5',
    username: 'admin',
    email: 'admin@compssa.com',
    role: 'ADMIN',
    totalRating: 2450,
    globalRank: 0,
    currentStreak: 15,
    problemsSolved: 342,
    contestsParticipated: 28,
    createdAt: '2024-01-01T00:00:00Z',
  },
];

export default function AdminUsersPage() {
  const [users, setUsers] = useState<User[]>(mockUsers);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState<'ALL' | 'USER' | 'ADMIN' | 'INSTRUCTOR'>('ALL');
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);

  const filteredUsers = useMemo(() => {
    return users.filter((user) => {
      const matchesSearch =
        user.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesRole = roleFilter === 'ALL' || user.role === roleFilter;
      return matchesSearch && matchesRole;
    });
  }, [users, searchTerm, roleFilter]);

  const stats = [
    {
      label: 'Total Users',
      value: users.length,
      color: 'text-blue-500',
      icon: Users,
      description: 'Registered members',
    },
    {
      label: 'Active This Month',
      value: users.filter((u) => u.currentStreak > 0).length,
      color: 'text-green-500',
      icon: TrendingUp,
      description: 'Users with activity',
    },
    {
      label: 'Instructors',
      value: users.filter((u) => u.role === 'INSTRUCTOR').length,
      color: 'text-purple-500',
      icon: Award,
      description: 'Teaching staff',
    },
  ];

  const handleDelete = () => {
    if (!selectedUser) return;
    setUsers(users.filter((u) => u.id !== selectedUser.id));
    setIsDeleteDialogOpen(false);
    setSelectedUser(null);
  };

  const openDeleteDialog = (user: User) => {
    setSelectedUser(user);
    setIsDeleteDialogOpen(true);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">User Management</h1>
          <p className="text-muted-foreground mt-1">View and manage platform users</p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <Card key={stat.label} className="bg-card border-border shadow-sm">
              <CardContent className="p-6">
                <div className="flex items-center gap-3">
                  <div className="p-3 rounded-lg bg-primary/10">
                    <Icon className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">{stat.label}</p>
                    <p className={`text-2xl font-bold ${stat.color}`}>{stat.value}</p>
                    <p className="text-xs text-muted-foreground mt-1">{stat.description}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Filters & Table */}
      <Card className="bg-card border-border shadow-sm">
        <CardHeader>
          <CardTitle className="text-foreground">Users</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search users..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9 bg-background border-border"
              />
            </div>
            <div className="flex gap-2">
              {(['ALL', 'USER', 'ADMIN', 'INSTRUCTOR'] as const).map((role) => (
                <Button
                  key={role}
                  variant={roleFilter === role ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setRoleFilter(role)}
                >
                  {role === 'ALL' ? 'All Roles' : role}
                </Button>
              ))}
            </div>
          </div>

          {/* Table */}
          <div className="border border-border rounded-lg">
            <Table>
              <TableHeader>
                <TableRow className="hover:bg-muted/50">
                  <TableHead className="text-muted-foreground">User</TableHead>
                  <TableHead className="text-muted-foreground">Role</TableHead>
                  <TableHead className="text-muted-foreground">Rating</TableHead>
                  <TableHead className="text-muted-foreground">Stats</TableHead>
                  <TableHead className="text-muted-foreground">Joined</TableHead>
                  <TableHead className="text-right text-muted-foreground">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredUsers.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                      No users found
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredUsers.map((user) => (
                    <TableRow key={user.id} className="hover:bg-muted/50">
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <Avatar className="w-10 h-10 border border-border">
                            <AvatarImage
                              src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${user.username}`}
                              alt={user.username}
                            />
                            <AvatarFallback className="bg-primary text-primary-foreground">
                              {user.username[0].toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-medium text-foreground">{user.username}</p>
                            <p className="text-sm text-muted-foreground">{user.email}</p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge className={roleColors[user.role]}>{user.role}</Badge>
                      </TableCell>
                      <TableCell>
                        <div>
                          <p className="font-semibold text-yellow-500">{user.totalRating}</p>
                          {user.globalRank > 0 && (
                            <p className="text-xs text-muted-foreground">Rank #{user.globalRank}</p>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1 text-sm">
                          <div className="flex items-center gap-2">
                            <span className="text-muted-foreground">Problems:</span>
                            <span className="font-medium text-foreground">{user.problemsSolved}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-muted-foreground">Contests:</span>
                            <span className="font-medium text-foreground">{user.contestsParticipated}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-muted-foreground">Streak:</span>
                            <span className="font-medium text-orange-500">
                              {user.currentStreak > 0 ? `🔥 ${user.currentStreak}` : '0'}
                            </span>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1 text-sm text-foreground">
                          <Calendar className="w-3 h-3 text-muted-foreground" />
                          {format(new Date(user.createdAt), 'MMM dd, yyyy')}
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Link href={`/profile?userId=${user.id}`}>
                            <Button variant="ghost" size="sm" className="h-8 px-2 gap-1">
                              <ExternalLink className="w-4 h-4" />
                              View
                            </Button>
                          </Link>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => openDeleteDialog(user)}
                            className="h-8 w-8 p-0 text-red-500 hover:text-red-600 hover:bg-red-500/10"
                            disabled={user.role === 'ADMIN'}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent className="bg-card border-border">
          <DialogHeader>
            <DialogTitle className="text-foreground">Delete User</DialogTitle>
            <DialogDescription className="text-muted-foreground">
              Are you sure you want to delete user "{selectedUser?.username}"? This will permanently remove all their
              data including submissions, progress, and achievements. This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDelete}>
              Delete User
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
