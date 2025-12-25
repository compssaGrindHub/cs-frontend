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
import { Textarea } from '@/components/ui/textarea';
import { Plus, Search, Pencil, Trash2, Award, TrendingUp, Users } from 'lucide-react';

type AchievementType =
  | 'STREAK_7'
  | 'STREAK_30'
  | 'PROBLEMS_10'
  | 'PROBLEMS_50'
  | 'PROBLEMS_100'
  | 'CONTEST_PARTICIPATION'
  | 'TOP_10_FINISH'
  | 'PERFECT_ATTENDANCE'
  | 'CUSTOM';

interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  type: AchievementType;
  requirement: Record<string, any>;
  unlockedBy: number;
  createdAt: string;
}

const achievementTypes = [
  { value: 'STREAK_7', label: '7-Day Streak' },
  { value: 'STREAK_30', label: '30-Day Streak' },
  { value: 'PROBLEMS_10', label: '10 Problems Solved' },
  { value: 'PROBLEMS_50', label: '50 Problems Solved' },
  { value: 'PROBLEMS_100', label: '100 Problems Solved' },
  { value: 'CONTEST_PARTICIPATION', label: 'Contest Participation' },
  { value: 'TOP_10_FINISH', label: 'Top 10 Finish' },
  { value: 'PERFECT_ATTENDANCE', label: 'Perfect Attendance' },
  { value: 'CUSTOM', label: 'Custom Achievement' },
];

const iconOptions = ['🔥', '⭐', '🏆', '💎', '🎯', '🚀', '💪', '🎖️', '👑', '⚡', '🌟', '🥇', '🥈', '🥉', '🎓', '📚'];

const mockAchievements: Achievement[] = [
  {
    id: '1',
    name: 'Week Warrior',
    description: 'Maintain a 7-day solving streak',
    icon: '🔥',
    type: 'STREAK_7',
    requirement: { streakDays: 7 },
    unlockedBy: 45,
    createdAt: new Date().toISOString(),
  },
  {
    id: '2',
    name: 'Century Club',
    description: 'Solve 100 coding problems',
    icon: '💯',
    type: 'PROBLEMS_100',
    requirement: { problemsSolved: 100 },
    unlockedBy: 12,
    createdAt: new Date().toISOString(),
  },
  {
    id: '3',
    name: 'Contest Champion',
    description: 'Finish in top 10 in any contest',
    icon: '🏆',
    type: 'TOP_10_FINISH',
    requirement: { maxRank: 10 },
    unlockedBy: 8,
    createdAt: new Date().toISOString(),
  },
];

const emptyAchievement: Omit<Achievement, 'id' | 'unlockedBy' | 'createdAt'> = {
  name: '',
  description: '',
  icon: '🏆',
  type: 'CUSTOM',
  requirement: {},
};

export default function AdminAchievementsPage() {
  const [achievements, setAchievements] = useState<Achievement[]>(mockAchievements);
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState<AchievementType | 'ALL'>('ALL');
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedAchievement, setSelectedAchievement] = useState<Achievement | null>(null);
  const [formData, setFormData] = useState<Omit<Achievement, 'id' | 'unlockedBy' | 'createdAt'>>(emptyAchievement);
  const [requirementInput, setRequirementInput] = useState('');

  const filteredAchievements = useMemo(() => {
    return achievements.filter((achievement) => {
      const matchesSearch =
        achievement.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        achievement.description.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesType = typeFilter === 'ALL' || achievement.type === typeFilter;
      return matchesSearch && matchesType;
    });
  }, [achievements, searchTerm, typeFilter]);

  const stats = [
    { label: 'Total Achievements', value: achievements.length, color: 'text-blue-500', icon: Award },
    {
      label: 'Total Unlocks',
      value: achievements.reduce((sum, a) => sum + a.unlockedBy, 0),
      color: 'text-green-500',
      icon: TrendingUp,
    },
    {
      label: 'Avg per User',
      value: achievements.length > 0 ? (achievements.reduce((sum, a) => sum + a.unlockedBy, 0) / 248).toFixed(1) : '0',
      color: 'text-purple-500',
      icon: Users,
    },
  ];

  const handleCreate = () => {
    const newAchievement: Achievement = {
      ...formData,
      id: `ach-${Date.now()}`,
      requirement: requirementInput ? JSON.parse(requirementInput) : {},
      unlockedBy: 0,
      createdAt: new Date().toISOString(),
    };
    setAchievements([...achievements, newAchievement]);
    setIsCreateDialogOpen(false);
    setFormData(emptyAchievement);
    setRequirementInput('');
  };

  const handleEdit = () => {
    if (!selectedAchievement) return;
    setAchievements(
      achievements.map((a) =>
        a.id === selectedAchievement.id
          ? {
              ...formData,
              id: a.id,
              requirement: requirementInput ? JSON.parse(requirementInput) : {},
              unlockedBy: a.unlockedBy,
              createdAt: a.createdAt,
            }
          : a
      )
    );
    setIsEditDialogOpen(false);
    setSelectedAchievement(null);
    setFormData(emptyAchievement);
    setRequirementInput('');
  };

  const handleDelete = () => {
    if (!selectedAchievement) return;
    setAchievements(achievements.filter((a) => a.id !== selectedAchievement.id));
    setIsDeleteDialogOpen(false);
    setSelectedAchievement(null);
  };

  const openEditDialog = (achievement: Achievement) => {
    setSelectedAchievement(achievement);
    setFormData({
      name: achievement.name,
      description: achievement.description,
      icon: achievement.icon,
      type: achievement.type,
      requirement: achievement.requirement,
    });
    setRequirementInput(JSON.stringify(achievement.requirement, null, 2));
    setIsEditDialogOpen(true);
  };

  const openDeleteDialog = (achievement: Achievement) => {
    setSelectedAchievement(achievement);
    setIsDeleteDialogOpen(true);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Achievement Management</h1>
          <p className="text-muted-foreground mt-1">Create and manage user achievements</p>
        </div>
        <Button onClick={() => setIsCreateDialogOpen(true)} className="gap-2">
          <Plus className="w-4 h-4" />
          Create Achievement
        </Button>
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
          <CardTitle className="text-foreground">Achievements</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search achievements..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9 bg-background border-border"
              />
            </div>
            <Select value={typeFilter} onValueChange={(v) => setTypeFilter(v as AchievementType | 'ALL')}>
              <SelectTrigger className="w-full md:w-[220px] bg-background border-border">
                <SelectValue placeholder="Filter by type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">All Types</SelectItem>
                {achievementTypes.map((type) => (
                  <SelectItem key={type.value} value={type.value}>
                    {type.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Table */}
          <div className="border border-border rounded-lg">
            <Table>
              <TableHeader>
                <TableRow className="hover:bg-muted/50">
                  <TableHead className="text-muted-foreground">Achievement</TableHead>
                  <TableHead className="text-muted-foreground">Type</TableHead>
                  <TableHead className="text-muted-foreground">Requirement</TableHead>
                  <TableHead className="text-muted-foreground">Unlocked By</TableHead>
                  <TableHead className="text-right text-muted-foreground">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredAchievements.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                      No achievements found
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredAchievements.map((achievement) => (
                    <TableRow key={achievement.id} className="hover:bg-muted/50">
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <div className="text-3xl">{achievement.icon}</div>
                          <div>
                            <p className="font-medium text-foreground">{achievement.name}</p>
                            <p className="text-sm text-muted-foreground">{achievement.description}</p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20">
                          {achievementTypes.find((t) => t.value === achievement.type)?.label || achievement.type}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <code className="text-xs bg-muted px-2 py-1 rounded text-foreground">
                          {JSON.stringify(achievement.requirement)}
                        </code>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Users className="w-4 h-4 text-muted-foreground" />
                          <span className="font-medium text-foreground">{achievement.unlockedBy}</span>
                          <span className="text-sm text-muted-foreground">
                            ({((achievement.unlockedBy / 248) * 100).toFixed(1)}%)
                          </span>
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => openEditDialog(achievement)}
                            className="h-8 w-8 p-0"
                          >
                            <Pencil className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => openDeleteDialog(achievement)}
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
            <DialogTitle className="text-foreground">Create New Achievement</DialogTitle>
            <DialogDescription className="text-muted-foreground">
              Define a new achievement that users can unlock
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="name" className="text-foreground">
                Achievement Name
              </Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="bg-background border-border"
                placeholder="e.g., Week Warrior"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="description" className="text-foreground">
                Description
              </Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="bg-background border-border min-h-[80px]"
                placeholder="e.g., Maintain a 7-day solving streak"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="icon" className="text-foreground">
                  Icon
                </Label>
                <Select value={formData.icon} onValueChange={(v) => setFormData({ ...formData, icon: v })}>
                  <SelectTrigger className="bg-background border-border">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {iconOptions.map((icon) => (
                      <SelectItem key={icon} value={icon}>
                        <span className="text-2xl">{icon}</span>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="type" className="text-foreground">
                  Type
                </Label>
                <Select
                  value={formData.type}
                  onValueChange={(v) => setFormData({ ...formData, type: v as AchievementType })}
                >
                  <SelectTrigger className="bg-background border-border">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {achievementTypes.map((type) => (
                      <SelectItem key={type.value} value={type.value}>
                        {type.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="requirement" className="text-foreground">
                Requirement (JSON)
              </Label>
              <Textarea
                id="requirement"
                value={requirementInput}
                onChange={(e) => setRequirementInput(e.target.value)}
                className="bg-background border-border min-h-[100px] font-mono text-sm"
                placeholder='{ "streakDays": 7 }'
              />
              <p className="text-xs text-muted-foreground">
                Example: {`{ "streakDays": 7 }`} or {`{ "problemsSolved": 100 }`}
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleCreate} disabled={!formData.name || !formData.description}>
              Create Achievement
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-2xl bg-card border-border">
          <DialogHeader>
            <DialogTitle className="text-foreground">Edit Achievement</DialogTitle>
            <DialogDescription className="text-muted-foreground">Update achievement details</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="edit-name" className="text-foreground">
                Achievement Name
              </Label>
              <Input
                id="edit-name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="bg-background border-border"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="edit-description" className="text-foreground">
                Description
              </Label>
              <Textarea
                id="edit-description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="bg-background border-border min-h-[80px]"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="edit-icon" className="text-foreground">
                  Icon
                </Label>
                <Select value={formData.icon} onValueChange={(v) => setFormData({ ...formData, icon: v })}>
                  <SelectTrigger className="bg-background border-border">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {iconOptions.map((icon) => (
                      <SelectItem key={icon} value={icon}>
                        <span className="text-2xl">{icon}</span>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="edit-type" className="text-foreground">
                  Type
                </Label>
                <Select
                  value={formData.type}
                  onValueChange={(v) => setFormData({ ...formData, type: v as AchievementType })}
                >
                  <SelectTrigger className="bg-background border-border">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {achievementTypes.map((type) => (
                      <SelectItem key={type.value} value={type.value}>
                        {type.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="edit-requirement" className="text-foreground">
                Requirement (JSON)
              </Label>
              <Textarea
                id="edit-requirement"
                value={requirementInput}
                onChange={(e) => setRequirementInput(e.target.value)}
                className="bg-background border-border min-h-[100px] font-mono text-sm"
              />
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
            <DialogTitle className="text-foreground">Delete Achievement</DialogTitle>
            <DialogDescription className="text-muted-foreground">
              Are you sure you want to delete "{selectedAchievement?.name}"? Users who unlocked this achievement will
              lose it.
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
