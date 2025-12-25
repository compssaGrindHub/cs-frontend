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
import { Plus, Search, Pencil, Trash2, Upload, ExternalLink, Code2 } from 'lucide-react';

type Platform = 'LEETCODE' | 'CODEFORCES' | 'ATCODER' | 'CODECHEF' | 'OTHER';
type Difficulty = 'EASY' | 'MEDIUM' | 'HARD';

interface Problem {
  id: string;
  title: string;
  slug: string;
  platform: Platform;
  difficulty: Difficulty;
  problemLink: string;
  topics: string[];
  acceptanceRate: number;
  isDailyQuestion: boolean;
}

const platformColors: Record<Platform, string> = {
  LEETCODE: 'bg-orange-500/10 text-orange-500 border-orange-500/20',
  CODEFORCES: 'bg-blue-500/10 text-blue-500 border-blue-500/20',
  ATCODER: 'bg-gray-500/10 text-gray-500 border-gray-500/20',
  CODECHEF: 'bg-brown-500/10 text-amber-600 border-amber-500/20',
  OTHER: 'bg-purple-500/10 text-purple-500 border-purple-500/20',
};

const difficultyColors: Record<Difficulty, string> = {
  EASY: 'bg-green-500/10 text-green-500 border-green-500/20',
  MEDIUM: 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20',
  HARD: 'bg-red-500/10 text-red-500 border-red-500/20',
};

const mockProblems: Problem[] = [
  {
    id: '1',
    title: 'Two Sum',
    slug: 'two-sum',
    platform: 'LEETCODE',
    difficulty: 'EASY',
    problemLink: 'https://leetcode.com/problems/two-sum',
    topics: ['Array', 'Hash Table'],
    acceptanceRate: 49.2,
    isDailyQuestion: false,
  },
  {
    id: '2',
    title: 'Longest Substring Without Repeating Characters',
    slug: 'longest-substring-without-repeating-characters',
    platform: 'LEETCODE',
    difficulty: 'MEDIUM',
    problemLink: 'https://leetcode.com/problems/longest-substring-without-repeating-characters',
    topics: ['String', 'Sliding Window', 'Hash Table'],
    acceptanceRate: 33.8,
    isDailyQuestion: true,
  },
  {
    id: '3',
    title: 'Median of Two Sorted Arrays',
    slug: 'median-of-two-sorted-arrays',
    platform: 'LEETCODE',
    difficulty: 'HARD',
    problemLink: 'https://leetcode.com/problems/median-of-two-sorted-arrays',
    topics: ['Array', 'Binary Search', 'Divide and Conquer'],
    acceptanceRate: 36.7,
    isDailyQuestion: false,
  },
];

const emptyProblem: Omit<Problem, 'id'> = {
  title: '',
  slug: '',
  platform: 'LEETCODE',
  difficulty: 'MEDIUM',
  problemLink: '',
  topics: [],
  acceptanceRate: 0,
  isDailyQuestion: false,
};

export default function AdminProblemsPage() {
  const [problems, setProblems] = useState<Problem[]>(mockProblems);
  const [searchTerm, setSearchTerm] = useState('');
  const [platformFilter, setPlatformFilter] = useState<Platform | 'ALL'>('ALL');
  const [difficultyFilter, setDifficultyFilter] = useState<Difficulty | 'ALL'>('ALL');
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isBulkImportOpen, setIsBulkImportOpen] = useState(false);
  const [selectedProblem, setSelectedProblem] = useState<Problem | null>(null);
  const [formData, setFormData] = useState<Omit<Problem, 'id'>>(emptyProblem);
  const [topicsInput, setTopicsInput] = useState('');
  const [bulkData, setBulkData] = useState('');

  const filteredProblems = useMemo(() => {
    return problems.filter((problem) => {
      const matchesSearch =
        problem.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        problem.topics.some((t) => t.toLowerCase().includes(searchTerm.toLowerCase()));
      const matchesPlatform = platformFilter === 'ALL' || problem.platform === platformFilter;
      const matchesDifficulty = difficultyFilter === 'ALL' || problem.difficulty === difficultyFilter;
      return matchesSearch && matchesPlatform && matchesDifficulty;
    });
  }, [problems, searchTerm, platformFilter, difficultyFilter]);

  const stats = [
    { label: 'Total Problems', value: problems.length, color: 'text-blue-500' },
    { label: 'Easy', value: problems.filter((p) => p.difficulty === 'EASY').length, color: 'text-green-500' },
    { label: 'Medium', value: problems.filter((p) => p.difficulty === 'MEDIUM').length, color: 'text-yellow-500' },
    { label: 'Hard', value: problems.filter((p) => p.difficulty === 'HARD').length, color: 'text-red-500' },
  ];

  const handleCreate = () => {
    const newProblem: Problem = {
      ...formData,
      id: `prob-${Date.now()}`,
      topics: topicsInput.split(',').map((t) => t.trim()).filter(Boolean),
    };
    setProblems([...problems, newProblem]);
    setIsCreateDialogOpen(false);
    setFormData(emptyProblem);
    setTopicsInput('');
  };

  const handleEdit = () => {
    if (!selectedProblem) return;
    setProblems(
      problems.map((p) =>
        p.id === selectedProblem.id
          ? { ...formData, id: p.id, topics: topicsInput.split(',').map((t) => t.trim()).filter(Boolean) }
          : p
      )
    );
    setIsEditDialogOpen(false);
    setSelectedProblem(null);
    setFormData(emptyProblem);
    setTopicsInput('');
  };

  const handleDelete = () => {
    if (!selectedProblem) return;
    setProblems(problems.filter((p) => p.id !== selectedProblem.id));
    setIsDeleteDialogOpen(false);
    setSelectedProblem(null);
  };

  const handleBulkImport = () => {
    try {
      const imported = JSON.parse(bulkData);
      const newProblems = Array.isArray(imported) ? imported : [imported];
      setProblems([
        ...problems,
        ...newProblems.map((p: any) => ({
          ...p,
          id: `prob-${Date.now()}-${Math.random()}`,
        })),
      ]);
      setIsBulkImportOpen(false);
      setBulkData('');
    } catch (error) {
      alert('Invalid JSON format');
    }
  };

  const openEditDialog = (problem: Problem) => {
    setSelectedProblem(problem);
    setFormData({
      title: problem.title,
      slug: problem.slug,
      platform: problem.platform,
      difficulty: problem.difficulty,
      problemLink: problem.problemLink,
      topics: problem.topics,
      acceptanceRate: problem.acceptanceRate,
      isDailyQuestion: problem.isDailyQuestion,
    });
    setTopicsInput(problem.topics.join(', '));
    setIsEditDialogOpen(true);
  };

  const openDeleteDialog = (problem: Problem) => {
    setSelectedProblem(problem);
    setIsDeleteDialogOpen(true);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Problem Management</h1>
          <p className="text-muted-foreground mt-1">Manage coding problems from various platforms</p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" onClick={() => setIsBulkImportOpen(true)} className="gap-2">
            <Upload className="w-4 h-4" />
            Bulk Import
          </Button>
          <Button onClick={() => setIsCreateDialogOpen(true)} className="gap-2">
            <Plus className="w-4 h-4" />
            Add Problem
          </Button>
        </div>
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
          <CardTitle className="text-foreground">Problems</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search problems..."
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
                <SelectItem value="LEETCODE">LeetCode</SelectItem>
                <SelectItem value="CODEFORCES">Codeforces</SelectItem>
                <SelectItem value="ATCODER">AtCoder</SelectItem>
                <SelectItem value="CODECHEF">CodeChef</SelectItem>
                <SelectItem value="OTHER">Other</SelectItem>
              </SelectContent>
            </Select>
            <Select value={difficultyFilter} onValueChange={(v) => setDifficultyFilter(v as Difficulty | 'ALL')}>
              <SelectTrigger className="w-full md:w-[180px] bg-background border-border">
                <SelectValue placeholder="Difficulty" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">All Difficulties</SelectItem>
                <SelectItem value="EASY">Easy</SelectItem>
                <SelectItem value="MEDIUM">Medium</SelectItem>
                <SelectItem value="HARD">Hard</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Table */}
          <div className="border border-border rounded-lg">
            <Table>
              <TableHeader>
                <TableRow className="hover:bg-muted/50">
                  <TableHead className="text-muted-foreground">Problem</TableHead>
                  <TableHead className="text-muted-foreground">Platform</TableHead>
                  <TableHead className="text-muted-foreground">Difficulty</TableHead>
                  <TableHead className="text-muted-foreground">Topics</TableHead>
                  <TableHead className="text-muted-foreground">Acceptance</TableHead>
                  <TableHead className="text-muted-foreground">Daily</TableHead>
                  <TableHead className="text-right text-muted-foreground">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredProblems.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                      No problems found
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredProblems.map((problem) => (
                    <TableRow key={problem.id} className="hover:bg-muted/50">
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Code2 className="w-4 h-4 text-muted-foreground" />
                          <div>
                            <p className="font-medium text-foreground">{problem.title}</p>
                            <a
                              href={problem.problemLink}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-xs text-primary hover:underline flex items-center gap-1"
                            >
                              View Problem <ExternalLink className="w-3 h-3" />
                            </a>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge className={platformColors[problem.platform]}>{problem.platform}</Badge>
                      </TableCell>
                      <TableCell>
                        <Badge className={difficultyColors[problem.difficulty]}>{problem.difficulty}</Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-wrap gap-1">
                          {problem.topics.slice(0, 2).map((topic) => (
                            <Badge key={topic} variant="outline" className="text-xs bg-muted">
                              {topic}
                            </Badge>
                          ))}
                          {problem.topics.length > 2 && (
                            <Badge variant="outline" className="text-xs bg-muted">
                              +{problem.topics.length - 2}
                            </Badge>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="text-foreground">{problem.acceptanceRate.toFixed(1)}%</TableCell>
                      <TableCell>
                        {problem.isDailyQuestion && (
                          <Badge className="bg-yellow-500/10 text-yellow-500 border-yellow-500/20">Daily</Badge>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => openEditDialog(problem)}
                            className="h-8 w-8 p-0"
                          >
                            <Pencil className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => openDeleteDialog(problem)}
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
            <DialogTitle className="text-foreground">Add New Problem</DialogTitle>
            <DialogDescription className="text-muted-foreground">
              Enter problem details to add to the platform
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="title" className="text-foreground">
                Problem Title
              </Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="bg-background border-border"
                placeholder="e.g., Two Sum"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="slug" className="text-foreground">
                  Slug
                </Label>
                <Input
                  id="slug"
                  value={formData.slug}
                  onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                  className="bg-background border-border"
                  placeholder="e.g., two-sum"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="link" className="text-foreground">
                  Problem Link
                </Label>
                <Input
                  id="link"
                  value={formData.problemLink}
                  onChange={(e) => setFormData({ ...formData, problemLink: e.target.value })}
                  className="bg-background border-border"
                  placeholder="https://..."
                />
              </div>
            </div>
            <div className="grid grid-cols-3 gap-4">
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
                    <SelectItem value="LEETCODE">LeetCode</SelectItem>
                    <SelectItem value="CODEFORCES">Codeforces</SelectItem>
                    <SelectItem value="ATCODER">AtCoder</SelectItem>
                    <SelectItem value="CODECHEF">CodeChef</SelectItem>
                    <SelectItem value="OTHER">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="difficulty" className="text-foreground">
                  Difficulty
                </Label>
                <Select
                  value={formData.difficulty}
                  onValueChange={(v) => setFormData({ ...formData, difficulty: v as Difficulty })}
                >
                  <SelectTrigger className="bg-background border-border">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="EASY">Easy</SelectItem>
                    <SelectItem value="MEDIUM">Medium</SelectItem>
                    <SelectItem value="HARD">Hard</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="acceptance" className="text-foreground">
                  Acceptance %
                </Label>
                <Input
                  id="acceptance"
                  type="number"
                  value={formData.acceptanceRate}
                  onChange={(e) => setFormData({ ...formData, acceptanceRate: parseFloat(e.target.value) || 0 })}
                  className="bg-background border-border"
                  placeholder="0-100"
                />
              </div>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="topics" className="text-foreground">
                Topics (comma-separated)
              </Label>
              <Input
                id="topics"
                value={topicsInput}
                onChange={(e) => setTopicsInput(e.target.value)}
                className="bg-background border-border"
                placeholder="e.g., Array, Hash Table, Two Pointers"
              />
            </div>
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="daily"
                checked={formData.isDailyQuestion}
                onChange={(e) => setFormData({ ...formData, isDailyQuestion: e.target.checked })}
                className="w-4 h-4"
              />
              <Label htmlFor="daily" className="text-foreground cursor-pointer">
                Mark as Daily Question
              </Label>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleCreate} disabled={!formData.title || !formData.slug}>
              Add Problem
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-2xl bg-card border-border">
          <DialogHeader>
            <DialogTitle className="text-foreground">Edit Problem</DialogTitle>
            <DialogDescription className="text-muted-foreground">Update problem details</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="edit-title" className="text-foreground">
                Problem Title
              </Label>
              <Input
                id="edit-title"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="bg-background border-border"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="edit-slug" className="text-foreground">
                  Slug
                </Label>
                <Input
                  id="edit-slug"
                  value={formData.slug}
                  onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                  className="bg-background border-border"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="edit-link" className="text-foreground">
                  Problem Link
                </Label>
                <Input
                  id="edit-link"
                  value={formData.problemLink}
                  onChange={(e) => setFormData({ ...formData, problemLink: e.target.value })}
                  className="bg-background border-border"
                />
              </div>
            </div>
            <div className="grid grid-cols-3 gap-4">
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
                    <SelectItem value="LEETCODE">LeetCode</SelectItem>
                    <SelectItem value="CODEFORCES">Codeforces</SelectItem>
                    <SelectItem value="ATCODER">AtCoder</SelectItem>
                    <SelectItem value="CODECHEF">CodeChef</SelectItem>
                    <SelectItem value="OTHER">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="edit-difficulty" className="text-foreground">
                  Difficulty
                </Label>
                <Select
                  value={formData.difficulty}
                  onValueChange={(v) => setFormData({ ...formData, difficulty: v as Difficulty })}
                >
                  <SelectTrigger className="bg-background border-border">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="EASY">Easy</SelectItem>
                    <SelectItem value="MEDIUM">Medium</SelectItem>
                    <SelectItem value="HARD">Hard</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="edit-acceptance" className="text-foreground">
                  Acceptance %
                </Label>
                <Input
                  id="edit-acceptance"
                  type="number"
                  value={formData.acceptanceRate}
                  onChange={(e) => setFormData({ ...formData, acceptanceRate: parseFloat(e.target.value) || 0 })}
                  className="bg-background border-border"
                />
              </div>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="edit-topics" className="text-foreground">
                Topics (comma-separated)
              </Label>
              <Input
                id="edit-topics"
                value={topicsInput}
                onChange={(e) => setTopicsInput(e.target.value)}
                className="bg-background border-border"
              />
            </div>
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="edit-daily"
                checked={formData.isDailyQuestion}
                onChange={(e) => setFormData({ ...formData, isDailyQuestion: e.target.checked })}
                className="w-4 h-4"
              />
              <Label htmlFor="edit-daily" className="text-foreground cursor-pointer">
                Mark as Daily Question
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
            <DialogTitle className="text-foreground">Delete Problem</DialogTitle>
            <DialogDescription className="text-muted-foreground">
              Are you sure you want to delete "{selectedProblem?.title}"? This action cannot be undone.
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

      {/* Bulk Import Dialog */}
      <Dialog open={isBulkImportOpen} onOpenChange={setIsBulkImportOpen}>
        <DialogContent className="max-w-3xl bg-card border-border">
          <DialogHeader>
            <DialogTitle className="text-foreground">Bulk Import Problems</DialogTitle>
            <DialogDescription className="text-muted-foreground">
              Paste JSON array of problems to import multiple at once
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <Textarea
              value={bulkData}
              onChange={(e) => setBulkData(e.target.value)}
              className="bg-background border-border min-h-[300px] font-mono text-sm"
              placeholder={`[\n  {\n    "title": "Problem Name",\n    "slug": "problem-name",\n    "platform": "LEETCODE",\n    "difficulty": "MEDIUM",\n    "problemLink": "https://...",\n    "topics": ["Array", "DP"],\n    "acceptanceRate": 45.2,\n    "isDailyQuestion": false\n  }\n]`}
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsBulkImportOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleBulkImport} disabled={!bulkData.trim()}>
              Import
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
