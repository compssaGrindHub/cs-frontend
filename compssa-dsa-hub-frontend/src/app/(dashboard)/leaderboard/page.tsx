'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useAuthStore } from '@/lib/stores/authStore';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  Search, 
  Flame, 
  Trophy,
  Download,
  ChevronLeft,
  ChevronRight,
  Medal
} from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Loading } from '@/components/common/Loading';
import { EmptyState } from '@/components/common/EmptyState';
import { getGlobalLeaderboard } from '@/lib/api/leaderboard';

const mockLeaderboard = [
  {
    rank: 1,
    username: 'algo_master_99',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=algo_master_99',
    badge: 'Grandmaster • CF 2900+',
    rating: 2845,
    contests: 142,
    problems: 1204,
    streak: 342,
    isCurrentUser: false,
  },
  {
    rank: 2,
    username: 'tourist_fan',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=tourist_fan',
    badge: '🇮🇳',
    rating: 2790,
    contests: 115,
    problems: 985,
    streak: 128,
    isCurrentUser: false,
  },
  {
    rank: 3,
    username: 'cpp_wizard',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=cpp_wizard',
    badge: '🇨🇳',
    rating: 2755,
    contests: 98,
    problems: 876,
    streak: 45,
    isCurrentUser: false,
  },
  {
    rank: 4,
    username: 'sarah_codes',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=sarah_codes',
    badge: '🇺🇸',
    rating: 2620,
    contests: 84,
    problems: 750,
    streak: 12,
    isCurrentUser: false,
  },
  {
    rank: 5,
    username: 'jscript_ninja',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=jscript_ninja',
    badge: '',
    rating: 2580,
    contests: 156,
    problems: 1020,
    streak: 3,
    isCurrentUser: false,
  },
  {
    rank: 42,
    username: 'AlexDev',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=AlexDev',
    badge: '+18 this week • Python & C++',
    badgeVariant: 'blue',
    rating: 1450,
    contests: 23,
    problems: 125,
    streak: 7,
    isCurrentUser: true,
  },
];

const getRankIcon = (rank: number) => {
  if (rank === 1) return <Trophy className="w-5 h-5 text-yellow-500" />;
  if (rank === 2) return <Medal className="w-5 h-5 text-gray-400" />;
  if (rank === 3) return <Medal className="w-5 h-5 text-amber-700" />;
  return null;
};

export default function LeaderboardPage() {
  const { user: currentUser, isAuthenticated } = useAuthStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [timeFilter, setTimeFilter] = useState<'all-time' | 'monthly' | 'weekly'>('all-time');
  const [topicFilter, setTopicFilter] = useState('all');
  const [page, setPage] = useState(1);
  const limit = 20;

  // Fetch leaderboard data
  const { data: leaderboardData, isLoading, error: leaderboardError } = useQuery({
    queryKey: ['globalLeaderboard', timeFilter, topicFilter, page],
    queryFn: async () => {
      if (typeof window !== 'undefined' && process.env.NODE_ENV === 'development') {
        console.log('[Leaderboard] Fetching leaderboard with params:', {
          page,
          limit,
          timeframe: timeFilter,
          topic: topicFilter !== 'all' ? topicFilter : undefined,
        });
      }
      const result = await getGlobalLeaderboard({
        page,
        limit,
        timeframe: timeFilter,
        topic: topicFilter !== 'all' ? topicFilter : undefined,
      });
      if (typeof window !== 'undefined' && process.env.NODE_ENV === 'development') {
        console.log('[Leaderboard] API response:', result);
      }
      return result;
    },
    enabled: isAuthenticated,
    retry: 1,
    refetchOnWindowFocus: false,
  });

  // Log errors in development
  if (typeof window !== 'undefined' && process.env.NODE_ENV === 'development' && leaderboardError) {
    console.error('[Leaderboard] Error fetching leaderboard:', leaderboardError);
  }

  // Extract leaderboard data - API returns { success: true, data: LeaderboardEntry[], meta: {...} }
  // So data is directly an array, not nested
  const leaderboard = Array.isArray(leaderboardData?.data) ? leaderboardData.data : [];
  const meta = leaderboardData?.meta;

  // Filter by search query
  const filteredLeaderboard = searchQuery
    ? leaderboard.filter((entry) =>
        entry.user.username.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : leaderboard;

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background p-6">
        <Loading size="lg" label="Loading leaderboard..." />
      </div>
    );
  }

  // Show error state if API call failed
  if (leaderboardError && leaderboard.length === 0) {
    return (
      <div className="min-h-screen bg-background p-6">
        <EmptyState 
          title="Failed to load leaderboard" 
          description="There was an error loading the leaderboard data. Please try refreshing the page." 
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground mb-1">Leaderboard</h1>
            <p className="text-sm text-muted-foreground">Track how you rank against the community in real time.</p>
          </div>
          <div className="relative w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search user"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full h-10 pl-10 pr-4 bg-card border border-border rounded-lg text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
            />
          </div>
        </div>

        {/* Filters */}
        <div className="flex items-center justify-between">
          <Tabs value={timeFilter} onValueChange={(value) => setTimeFilter(value as 'all-time' | 'monthly' | 'weekly')}>
            <TabsList className="bg-card border border-border">
              <TabsTrigger 
                value="all-time"
                className="data-[state=active]:bg-white data-[state=active]:text-black"
              >
                All Time
              </TabsTrigger>
              <TabsTrigger 
                value="monthly"
                className="data-[state=active]:bg-white data-[state=active]:text-black"
              >
                This Month
              </TabsTrigger>
              <TabsTrigger 
                value="weekly"
                className="data-[state=active]:bg-white data-[state=active]:text-black"
              >
                This Week
              </TabsTrigger>
            </TabsList>
          </Tabs>

          <div className="flex items-center gap-2">
            <Select value={topicFilter} onValueChange={setTopicFilter}>
              <SelectTrigger className="w-[140px] bg-card border-border text-foreground">
                <SelectValue placeholder="All topics" />
              </SelectTrigger>
              <SelectContent className="bg-card border-border">
                <SelectItem value="all">All topics</SelectItem>
                <SelectItem value="arrays">Arrays</SelectItem>
                <SelectItem value="dp">Dynamic Programming</SelectItem>
                <SelectItem value="graphs">Graphs</SelectItem>
              </SelectContent>
            </Select>

            <Button variant="outline" className="border-border text-foreground hover:bg-foreground/5">
              <Download className="w-4 h-4 mr-2" />
              Export
            </Button>
          </div>
        </div>

        {/* Leaderboard Table */}
        {filteredLeaderboard.length > 0 ? (
          <div className="bg-card border border-border rounded-lg overflow-hidden">
            {/* Table Header */}
            <div className="grid grid-cols-12 gap-4 px-6 py-4 border-b border-border text-xs font-medium text-muted-foreground uppercase">
              <div className="col-span-1">Rank</div>
              <div className="col-span-4">User</div>
              <div className="col-span-2">Rating</div>
              <div className="col-span-2">Contests</div>
              <div className="col-span-2">Problems</div>
              <div className="col-span-1">Streak</div>
            </div>

            {/* Table Body */}
            <div className="divide-y divide-border/50">
              {filteredLeaderboard.map((entry) => {
                const isCurrentUser = entry.user.id === currentUser?.id;
                return (
                  <div
                    key={entry.rank}
                    className={`grid grid-cols-12 gap-4 px-6 py-4 hover:bg-foreground/5 transition-colors ${
                      isCurrentUser ? 'bg-primary/10 border-l-4 border-l-primary' : ''
                    }`}
                  >
                    {/* Rank */}
                    <div className="col-span-1 flex items-center gap-2">
                      <div className="flex items-center gap-2">
                        {getRankIcon(entry.rank)}
                        <span className={`font-medium ${entry.rank <= 3 ? 'text-foreground' : 'text-muted-foreground'}`}>
                          {isCurrentUser ? `#${entry.rank}` : entry.rank}
                        </span>
                      </div>
                    </div>

                    {/* User */}
                    <div className="col-span-4 flex items-center gap-3">
                      <Avatar className="w-10 h-10 border border-white/10">
                        <AvatarImage src={entry.user.profilePicture || undefined} alt={entry.user.username} />
                        <AvatarFallback className="bg-blue-600 text-white">
                          {entry.user.username[0].toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-foreground font-medium">{entry.user.username}</span>
                          {isCurrentUser && (
                            <Badge className="bg-blue-600/20 text-blue-400 border-0 text-xs">
                              You
                            </Badge>
                          )}
                        </div>
                        {entry.rankChange && entry.rankChange !== 0 && (
                          <p className={`text-xs mt-0.5 ${
                            entry.rankChange < 0 ? 'text-green-400' : 'text-red-400'
                          }`}>
                            {entry.rankChange > 0 ? '+' : ''}{entry.rankChange} this week
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Rating */}
                    <div className="col-span-2 flex items-center">
                      <span className="text-foreground font-semibold">{entry.rating.toLocaleString()}</span>
                    </div>

                    {/* Contests */}
                    <div className="col-span-2 flex items-center">
                      <span className="text-foreground/80">{entry.contestsParticipated}</span>
                    </div>

                    {/* Problems */}
                    <div className="col-span-2 flex items-center">
                      <span className="text-foreground/80">{entry.problemsSolved.toLocaleString()}</span>
                    </div>

                    {/* Streak */}
                    <div className="col-span-1 flex items-center gap-1.5">
                      <Flame className={`w-4 h-4 ${
                        entry.currentStreak >= 100 ? 'text-orange-500' : 
                        entry.currentStreak >= 30 ? 'text-yellow-500' : 
                        'text-orange-400'
                      }`} />
                      <span className={`font-medium ${
                        entry.currentStreak >= 100 ? 'text-orange-500' : 
                        entry.currentStreak >= 30 ? 'text-yellow-500' : 
                        'text-orange-400'
                      }`}>
                        {entry.currentStreak}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ) : (
          <EmptyState 
            title="No users found"
            description={searchQuery ? "Try adjusting your search query." : "No leaderboard data available."}
          />
        )}

        {/* Pagination */}
        {meta && (
          <div className="flex items-center justify-between text-sm">
            <p className="text-muted-foreground">
              Showing {(page - 1) * limit + 1}-{Math.min(page * limit, meta.total)} of {meta.total} users
            </p>
            
            <div className="flex items-center gap-2">
              <Button 
                variant="ghost" 
                size="icon"
                className="w-8 h-8 text-gray-400 hover:text-white hover:bg-white/5"
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={!meta.hasPrevPage}
              >
                <ChevronLeft className="w-4 h-4" />
              </Button>
              
              {Array.from({ length: Math.min(5, meta.totalPages) }, (_, i) => {
                let pageNum;
                if (meta.totalPages <= 5) {
                  pageNum = i + 1;
                } else if (page <= 3) {
                  pageNum = i + 1;
                } else if (page >= meta.totalPages - 2) {
                  pageNum = meta.totalPages - 4 + i;
                } else {
                  pageNum = page - 2 + i;
                }
                
                return (
                  <Button
                    key={pageNum}
                    className={`w-8 h-8 p-0 ${
                      pageNum === page
                        ? 'bg-primary hover:bg-primary/90 text-primary-foreground'
                        : 'text-gray-400 hover:text-white hover:bg-white/5'
                    }`}
                    variant={pageNum === page ? 'default' : 'ghost'}
                    onClick={() => setPage(pageNum)}
                  >
                    {pageNum}
                  </Button>
                );
              })}
              
              <Button 
                variant="ghost" 
                size="icon"
                className="w-8 h-8 text-gray-400 hover:text-white hover:bg-white/5"
                onClick={() => setPage(p => Math.min(meta.totalPages, p + 1))}
                disabled={!meta.hasNextPage}
              >
                <ChevronRight className="w-4 h-4" />
              </Button>

              {currentUser && meta.userRank && (
                <Button 
                  variant="outline" 
                  className="ml-4 border-border text-foreground hover:bg-foreground/5"
                  onClick={() => setPage(Math.ceil(meta.userRank! / limit))}
                >
                  Jump to my position
                </Button>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

