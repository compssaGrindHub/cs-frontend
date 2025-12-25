'use client';

import { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Plus, Search, Pencil, Trash2, Trophy, Clock, Users, RefreshCw, ExternalLink } from 'lucide-react';
import { format } from 'date-fns';

type Platform = 'CODEFORCES' | 'LEETCODE' | 'ATCODER' | 'CODECHEF' | 'OTHER';

interface Contest {
  id: string;
  name: string;
  platform: Platform;
  externalId: string;
  startTime: string;
  duration: number; // minutes
  isRated: boolean;
  participants: number;
  status: 'UPCOMING' | 'ONGOING' | 'COMPLETED';
}

const platformColors: Record<Platform, string> = {
  CODEFORCES: 'bg-blue-500/10 text-blue-500 border-blue-500/20',
  LEETCODE: 'bg-orange-500/10 text-orange-500 border-orange-500/20',
  ATCODER: 'bg-gray-500/10 text-gray-500 border-gray-500/20',
  CODECHEF: 'bg-amber-500/10 text-amber-600 border-amber-500/20',
  OTHER: 'bg-purple-500/10 text-purple-500 border-purple-500/20',
};

const statusColors = {
  UPCOMING: 'bg-blue-500/10 text-blue-500 border-blue-500/20',
  ONGOING: 'bg-green-500/10 text-green-500 border-green-500/20',
  COMPLETED: 'bg-gray-500/10 text-gray-500 border-gray-500/20',
};

const mockContests: Contest[] = [
  {
    id: '1',
    name: 'Codeforces Round #918 (Div. 2)',
    platform: 'CODEFORCES',
    externalId: '1918',
    startTime: '2026-01-28T14:35:00Z',
    duration: 120,
    isRated: true,
    participants: 0,
    status: 'UPCOMING',
  },
  {
    id: '2',
    name: 'Weekly Contest 378',
    platform: 'LEETCODE',
    externalId: 'weekly-378',
    startTime: '2026-01-26T02:30:00Z',
    duration: 90,
    isRated: true,
    participants: 0,
    status: 'UPCOMING',
  },
  {
    id: '3',
    name: 'AtCoder Beginner Contest 337',
    platform: 'ATCODER',
    externalId: 'abc337',
    startTime: '2025-12-20T12:00:00Z',
    duration: 100,
    isRated: true,
    participants: 24,
    status: 'COMPLETED',
  },
];

const emptyContest: Omit<Contest, 'id' | 'participants' | 'status'> = {
  name: '',
  platform: 'CODEFORCES',
  externalId: '',
  startTime: '',
  duration: 120,
  isRated: true,
};

export default function AdminContestsPage() {
  const [contests, setContests] = useState<Contest[]>(mockContests);
  const [searchTerm, setSearchTerm] = useState('');
  const [platformFilter, setPlatformFilter] = useState<Platform | 'ALL'>('ALL');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'UPCOMING' | 'ONGOING' | 'COMPLETED'>('ALL');
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedContest, setSelectedContest] = useState<Contest | null>(null);
  const [formData, setFormData] = useState<Omit<Contest, 'id' | 'participants' | 'status'>>(emptyContest);

  const getContestStatus = (startTime: string, duration: number): Contest['status'] => {
    const now = new Date();
    const start = new Date(startTime);
    const end = new Date(start.getTime() + duration * 60000);

    if (now < start) return 'UPCOMING';
    if (now >= start && now <= end) return 'ONGOING';
    return 'COMPLETED';
  };

  const filteredContests = useMemo(() => {
    return contests.filter((contest) => {
      const matchesSearch = contest.name.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesPlatform = platformFilter === 'ALL' || contest.platform === platformFilter;
      const matchesStatus = statusFilter === 'ALL' || contest.status === statusFilter;
      return matchesSearch && matchesPlatform && matchesStatus;
    });
  }, [contests, searchTerm, platformFilter, statusFilter]);

  const stats = [
    { label: 'Total Contests', value: contests.length, color: 'text-blue-500' },
    { label: 'Upcoming', value: contests.filter((c) => c.status === 'UPCOMING').length, color: 'text-green-500' },
    { label: 'Ongoing', value: contests.filter((c) => c.status === 'ONGOING').length, color: 'text-yellow-500' },
    { label: 'Completed', value: contests.filter((c) => c.status === 'COMPLETED').length, color: 'text-gray-500' },
  ];

  const handleCreate = () => {
    const status = getContestStatus(formData.startTime, formData.duration);
    const newContest: Contest = {
      ...formData,
      id: `contest-${Date.now()}`,
      participants: 0,
      status,
    };
    setContests([...contests, newContest]);
    setIsCreateDialogOpen(false);
    setFormData(emptyContest);
  };

  const handleEdit = () => {
    if (!selectedContest) return;
    const status = getContestStatus(formData.startTime, formData.duration);
    setContests(
      contests.map((c) =>
        c.id === selectedContest.id ? { ...formData, id: c.id, participants: c.participants, status } : c
      )
    );
    setIsEditDialogOpen(false);
    setSelectedContest(null);
    setFormData(emptyContest);
  };

  const handleDelete = () => {
    if (!selectedContest) return;
    setContests(contests.filter((c) => c.id !== selectedContest.id));
    setIsDeleteDialogOpen(false);
    setSelectedContest(null);
  };

  const handleSyncStandings = (contestId: string) => {
    // Mock API call - would POST to /contests/:id/sync
    console.log('Syncing standings for contest:', contestId);
    // Show success toast
  };

  const openEditDialog = (contest: Contest) => {
    setSelectedContest(contest);
    setFormData({
      name: contest.name,
      platform: contest.platform,
      externalId: contest.externalId,
      startTime: contest.startTime,
      duration: contest.duration,
      isRated: contest.isRated,
    });
    setIsEditDialogOpen(true);
  };

  const openDeleteDialog = (contest: Contest) => {
    setSelectedContest(contest);
    setIsDeleteDialogOpen(true);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Contest Management</h1>
          <p className="text-muted-foreground mt-1">Manage and track coding contests</p>
        </div>
        <Button onClick={() => setIsCreateDialogOpen(true)} className="gap-2">
          <Plus className="w-4 h-4" />
          Add Contest
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {stats.map((stat) => (
          <Card key={stat.label} className="bg-card border-border shadow-sm">
            <CardContent className="p-6">
              <p className="text-sm text-muted-foreground">{stat.label}</p>
              <p className={`text-3xl font-bold mt-2 ${stat.color}`}>{stat.value}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Filters & Table */}
      <Card className="bg-card border-border shadow-sm">
        <CardHeader>
          <CardTitle className="text-foreground">Contests</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search contests..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9 bg-background border-border"
              />
            </div>
            <Select value={platformFilter} onValueChange={(v) => setPlatformFilter(v as Platform | 'ALL')}>
              <SelectTrigger className="w-full md:w-[180px] bg-background border-border">
                <SelectValue placeholder="Platform" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">All Platforms</SelectItem>
                <SelectItem value="CODEFORCES">Codeforces</SelectItem>
                <SelectItem value="LEETCODE">LeetCode</SelectItem>
                <SelectItem value="ATCODER">AtCoder</SelectItem>
                <SelectItem value="CODECHEF">CodeChef</SelectItem>
                <SelectItem value="OTHER">Other</SelectItem>
              </SelectContent>
            </Select>
            <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v as typeof statusFilter)}>
              <SelectTrigger className="w-full md:w-[180px] bg-background border-border">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">All Status</SelectItem>
                <SelectItem value="UPCOMING">Upcoming</SelectItem>
                <SelectItem value="ONGOING">Ongoing</SelectItem>
                <SelectItem value="COMPLETED">Completed</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Table */}
          <div className="border border-border rounded-lg">
            <Table>
              <TableHeader>
                <TableRow className="hover:bg-muted/50">
                  <TableHead className="text-muted-foreground">Contest</TableHead>
                  <TableHead className="text-muted-foreground">Platform</TableHead>
                  <TableHead className="text-muted-foreground">Start Time</TableHead>
                  <TableHead className="text-muted-foreground">Duration</TableHead>
                  <TableHead className="text-muted-foreground">Status</TableHead>
                  <TableHead className="text-muted-foreground">Participants</TableHead>
                  <TableHead className="text-right text-muted-foreground">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredContests.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                      No contests found
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredContests.map((contest) => (
                    <TableRow key={contest.id} className="hover:bg-muted/50">
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Trophy className="w-4 h-4 text-yellow-500" />
                          <div>
                            <p className="font-medium text-foreground">{contest.name}</p>
                            <p className="text-xs text-muted-foreground">ID: {contest.externalId}</p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge className={platformColors[contest.platform]}>{contest.platform}</Badge>
                      </TableCell>
                      <TableCell className="text-foreground">
                        <div className="text-sm">
                          <p>{format(new Date(contest.startTime), 'MMM dd, yyyy')}</p>
                          <p className="text-xs text-muted-foreground">
                            {format(new Date(contest.startTime), 'HH:mm')}
                          </p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1 text-sm text-foreground">
                          <Clock className="w-3 h-3 text-muted-foreground" />
                          {contest.duration} min
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Badge className={statusColors[contest.status]}>{contest.status}</Badge>
                          {contest.isRated && (
                            <Badge variant="outline" className="text-xs bg-yellow-500/10 text-yellow-500 border-yellow-500/20">
                              Rated
                            </Badge>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1 text-sm text-foreground">
                          <Users className="w-3 h-3 text-muted-foreground" />
                          {contest.participants}
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-2">
                          {contest.status === 'COMPLETED' && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleSyncStandings(contest.id)}
                              className="h-8 px-2 gap-1 text-blue-500 hover:text-blue-600 hover:bg-blue-500/10"
                              title="Sync Standings"
                            >
                              <RefreshCw className="w-4 h-4" />
                            </Button>
                          )}
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => openEditDialog(contest)}
                            className="h-8 w-8 p-0"
                          >
                            <Pencil className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => openDeleteDialog(contest)}
                            className="h-8 w-8 p-0 text-red-500 hover:text-red-600 hover:bg-red-500/10"
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

      {/* Create Dialog */}
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent className="max-w-2xl bg-card border-border">
          <DialogHeader>
            <DialogTitle className="text-foreground">Add New Contest</DialogTitle>
            <DialogDescription className="text-muted-foreground">
              Enter contest details to add to the platform
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="name" className="text-foreground">
                Contest Name
              </Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="bg-background border-border"
                placeholder="e.g., Codeforces Round #918"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="platform" className="text-foreground">
                  Platform
                </Label>
                <Select
                  value={formData.platform}
                  onValueChange={(v) => setFormData({ ...formData, platform: v as Platform })}
                >
                  <SelectTrigger className="bg-background border-border">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="CODEFORCES">Codeforces</SelectItem>
                    <SelectItem value="LEETCODE">LeetCode</SelectItem>
                    <SelectItem value="ATCODER">AtCoder</SelectItem>
                    <SelectItem value="CODECHEF">CodeChef</SelectItem>
                    <SelectItem value="OTHER">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="externalId" className="text-foreground">
                  External ID
                </Label>
                <Input
                  id="externalId"
                  value={formData.externalId}
                  onChange={(e) => setFormData({ ...formData, externalId: e.target.value })}
                  className="bg-background border-border"
                  placeholder="e.g., 1918"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="startTime" className="text-foreground">
                  Start Time
                </Label>
                <Input
                  id="startTime"
                  type="datetime-local"
                  value={formData.startTime ? formData.startTime.slice(0, 16) : ''}
                  onChange={(e) => setFormData({ ...formData, startTime: new Date(e.target.value).toISOString() })}
                  className="bg-background border-border"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="duration" className="text-foreground">
                  Duration (minutes)
                </Label>
                <Input
                  id="duration"
                  type="number"
                  value={formData.duration}
                  onChange={(e) => setFormData({ ...formData, duration: parseInt(e.target.value) || 0 })}
                  className="bg-background border-border"
                  placeholder="120"
                />
              </div>
            </div>
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="isRated"
                checked={formData.isRated}
                onChange={(e) => setFormData({ ...formData, isRated: e.target.checked })}
                className="w-4 h-4"
              />
              <Label htmlFor="isRated" className="text-foreground cursor-pointer">
                Rated Contest
              </Label>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleCreate} disabled={!formData.name || !formData.externalId}>
              Add Contest
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-2xl bg-card border-border">
          <DialogHeader>
            <DialogTitle className="text-foreground">Edit Contest</DialogTitle>
            <DialogDescription className="text-muted-foreground">Update contest details</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="edit-name" className="text-foreground">
                Contest Name
              </Label>
              <Input
                id="edit-name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="bg-background border-border"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="edit-platform" className="text-foreground">
                  Platform
                </Label>
                <Select
                  value={formData.platform}
                  onValueChange={(v) => setFormData({ ...formData, platform: v as Platform })}
                >
                  <SelectTrigger className="bg-background border-border">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="CODEFORCES">Codeforces</SelectItem>
                    <SelectItem value="LEETCODE">LeetCode</SelectItem>
                    <SelectItem value="ATCODER">AtCoder</SelectItem>
                    <SelectItem value="CODECHEF">CodeChef</SelectItem>
                    <SelectItem value="OTHER">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="edit-externalId" className="text-foreground">
                  External ID
                </Label>
                <Input
                  id="edit-externalId"
                  value={formData.externalId}
                  onChange={(e) => setFormData({ ...formData, externalId: e.target.value })}
                  className="bg-background border-border"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="edit-startTime" className="text-foreground">
                  Start Time
                </Label>
                <Input
                  id="edit-startTime"
                  type="datetime-local"
                  value={formData.startTime ? formData.startTime.slice(0, 16) : ''}
                  onChange={(e) => setFormData({ ...formData, startTime: new Date(e.target.value).toISOString() })}
                  className="bg-background border-border"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="edit-duration" className="text-foreground">
                  Duration (minutes)
                </Label>
                <Input
                  id="edit-duration"
                  type="number"
                  value={formData.duration}
                  onChange={(e) => setFormData({ ...formData, duration: parseInt(e.target.value) || 0 })}
                  className="bg-background border-border"
                />
              </div>
            </div>
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="edit-isRated"
                checked={formData.isRated}
                onChange={(e) => setFormData({ ...formData, isRated: e.target.checked })}
                className="w-4 h-4"
              />
              <Label htmlFor="edit-isRated" className="text-foreground cursor-pointer">
                Rated Contest
              </Label>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleEdit}>Save Changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent className="bg-card border-border">
          <DialogHeader>
            <DialogTitle className="text-foreground">Delete Contest</DialogTitle>
            <DialogDescription className="text-muted-foreground">
              Are you sure you want to delete "{selectedContest?.name}"? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDelete}>
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
