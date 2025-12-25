'use client';

import { useState } from 'react';
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
  const [searchQuery, setSearchQuery] = useState('');
  const [timeFilter, setTimeFilter] = useState('all-time');
  const [topicFilter, setTopicFilter] = useState('all');

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
          <Tabs value={timeFilter} onValueChange={setTimeFilter}>
            <TabsList className="bg-card border border-border">
              <TabsTrigger 
                value="all-time"
                className="data-[state=active]:bg-white data-[state=active]:text-black"
              >
                All Time
              </TabsTrigger>
              <TabsTrigger 
                value="this-month"
                className="data-[state=active]:bg-white data-[state=active]:text-black"
              >
                This Month
              </TabsTrigger>
              <TabsTrigger 
                value="this-week"
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
            {mockLeaderboard.map((user) => (
              <div
                key={user.rank}
                className={`grid grid-cols-12 gap-4 px-6 py-4 hover:bg-foreground/5 transition-colors ${
                  user.isCurrentUser ? 'bg-primary/10 border-l-4 border-l-primary' : ''
                }`}
              >
                {/* Rank */}
                <div className="col-span-1 flex items-center gap-2">
                  <div className="flex items-center gap-2">
                    {getRankIcon(user.rank)}
                    <span className={`font-medium ${user.rank <= 3 ? 'text-foreground' : 'text-muted-foreground'}`}>
                      {user.isCurrentUser ? `#${user.rank}` : user.rank}
                    </span>
                  </div>
                </div>

                {/* User */}
                <div className="col-span-4 flex items-center gap-3">
                  <Avatar className="w-10 h-10 border border-white/10">
                    <AvatarImage src={user.avatar} alt={user.username} />
                    <AvatarFallback className="bg-blue-600 text-white">
                      {user.username[0].toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-foreground font-medium">{user.username}</span>
                      {user.isCurrentUser && (
                        <Badge className="bg-blue-600/20 text-blue-400 border-0 text-xs">
                          You
                        </Badge>
                      )}
                    </div>
                    {user.badge && (
                      <p className={`text-xs mt-0.5 ${
                        user.badgeVariant === 'blue' ? 'text-blue-400' : 'text-gray-400'
                      }`}>
                        {user.badge}
                      </p>
                    )}
                  </div>
                </div>

                {/* Rating */}
                <div className="col-span-2 flex items-center">
                  <span className="text-foreground font-semibold">{user.rating.toLocaleString()}</span>
                </div>

                {/* Contests */}
                <div className="col-span-2 flex items-center">
                  <span className="text-foreground/80">{user.contests}</span>
                </div>

                {/* Problems */}
                <div className="col-span-2 flex items-center">
                  <span className="text-foreground/80">{user.problems.toLocaleString()}</span>
                </div>

                {/* Streak */}
                <div className="col-span-1 flex items-center gap-1.5">
                  <Flame className={`w-4 h-4 ${
                    user.streak >= 100 ? 'text-orange-500' : 
                    user.streak >= 30 ? 'text-yellow-500' : 
                    'text-orange-400'
                  }`} />
                  <span className={`font-medium ${
                    user.streak >= 100 ? 'text-orange-500' : 
                    user.streak >= 30 ? 'text-yellow-500' : 
                    'text-orange-400'
                  }`}>
                    {user.streak}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Pagination */}
        <div className="flex items-center justify-between text-sm">
          <p className="text-muted-foreground">Showing 1-50 of 1,247 users</p>
          
          <div className="flex items-center gap-2">
            <Button 
              variant="ghost" 
              size="icon"
              className="w-8 h-8 text-gray-400 hover:text-white hover:bg-white/5"
            >
              <ChevronLeft className="w-4 h-4" />
            </Button>
            
            <Button className="w-8 h-8 bg-primary hover:bg-primary/90 text-primary-foreground p-0">
              1
            </Button>
            <Button variant="ghost" className="w-8 h-8 text-gray-400 hover:text-white hover:bg-white/5 p-0">
              2
            </Button>
            <Button variant="ghost" className="w-8 h-8 text-gray-400 hover:text-white hover:bg-white/5 p-0">
              3
            </Button>
            <span className="text-muted-foreground/50">...</span>
            <Button variant="ghost" className="w-8 h-8 text-gray-400 hover:text-white hover:bg-white/5 p-0">
              25
            </Button>
            
            <Button 
              variant="ghost" 
              size="icon"
              className="w-8 h-8 text-gray-400 hover:text-white hover:bg-white/5"
            >
              <ChevronRight className="w-4 h-4" />
            </Button>

            <Button 
              variant="outline" 
              className="ml-4 border-border text-foreground hover:bg-foreground/5"
            >
              Jump to my position
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

