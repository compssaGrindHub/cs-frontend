'use client';

import { useState, useMemo, useEffect, useRef } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useAuthStore } from '@/lib/stores/authStore';
import { Search, List, LayoutGrid, CheckCircle2, XCircle, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { getProblems, Problem } from '@/lib/api';
import { Loading } from '@/components/common/Loading';
import { EmptyState } from '@/components/common/EmptyState';
import { Pagination } from '@/components/common/Pagination';
import Link from 'next/link';

const difficultyColors = {
  EASY: 'text-green-500 bg-green-500/10 border-green-500/30',
  MEDIUM: 'text-yellow-500 bg-yellow-500/10 border-yellow-500/30',
  HARD: 'text-red-500 bg-red-500/10 border-red-500/30',
};

const statusIcons = {
  solved: CheckCircle2,
  attempted: Clock,
  unsolved: XCircle,
};

const statusColors = {
  solved: 'text-green-500',
  attempted: 'text-yellow-500',
  unsolved: 'text-muted-foreground',
};

const commonTopics = [
  'Arrays', 'Hash Table', 'Two Pointers', 'String', 'Dynamic Programming',
  'Binary Search', 'Tree', 'Graph', 'Backtracking', 'Greedy', 'Math',
  'Sorting', 'Stack', 'Queue', 'Linked List', 'Heap', 'Trie', 'Union Find',
  'Sliding Window', 'Bit Manipulation', 'Recursion', 'Matrix', 'Monotonic Stack'
];

export default function ProblemsPage() {
  const { user } = useAuthStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('list');
  const [selectedDifficulty, setSelectedDifficulty] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [selectedPlatform, setSelectedPlatform] = useState('all');
  const [selectedTopics, setSelectedTopics] = useState<string[]>([]);
  const [sortBy, setSortBy] = useState<'difficulty' | 'title' | 'acceptanceRate'>('title');
  const [page, setPage] = useState(1);

  const apiParams = useMemo(() => {
    const params: any = {
      page,
      limit: 20,
      sortBy,
    };

    if (searchQuery) {
      params.search = searchQuery;
    }

    if (selectedDifficulty !== 'all') {
      params.difficulty = selectedDifficulty.toUpperCase();
    }

    if (selectedStatus !== 'all') {
      params.status = selectedStatus;
    }

    if (selectedPlatform !== 'all') {
      params.platform = selectedPlatform.toUpperCase();
    }

    if (selectedTopics.length > 0) {
      params.topics = selectedTopics.join(',');
    }

    return params;
  }, [page, searchQuery, selectedDifficulty, selectedStatus, selectedPlatform, selectedTopics, sortBy]);

  const { data: problemsData, isLoading } = useQuery({
    queryKey: ['problems', apiParams],
    queryFn: () => getProblems(apiParams),
  });

  const problems = Array.isArray(problemsData?.data) ? problemsData.data : [];
  const meta = problemsData?.meta || null;

  const allTopics = useMemo(() => {
    const topicSet = new Set<string>();
    if (problems && Array.isArray(problems)) {
      problems.forEach((p) => {
        if (p && Array.isArray(p.topics)) {
          p.topics.forEach((t) => {
            if (t) topicSet.add(t);
          });
        }
      });
    }
    return Array.from(topicSet).sort();
  }, [problems]);

  const activeFiltersCount = 
    (selectedDifficulty !== 'all' ? 1 : 0) +
    (selectedStatus !== 'all' ? 1 : 0) +
    (selectedPlatform !== 'all' ? 1 : 0) +
    selectedTopics.length;

  const clearAllFilters = () => {
    setSelectedDifficulty('all');
    setSelectedStatus('all');
    setSelectedPlatform('all');
    setSelectedTopics([]);
    setPage(1);
  };

  const toggleTopic = (topic: string) => {
    setSelectedTopics((prev) => {
      if (prev.includes(topic)) {
        return prev.filter((t) => t !== topic);
      }
      return [...prev, topic];
    });
    setPage(1);
  };

  // Track previous filter values to reset page only when filters actually change
  const prevFiltersRef = useRef<string>('');
  
  useEffect(() => {
    // Create a stable key from all filter values
    const filtersKey = JSON.stringify({
      searchQuery,
      selectedDifficulty,
      selectedStatus,
      selectedPlatform,
      sortBy,
      selectedTopics: selectedTopics.sort()
    });

    // Only reset page if filters actually changed (not just on mount)
    if (prevFiltersRef.current && prevFiltersRef.current !== filtersKey) {
      setPage(1);
    }

    prevFiltersRef.current = filtersKey;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchQuery, selectedDifficulty, selectedStatus, selectedPlatform, sortBy, selectedTopics.length, selectedTopics.join(',')]);

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-foreground">Problems</h1>
          <div className="flex items-center gap-2">
            <Button
              variant={viewMode === 'list' ? 'default' : 'outline'}
              size="sm"
              className={viewMode === 'list' ? 'bg-foreground text-background hover:bg-foreground/90' : 'border-border text-foreground hover:bg-foreground/5'}
              onClick={() => setViewMode('list')}
            >
              <List className="w-4 h-4 mr-2" />
              List
            </Button>
            <Button
              variant={viewMode === 'grid' ? 'default' : 'outline'}
              size="sm"
              className={viewMode === 'grid' ? 'bg-foreground text-background hover:bg-foreground/90' : 'border-border text-foreground hover:bg-foreground/5'}
              onClick={() => setViewMode('grid')}
            >
              <LayoutGrid className="w-4 h-4 mr-2" />
              Grid
            </Button>
          </div>
        </div>

        {/* Search Bar */}
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground z-10" />
          <Input
            type="text"
            placeholder="Search problems by title, topic, or ID..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full h-12 pl-12 pr-4 bg-card border-border"
          />
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-3">
          <span className="text-sm text-muted-foreground">Filters:</span>
          
          {/* Difficulty */}
          <Select value={selectedDifficulty} onValueChange={setSelectedDifficulty}>
            <SelectTrigger className="w-[140px] bg-card border-border text-foreground">
              <SelectValue placeholder="Difficulty" />
            </SelectTrigger>
            <SelectContent className="bg-card border-border">
              <SelectItem value="all">Difficulty: All</SelectItem>
              <SelectItem value="easy">Easy</SelectItem>
              <SelectItem value="medium">Medium</SelectItem>
              <SelectItem value="hard">Hard</SelectItem>
            </SelectContent>
          </Select>

          {/* Topic - Multi-select via checkboxes in dropdown */}
          <Select>
            <SelectTrigger className="w-[180px] bg-card border-border text-foreground">
              <SelectValue placeholder={selectedTopics.length > 0 ? `${selectedTopics.length} topics` : 'Topics'} />
            </SelectTrigger>
            <SelectContent className="bg-card border-border max-h-[300px] overflow-y-auto">
              {commonTopics.map((topic) => (
                <div key={topic} className="flex items-center gap-2 px-2 py-1.5 hover:bg-muted/50">
                  <input
                    type="checkbox"
                    checked={selectedTopics.includes(topic)}
                    onChange={() => toggleTopic(topic)}
                    className="w-4 h-4 rounded border-border"
                  />
                  <span className="text-sm text-foreground">{topic}</span>
                </div>
              ))}
            </SelectContent>
          </Select>

          {/* Status */}
          <Select value={selectedStatus} onValueChange={setSelectedStatus}>
            <SelectTrigger className="w-[160px] bg-card border-border text-foreground">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent className="bg-card border-border">
              <SelectItem value="all">Status: All</SelectItem>
              <SelectItem value="unsolved">Unsolved</SelectItem>
              <SelectItem value="solved">Solved</SelectItem>
              <SelectItem value="attempted">Attempted</SelectItem>
            </SelectContent>
          </Select>

          {/* Platform */}
          <Select value={selectedPlatform} onValueChange={setSelectedPlatform}>
            <SelectTrigger className="w-[140px] bg-card border-border text-foreground">
              <SelectValue placeholder="Platform" />
            </SelectTrigger>
            <SelectContent className="bg-card border-border">
              <SelectItem value="all">Platform: All</SelectItem>
              <SelectItem value="leetcode">LeetCode</SelectItem>
              <SelectItem value="codeforces">Codeforces</SelectItem>
              <SelectItem value="custom">Custom</SelectItem>
            </SelectContent>
          </Select>

          <Button
            variant="ghost"
            size="sm"
            className="text-blue-500 hover:text-blue-400 hover:bg-blue-500/10"
            onClick={clearAllFilters}
          >
            Clear All
          </Button>

          <div className="ml-auto flex items-center gap-2">
            <span className="text-sm text-muted-foreground">Sort by:</span>
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-[130px] bg-card border-border text-foreground">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-card border-border">
                <SelectItem value="difficulty">Difficulty</SelectItem>
                <SelectItem value="acceptanceRate">Acceptance</SelectItem>
                <SelectItem value="title">Title</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Active Filters */}
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-sm text-muted-foreground">Active:</span>
          {selectedStatus !== 'all' && (
            <Badge className="bg-blue-600/20 text-blue-400 border-0">
              {selectedStatus.charAt(0).toUpperCase() + selectedStatus.slice(1)}
            </Badge>
          )}
          {selectedTopics.map((topic) => (
            <Badge 
              key={topic} 
              className="bg-blue-600/20 text-blue-400 border-0 cursor-pointer hover:bg-blue-600/30"
              onClick={() => toggleTopic(topic)}
            >
              {topic} ×
            </Badge>
          ))}
          {meta && (
            <span className="text-sm text-muted-foreground ml-2">
              Showing {((meta.page - 1) * meta.limit) + 1} to {Math.min(meta.page * meta.limit, meta.total)} of {meta.total} problems
            </span>
          )}
        </div>

        {isLoading ? (
          <Loading size="lg" label="Loading problems..." />
        ) : problems.length === 0 ? (
          <EmptyState
            title="No problems found"
            description="Try adjusting your filters to see more problems"
          />
        ) : (
          <>
        {/* Problems List */}
        <div className="space-y-3">
              {problems.map((problem) => {
                if (!problem || !problem.id) return null;
                
                const StatusIcon = problem.userStatus && statusIcons[problem.userStatus] 
                  ? statusIcons[problem.userStatus] 
                  : statusIcons.unsolved;
                const statusColor = problem.userStatus && statusColors[problem.userStatus]
                  ? statusColors[problem.userStatus]
                  : statusColors.unsolved;
                
                const difficultyColor = problem.difficulty && difficultyColors[problem.difficulty]
                  ? difficultyColors[problem.difficulty]
                  : '';
                
                return (
                  <Link
                    key={problem.id}
                    href={`/problems/${problem.slug || problem.id}`}
                    className="flex items-center gap-4 p-4 bg-card border border-border rounded-lg hover:border-primary/50 transition-colors group cursor-pointer"
                  >
                    {/* Status Icon */}
                    <div className="flex items-center justify-center">
                      <StatusIcon className={`w-5 h-5 ${statusColor}`} />
                    </div>

                    {/* Problem Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="text-foreground font-medium group-hover:text-primary">
                          {problem.title || 'Untitled Problem'}
                        </h3>
                        {problem.difficulty && (
                          <Badge variant="outline" className={`text-xs ${difficultyColor}`}>
                            {problem.difficulty}
                          </Badge>
                        )}
                        {problem.isDailyQuestion && (
                          <Badge className="bg-purple-500/20 text-purple-400 border-0 text-xs">
                            Daily
                          </Badge>
                        )}
                      </div>
                      <div className="flex items-center gap-2 flex-wrap">
                        {Array.isArray(problem.topics) && problem.topics.length > 0 && problem.topics.slice(0, 3).map((topic) => (
                          <Badge key={topic} className="bg-blue-600/20 text-blue-400 border-0 text-xs">
                            {topic}
                          </Badge>
                        ))}
                        {Array.isArray(problem.topics) && problem.topics.length > 3 && (
                          <span className="text-xs text-muted-foreground">+{problem.topics.length - 3} more</span>
                        )}
                      </div>
                    </div>

                    {/* Platform & Acceptance */}
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <span className="text-yellow-500">⚡</span>
                        <span>{problem.platform || 'Unknown'}</span>
                        {problem.acceptanceRate !== null && problem.acceptanceRate !== undefined && !isNaN(problem.acceptanceRate) && (
                          <span className="ml-2">{problem.acceptanceRate.toFixed(1)}%</span>
                        )}
                      </div>
                    </div>

                    {/* Action Button */}
                    {problem.problemLink && (
                      <Button
                        size="sm"
                        className="bg-primary hover:bg-primary/90 text-primary-foreground"
                        onClick={(e) => {
                          e.stopPropagation();
                          e.preventDefault();
                          window.open(problem.problemLink, '_blank');
                        }}
                      >
                        {problem.userStatus === 'attempted' ? 'Resume' : problem.userStatus === 'solved' ? 'View' : 'Solve'}
                      </Button>
                    )}
                  </Link>
                );
              })}
            </div>

            {/* Pagination */}
            {meta && meta.totalPages > 1 && (
              <div className="flex justify-center pt-6">
                <Pagination
                  page={meta.page}
                  pageCount={meta.totalPages}
                  onPageChange={setPage}
                />
        </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

