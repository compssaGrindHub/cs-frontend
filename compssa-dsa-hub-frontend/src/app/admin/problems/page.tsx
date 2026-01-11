'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
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
import { getProblems, createProblem, updateProblem, deleteProblem, bulkImportProblems } from '@/lib/api';
import { Problem, Platform, Difficulty } from '@/lib/types/problem';
import { Loading } from '@/components/common/Loading';

const platformColors: Record<string, string> = {
  LEETCODE: 'bg-orange-500/10 text-orange-500 border-orange-500/20',
  CODEFORCES: 'bg-blue-500/10 text-blue-500 border-blue-500/20',
  CUSTOM: 'bg-purple-500/10 text-purple-500 border-purple-500/20',
};

const difficultyColors: Record<Difficulty, string> = {
  EASY: 'bg-green-500/10 text-green-500 border-green-500/20',
  MEDIUM: 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20',
  HARD: 'bg-red-500/10 text-red-500 border-red-500/20',
};

const emptyProblem = {
  title: '',
  slug: '',
  platform: 'LEETCODE' as Platform,
  difficulty: 'MEDIUM' as Difficulty,
  problemLink: '',
  topics: [] as string[],
  description: '',
  acceptanceRate: undefined as number | undefined,
};

export default function AdminProblemsPage() {
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState('');
  const [platformFilter, setPlatformFilter] = useState<Platform | 'ALL'>('ALL');
  const [difficultyFilter, setDifficultyFilter] = useState<Difficulty | 'ALL'>('ALL');
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isBulkImportOpen, setIsBulkImportOpen] = useState(false);
  const [selectedProblem, setSelectedProblem] = useState<Problem | null>(null);
  const [formData, setFormData] = useState(emptyProblem);
  const [topicsInput, setTopicsInput] = useState('');
  const [bulkData, setBulkData] = useState('');

  const { data: problemsData, isLoading } = useQuery({
    queryKey: ['problems', 'all', platformFilter, difficultyFilter, searchTerm],
    queryFn: () => getProblems({
      limit: 50,
      platform: platformFilter !== 'ALL' ? platformFilter : undefined,
      difficulty: difficultyFilter !== 'ALL' ? difficultyFilter : undefined,
      search: searchTerm || undefined,
    }),
  });

  const problems = problemsData?.data || [];

  const createMutation = useMutation({
    mutationFn: createProblem,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['problems', 'all'] });
      queryClient.refetchQueries({ queryKey: ['problems', 'all'] });
      setIsCreateDialogOpen(false);
      setFormData(emptyProblem);
      setTopicsInput('');
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Problem }) => updateProblem(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['problems', 'all'] });
      queryClient.refetchQueries({ queryKey: ['problems', 'all'] });
      setIsEditDialogOpen(false);
      setSelectedProblem(null);
      setFormData(emptyProblem);
      setTopicsInput('');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: deleteProblem,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['problems', 'all'] });
      queryClient.refetchQueries({ queryKey: ['problems', 'all'] });
      setIsDeleteDialogOpen(false);
      setSelectedProblem(null);
    },
  });

  const bulkImportMutation = useMutation({
    mutationFn: bulkImportProblems,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['problems', 'all'] });
      queryClient.refetchQueries({ queryKey: ['problems', 'all'] });
      setIsBulkImportOpen(false);
      setBulkData('');
    },
  });

  const stats = [
    { label: 'Total Problems', value: problemsData?.meta?.total || 0, color: 'text-blue-500' },
    { label: 'Easy', value: problems.filter((p) => p.difficulty === 'EASY').length, color: 'text-green-500' },
    { label: 'Medium', value: problems.filter((p) => p.difficulty === 'MEDIUM').length, color: 'text-yellow-500' },
    { label: 'Hard', value: problems.filter((p) => p.difficulty === 'HARD').length, color: 'text-red-500' },
  ];

  const handleCreate = () => {
    createMutation.mutate({
      title: formData.title,
      slug: formData.slug,
      platform: formData.platform,
      difficulty: formData.difficulty,
      problemLink: formData.problemLink,
      description: formData.description,
      topics: topicsInput.split(',').map((t) => t.trim()).filter(Boolean),
      acceptanceRate: formData.acceptanceRate,
    });
  };

  const handleEdit = () => {
    if (!selectedProblem) return;
    updateMutation.mutate({
      id: selectedProblem.id,
      data: {
        ...selectedProblem,
        title: formData.title,
        slug: formData.slug,
        platform: formData.platform,
        difficulty: formData.difficulty,
        problemLink: formData.problemLink,
        description: formData.description,
        topics: topicsInput.split(',').map((t) => t.trim()).filter(Boolean),
        acceptanceRate: formData.acceptanceRate,
      } as Problem,
    });
  };

  const handleDelete = () => {
    if (!selectedProblem) return;
    deleteMutation.mutate(selectedProblem.id);
  };

  const handleBulkImport = () => {
    try {
      const parsed = JSON.parse(bulkData);
      const problemsArray = Array.isArray(parsed) ? parsed : [parsed];
      bulkImportMutation.mutate({ problems: problemsArray });
    } catch {
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
      description: problem.description || '',
      topics: problem.topics,
      acceptanceRate: problem.acceptanceRate,
    });
    setTopicsInput(problem.topics.join(', '));
    setIsEditDialogOpen(true);
  };

  const openDeleteDialog = (problem: Problem) => {
    setSelectedProblem(problem);
    setIsDeleteDialogOpen(true);
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Loading size="lg" label="Loading problems..." />
      </div>
    );
  }

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
                <SelectItem value="CUSTOM">Custom</SelectItem>
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
                  <TableHead className="text-right text-muted-foreground">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {problems.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                      No problems found
                    </TableCell>
                  </TableRow>
                ) : (
                  problems.map((problem) => (
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
                      <TableCell className="text-foreground">
                        {problem.acceptanceRate ? `${problem.acceptanceRate.toFixed(1)}%` : 'N/A'}
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
            <div className="grid gap-2">
              <Label htmlFor="description" className="text-foreground">
                Description
              </Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="bg-background border-border"
                placeholder="Problem description..."
              />
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
                    <SelectItem value="CUSTOM">Custom</SelectItem>
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
                  value={formData.acceptanceRate || ''}
                  onChange={(e) => setFormData({ ...formData, acceptanceRate: e.target.value ? parseFloat(e.target.value) : undefined })}
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
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleCreate} disabled={!formData.title || !formData.slug || createMutation.isPending}>
              {createMutation.isPending ? 'Creating...' : 'Add Problem'}
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
            <div className="grid gap-2">
              <Label htmlFor="edit-description" className="text-foreground">
                Description
              </Label>
              <Textarea
                id="edit-description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
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
                    <SelectItem value="CUSTOM">Custom</SelectItem>
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
                  value={formData.acceptanceRate || ''}
                  onChange={(e) => setFormData({ ...formData, acceptanceRate: e.target.value ? parseFloat(e.target.value) : undefined })}
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
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleEdit} disabled={updateMutation.isPending}>
              {updateMutation.isPending ? 'Saving...' : 'Save Changes'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent className="bg-card border-border">
          <DialogHeader>
            <DialogTitle className="text-foreground">Delete Problem</DialogTitle>
            <DialogDescription className="text-muted-foreground">
              Are you sure you want to delete &quot;{selectedProblem?.title}&quot;? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDelete} disabled={deleteMutation.isPending}>
              {deleteMutation.isPending ? 'Deleting...' : 'Delete'}
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
              placeholder={`[\n  {\n    "title": "Problem Name",\n    "description": "Problem description",\n    "platform": "LEETCODE",\n    "difficulty": "MEDIUM",\n    "problemLink": "https://...",\n    "topics": ["Array", "DP"]\n  }\n]`}
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsBulkImportOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleBulkImport} disabled={!bulkData.trim() || bulkImportMutation.isPending}>
              {bulkImportMutation.isPending ? 'Importing...' : 'Import'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
