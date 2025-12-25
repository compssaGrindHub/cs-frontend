'use client';

import { useState } from 'react';
import { Search, List, LayoutGrid, ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';

const mockProblems = [
  {
    id: 1,
    title: 'Two Sum',
    difficulty: 'Easy',
    topics: ['Arrays', 'Hash Table'],
    platform: 'LeetCode',
    acceptanceRate: 48.2,
    status: 'unsolved',
  },
  {
    id: 2,
    title: 'Longest Substring Without Repeating Characters',
    difficulty: 'Medium',
    topics: ['Strings', 'Sliding Window'],
    platform: 'LeetCode',
    acceptanceRate: 34.1,
    status: 'attempted',
  },
  {
    id: 3,
    title: 'Merge K Sorted Lists',
    difficulty: 'Hard',
    topics: ['Heaps', 'Linked List'],
    platform: 'LeetCode',
    acceptanceRate: 28.5,
    status: 'unsolved',
  },
  {
    id: 4,
    title: 'Watermelon',
    difficulty: 'Easy',
    topics: ['Math', 'Brute Force'],
    platform: 'Codeforces',
    acceptanceRate: 51.3,
    status: 'unsolved',
  },
  {
    id: 5,
    title: 'Coin Change',
    difficulty: 'Medium',
    topics: ['DP', 'BFS'],
    platform: 'LeetCode',
    acceptanceRate: 42.1,
    status: 'unsolved',
  },
  {
    id: 6,
    title: 'House Robber II',
    difficulty: 'Medium',
    topics: ['DP', 'Arrays'],
    platform: 'LeetCode',
    acceptanceRate: 39.8,
    status: 'unsolved',
  },
];

const difficultyColors = {
  Easy: 'text-green-500 bg-green-500/10 border-green-500/30',
  Medium: 'text-yellow-500 bg-yellow-500/10 border-yellow-500/30',
  Hard: 'text-red-500 bg-red-500/10 border-red-500/30',
};

export default function ProblemsPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('list');
  const [selectedDifficulty, setSelectedDifficulty] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('unsolved');
  const [selectedPlatform, setSelectedPlatform] = useState('all');
  const [selectedTopics, setSelectedTopics] = useState<string[]>(['Arrays', 'Dynamic Programming']);
  const [sortBy, setSortBy] = useState('difficulty');

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
  };

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
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search problems by title, topic, or ID..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full h-12 pl-12 pr-4 bg-card border border-border rounded-lg text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
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

          {/* Topic */}
          <Select>
            <SelectTrigger className="w-[180px] bg-card border-border text-foreground">
              <SelectValue placeholder="Topic: Arrays, DP" />
            </SelectTrigger>
            <SelectContent className="bg-card border-border">
              <SelectItem value="arrays">Arrays</SelectItem>
              <SelectItem value="dp">Dynamic Programming</SelectItem>
              <SelectItem value="graphs">Graphs</SelectItem>
              <SelectItem value="strings">Strings</SelectItem>
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
                <SelectItem value="acceptance">Acceptance</SelectItem>
                <SelectItem value="title">Title</SelectItem>
                <SelectItem value="recent">Recent</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Active Filters */}
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">Active:</span>
          {selectedStatus !== 'all' && (
            <Badge className="bg-blue-600/20 text-blue-400 border-0">
              Unsolved <span className="ml-1 text-xs">3</span>
            </Badge>
          )}
          {selectedTopics.includes('Arrays') && (
            <Badge className="bg-blue-600/20 text-blue-400 border-0">
              Arrays <span className="ml-1 text-xs">2</span>
            </Badge>
          )}
          {selectedTopics.includes('Dynamic Programming') && (
            <Badge className="bg-blue-600/20 text-blue-400 border-0">
              Dynamic Programming <span className="ml-1 text-xs">2</span>
            </Badge>
          )}
          <span className="text-sm text-muted-foreground ml-2">Showing 24 of 542 problems</span>
        </div>

        {/* Problems List */}
        <div className="space-y-3">
          {mockProblems.map((problem) => (
            <div
              key={problem.id}
              className="flex items-center gap-4 p-4 bg-card border border-border rounded-lg hover:border-border transition-colors group"
            >
              {/* Checkbox */}
              <div className="flex items-center justify-center">
                <div className="w-5 h-5 rounded-full border-2 border-white/20 group-hover:border-white/40" />
              </div>

              {/* Problem Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-2">
                  <h3 className="text-foreground font-medium">{problem.title}</h3>
                  <Badge variant="outline" className={`text-xs ${difficultyColors[problem.difficulty as keyof typeof difficultyColors]}`}>
                    {problem.difficulty}
                  </Badge>
                </div>
                <div className="flex items-center gap-2">
                  {problem.topics.map((topic) => (
                    <Badge key={topic} className="bg-blue-600/20 text-blue-400 border-0 text-xs">
                      {topic}
                    </Badge>
                  ))}
                </div>
              </div>

              {/* Platform & Acceptance */}
              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                <div className="flex items-center gap-1">
                  <span className="text-yellow-500">⚡</span>
                  <span>{problem.platform}</span>
                  <span className="ml-2">{problem.acceptanceRate}%</span>
                </div>
              </div>

              {/* Action Button */}
              <Button
                size="sm"
                className={
                  problem.status === 'attempted'
                    ? 'bg-primary hover:bg-primary/90 text-primary-foreground'
                    : 'bg-primary hover:bg-primary/90 text-primary-foreground'
                }
              >
                {problem.status === 'attempted' ? 'Resume' : 'Solve'}
              </Button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

