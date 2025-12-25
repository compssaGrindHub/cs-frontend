'use client';

import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  CheckCircle2, 
  TrendingUp, 
  Flame, 
  Trophy,
  ArrowRight,
  Calendar,
  MapPin,
  Users,
  Code2,
  BarChart3,
  Clock
} from 'lucide-react';
import { Progress } from '@/components/ui/progress';

export default function DashboardPage() {
  // Mock user data
  const user = {
    globalRank: 42,
    totalUsers: 1247,
    rating: 1450,
    ratingChange: 115,
    problemsSolved: 125,
    totalProblems: 500,
    contestRating: 1450,
    topPercentage: 15,
    currentStreak: 7,
    achievements: 12,
    totalAchievements: 45,
    nextAchievement: "Graph Guru"
  };

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Top Stats Row */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Global Rank Card */}
            <Card className="bg-card border-border">
            <CardContent className="p-6">
              <div className="space-y-4">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Global Rank</p>
                  <div className="flex items-baseline gap-2">
                    <h2 className="text-3xl font-bold text-white">#{user.globalRank}</h2>
                    <span className="text-sm text-gray-400">of {user.totalUsers.toLocaleString()} users</span>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button className="flex-1 bg-blue-600 hover:bg-blue-700 text-white">
                    Start Daily Challenge
                  </Button>
                  <Button variant="outline" className="flex-1 border-white/10 text-white hover:bg-white/5">
                    View Profile
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Rating Card */}
            <Card className="bg-card border-border">
            <CardContent className="p-6">
              <div>
                <p className="text-sm text-gray-400 mb-1">Rating</p>
                <div className="flex items-baseline gap-2">
                  <h2 className="text-3xl font-bold text-white">{user.rating.toLocaleString()}</h2>
                  <Badge className="bg-green-500/20 text-green-500 hover:bg-green-500/20">
                    +{user.ratingChange}
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Daily Challenge Card */}
          <Card className="bg-gradient-to-br from-orange-500/20 to-orange-600/10 border-orange-500/20">
            <CardContent className="p-6">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <Badge className="bg-orange-500/20 text-orange-500 border-0 mb-2">
                      Daily Challenge
                    </Badge>
                    <p className="text-sm text-gray-400">Posted 4h ago</p>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold text-white">30</p>
                    <p className="text-xs text-gray-400">min est.</p>
                  </div>
                </div>
                <div>
                  <h3 className="text-white font-semibold mb-1">Merge K Sorted Lists</h3>
                  <div className="flex items-center gap-2 mb-3">
                    <Badge variant="outline" className="border-red-500/50 text-red-500 text-xs">Hard</Badge>
                    <Badge variant="outline" className="border-blue-500/50 text-blue-500 text-xs">Heaps</Badge>
                    <Badge variant="outline" className="border-blue-500/50 text-blue-500 text-xs">Linked List</Badge>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="flex -space-x-2">
                        <Avatar className="w-6 h-6 border-2 border-card">
                        <AvatarImage src="https://api.dicebear.com/7.x/avataaars/svg?seed=user1" />
                        <AvatarFallback>U1</AvatarFallback>
                      </Avatar>
                        <Avatar className="w-6 h-6 border-2 border-card">
                        <AvatarImage src="https://api.dicebear.com/7.x/avataaars/svg?seed=user2" />
                        <AvatarFallback>U2</AvatarFallback>
                      </Avatar>
                        <Avatar className="w-6 h-6 border-2 border-card">
                        <AvatarImage src="https://api.dicebear.com/7.x/avataaars/svg?seed=user3" />
                        <AvatarFallback>U3</AvatarFallback>
                      </Avatar>
                    </div>
                    <span className="text-xs text-gray-400">+124</span>
                    <Button size="sm" className="ml-auto bg-white text-black hover:bg-gray-200">
                        Solve Now <ArrowRight className="w-3 h-3 ml-1" />
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Problems */}
            <Card className="bg-card border-border">
            <CardContent className="p-6">
              <div className="flex items-start justify-between mb-3">
                <p className="text-sm text-gray-400">Problems</p>
                <CheckCircle2 className="w-5 h-5 text-green-500" />
              </div>
              <div className="space-y-2">
                <div className="flex items-baseline gap-2">
                  <h3 className="text-2xl font-bold text-white">{user.problemsSolved}</h3>
                  <span className="text-sm text-gray-400">/{user.totalProblems}</span>
                </div>
                <Progress value={(user.problemsSolved / user.totalProblems) * 100} className="h-2" />
              </div>
            </CardContent>
          </Card>

          {/* Contest Rating */}
            <Card className="bg-card border-border">
            <CardContent className="p-6">
              <div className="flex items-start justify-between mb-3">
                <p className="text-sm text-gray-400">Contest Rating</p>
                <BarChart3 className="w-5 h-5 text-blue-500" />
              </div>
              <div className="space-y-2">
                <h3 className="text-2xl font-bold text-white">{user.contestRating.toLocaleString()}</h3>
                <p className="text-sm text-green-500">↑ Top {user.topPercentage}%</p>
              </div>
            </CardContent>
          </Card>

          {/* Current Streak */}
            <Card className="bg-card border-border">
            <CardContent className="p-6">
              <div className="flex items-start justify-between mb-3">
                <p className="text-sm text-gray-400">Current Streak</p>
                <Flame className="w-5 h-5 text-orange-500" />
              </div>
              <div className="space-y-2">
                <h3 className="text-2xl font-bold text-white">{user.currentStreak} days</h3>
                <Progress value={70} className="h-2 bg-orange-900/20" />
              </div>
            </CardContent>
          </Card>

          {/* Achievements */}
            <Card className="bg-card border-border">
            <CardContent className="p-6">
              <div className="flex items-start justify-between mb-3">
                <p className="text-sm text-gray-400">Achievements</p>
                <Trophy className="w-5 h-5 text-purple-500" />
              </div>
              <div className="space-y-2">
                <div className="flex items-baseline gap-2">
                  <h3 className="text-2xl font-bold text-white">{user.achievements}</h3>
                  <span className="text-sm text-gray-400">/{user.totalAchievements}</span>
                </div>
                <p className="text-xs text-gray-400">Next: "{user.nextAchievement}"</p>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Recent Activity */}
            <Card className="bg-card border-border">
            <CardContent className="p-6">
              <div className="flex items-center gap-2 mb-4">
                <Clock className="w-5 h-5 text-blue-500" />
                <h2 className="text-lg font-semibold text-white">Recent Activity</h2>
              </div>
              <div className="space-y-4">
                {/* Activity Item 1 */}
                <div className="flex gap-3 pb-4 border-b border-white/5">
                  <div className="w-8 h-8 rounded-lg bg-green-500/20 flex items-center justify-center flex-shrink-0">
                    <CheckCircle2 className="w-4 h-4 text-green-500" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-white">Solved "Two Pointers #47"</p>
                    <p className="text-xs text-gray-400">Optimized solution to O(n) time complexity.</p>
                    <p className="text-xs text-gray-500 mt-1">2 hours ago</p>
                  </div>
                </div>

                {/* Activity Item 2 */}
                <div className="flex gap-3 pb-4 border-b border-white/5">
                  <div className="w-8 h-8 rounded-lg bg-orange-500/20 flex items-center justify-center flex-shrink-0">
                    <Trophy className="w-4 h-4 text-orange-500" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-white">Placed 3rd in Weekly Contest #23</p>
                    <p className="text-xs text-gray-400">Score: 3500 • Rank: 3/120</p>
                    <p className="text-xs text-gray-500 mt-1">Yesterday</p>
                  </div>
                </div>

                {/* Activity Item 3 */}
                <div className="flex gap-3">
                  <div className="w-8 h-8 rounded-lg bg-blue-500/20 flex items-center justify-center flex-shrink-0">
                    <Code2 className="w-4 h-4 text-blue-500" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-white">Started "Dynamic Programming" Study Plan</p>
                    <p className="text-xs text-gray-400">Completed 3/50 problems.</p>
                    <p className="text-xs text-gray-500 mt-1">2 days ago</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Upcoming Contests */}
            <Card className="bg-card border-border">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Trophy className="w-5 h-5 text-blue-500" />
                  <h2 className="text-lg font-semibold text-white">Upcoming Contests</h2>
                </div>
                <Button variant="link" className="text-blue-500 p-0 h-auto">
                  View Calendar
                </Button>
              </div>
              <div className="space-y-3">
                {/* Contest 1 */}
                <div className="p-4 rounded-lg bg-white/5 border border-white/5">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <div className="w-2 h-2 rounded-full bg-blue-500" />
                        <p className="text-sm font-medium text-white">Codeforces Round #928</p>
                      </div>
                      <p className="text-xs text-gray-400 ml-4">Div. 2</p>
                    </div>
                    <Button size="sm" variant="outline" className="border-white/10 text-white hover:bg-white/5 text-xs">
                      Register
                    </Button>
                  </div>
                  <div className="ml-4 space-y-1">
                    <p className="text-xs text-gray-400">Starts in 2 days</p>
                    <p className="text-xs text-gray-500">🏆 Weekly Contest 382</p>
                    <p className="text-xs text-gray-500">📍 LeetCode</p>
                    <p className="text-xs text-gray-500">⏰ Sunday 10:30 AM</p>
                  </div>
                </div>

                {/* Contest 2 */}
                <div className="p-4 rounded-lg bg-green-500/5 border border-green-500/20">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <CheckCircle2 className="w-4 h-4 text-green-500" />
                        <p className="text-sm font-medium text-white">CompSSA Internal</p>
                      </div>
                      <p className="text-xs text-gray-400 ml-6">Company Round</p>
                    </div>
                    <Badge className="bg-green-500/20 text-green-500 border-0 text-xs">
                      ✓ Registered
                    </Badge>
                  </div>
                  <div className="ml-6 space-y-1">
                    <p className="text-xs text-gray-500">📅 Oct 24, 5:00 PM</p>
                  </div>
                </div>

                {/* Contest 3 */}
                <div className="p-4 rounded-lg bg-white/5 border border-white/5">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <div className="w-2 h-2 rounded-full bg-purple-500" />
                        <p className="text-sm font-medium text-white">AtCoder Beginner Contest</p>
                      </div>
                    </div>
                    <Button size="sm" variant="outline" className="border-white/10 text-white hover:bg-white/5 text-xs">
                      Details
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Progress by Topic */}
          <Card className="bg-card border-border">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-semibold text-white">Progress by Topic</h2>
              <Button variant="link" className="text-blue-500 p-0 h-auto">
                View All
              </Button>
            </div>
            <div className="space-y-4">
              {/* Arrays & Hashing */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <p className="text-sm text-white">Arrays & Hashing</p>
                  <span className="text-sm text-gray-400">32/40</span>
                </div>
                <Progress value={80} className="h-2" />
              </div>

              {/* Dynamic Programming */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <p className="text-sm text-white">Dynamic Programming</p>
                  <span className="text-sm text-gray-400">8/30</span>
                </div>
                <Progress value={26.67} className="h-2" />
              </div>

              {/* Graphs */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <p className="text-sm text-white">Graphs</p>
                  <span className="text-sm text-gray-400">12/25</span>
                </div>
                <Progress value={48} className="h-2 bg-green-900/20" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

