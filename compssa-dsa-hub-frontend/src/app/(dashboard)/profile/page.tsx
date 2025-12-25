'use client';

import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  Share2, 
  Edit3, 
  Flame, 
  Trophy,
  Code2,
  CheckCircle2,
  MapPin,
  Calendar,
  Target,
  Zap,
  Users,
  MessageSquare,
  Eye
} from 'lucide-react';

// GitHub-style contribution data (52 weeks x 7 days)
const generateContributionData = () => {
  const data = [];
  for (let week = 0; week < 52; week++) {
    for (let day = 0; day < 7; day++) {
      // Random activity level for demo
      const level = Math.floor(Math.random() * 5); // 0-4 for different intensity levels
      data.push({
        week,
        day,
        count: level > 0 ? Math.floor(Math.random() * 10) + level * 2 : 0,
        level, // 0 = no activity, 1-4 = different intensities
      });
    }
  }
  return data;
};

const getContributionColor = (level: number) => {
  const colors = {
    0: 'bg-muted border-border/60',
    1: 'bg-emerald-100 dark:bg-emerald-900/50 border-emerald-200 dark:border-emerald-800/60',
    2: 'bg-emerald-200 dark:bg-emerald-800/80 border-emerald-300 dark:border-emerald-700/80',
    3: 'bg-emerald-300 dark:bg-emerald-700 border-emerald-400 dark:border-emerald-600',
    4: 'bg-emerald-400 dark:bg-emerald-600 border-emerald-500 dark:border-emerald-500',
  };
  return colors[level as keyof typeof colors];
};

const mockProfile = {
  username: 'AlexDev',
  name: 'Alexander Mitchell',
  avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=AlexDev',
  location: 'San Francisco, CA',
  joinedDate: 'Jan 2024',
  rating: 1450,
  globalRank: 42,
  nextRank: 'Master',
  problemsSolved: 125,
  contests: 23,
  streak: 7,
  percentile: 5,
};

const achievements = [
  { id: 1, name: 'Champion', icon: '🏆', earned: true },
  { id: 2, name: '30 Day Streak', icon: '🔥', earned: true },
  { id: 3, name: '100 Solved', icon: '✓', earned: true },
  { id: 4, name: 'Speedster', icon: '⚡', earned: true },
  { id: 5, name: 'Graph Guru', icon: '📊', earned: false },
  { id: 6, name: 'Coding King', icon: '👑', earned: false },
];

const recentActivities = [
  {
    id: 1,
    type: 'solved',
    title: 'Solved Binary Tree Maximum Path Sum',
    subtitle: 'Hard • Python',
    time: '2 hours ago',
    icon: CheckCircle2,
    color: 'text-green-500 bg-green-500/10',
  },
  {
    id: 2,
    type: 'contest',
    title: 'Ranked #142 in Weekly Contest 382',
    subtitle: 'Score: 3456 • +15 Rating',
    time: 'Yesterday',
    icon: Trophy,
    color: 'text-blue-500 bg-blue-500/10',
  },
  {
    id: 3,
    type: 'achievement',
    title: 'Unlocked 30 Day Streak badge',
    subtitle: 'Consistency is key!',
    time: '2 days ago',
    icon: Flame,
    color: 'text-orange-500 bg-orange-500/10',
  },
  {
    id: 4,
    type: 'failed',
    title: 'Failed Merge k Sorted Lists',
    subtitle: 'Hard • Time Limit Exceeded',
    time: '3 days ago',
    icon: Zap,
    color: 'text-red-500 bg-red-500/10',
  },
];

const topicStrength = [
  { name: 'Arrays & Hashing', solved: 32, total: 45, color: 'bg-gradient-to-r from-green-600 to-blue-600' },
  { name: 'Dynamic Programming', solved: 15, total: 50, color: 'bg-gradient-to-r from-orange-600 to-red-600' },
  { name: 'Trees & Graphs', solved: 28, total: 40, color: 'bg-gradient-to-r from-blue-600 to-cyan-600' },
  { name: 'Greedy', solved: 12, total: 25, color: 'bg-gradient-to-r from-orange-500 to-yellow-500' },
];

const languages = [
  { name: 'Python 3', solved: 185 },
  { name: 'JavaScript', solved: 42 },
  { name: 'C++', solved: 12 },
];

export default function ProfilePage() {
  const contributionData = generateContributionData();

  return (
    <div className="min-h-screen bg-background text-foreground p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Profile Header */}
        <Card className="bg-card border-border overflow-hidden shadow-sm">
          <CardContent className="p-8">
            <div className="flex items-start justify-between mb-6">
              <div className="flex items-start gap-6">
                <Avatar className="w-24 h-24 border-2 border-primary">
                  <AvatarImage src={mockProfile.avatar} alt={mockProfile.name} />
                  <AvatarFallback className="bg-primary text-primary-foreground text-2xl">
                    {mockProfile.name[0]}
                  </AvatarFallback>
                </Avatar>

                <div className="pt-2">
                  <h1 className="text-3xl font-bold text-foreground mb-1">{mockProfile.name}</h1>
                  <div className="flex items-center gap-2 text-muted-foreground text-sm mb-3">
                    <span>@{mockProfile.username}</span>
                    <span>•</span>
                    <MapPin className="w-4 h-4" />
                    <span>{mockProfile.location}</span>
                    <span>•</span>
                    <Calendar className="w-4 h-4" />
                    <span>Joined {mockProfile.joinedDate}</span>
                  </div>

                  <div className="flex items-center gap-6 pt-2">
                    <div className="flex items-baseline gap-2">
                      <span className="text-2xl font-bold text-foreground">{mockProfile.rating.toLocaleString()}</span>
                      <span className="text-xs text-muted-foreground">Global Rating</span>
                    </div>
                    <div className="flex items-baseline gap-2">
                      <span className="text-2xl font-bold text-foreground">#{mockProfile.globalRank}</span>
                      <span className="text-xs text-muted-foreground">Global Rank</span>
                    </div>
                  </div>

                  <Badge className="bg-primary/10 text-primary border-0 mt-3">
                    Next Rank: {mockProfile.nextRank}
                  </Badge>
                </div>
              </div>

              <div className="flex gap-2">
                <Button variant="outline" className="border-border text-foreground hover:bg-muted">
                  <Share2 className="w-4 h-4 mr-2" />
                  Share
                </Button>
                <Button className="bg-primary hover:bg-primary/90 text-primary-foreground shadow-sm">
                  <Edit3 className="w-4 h-4 mr-2" />
                  Edit Profile
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card className="bg-card border-border shadow-sm">
            <CardContent className="p-6 text-center">
              <p className="text-muted-foreground text-sm mb-2">Problems Solved</p>
              <p className="text-3xl font-bold text-foreground">{mockProfile.problemsSolved}</p>
            </CardContent>
          </Card>

          <Card className="bg-card border-border shadow-sm">
            <CardContent className="p-6 text-center">
              <p className="text-muted-foreground text-sm mb-2">Contests</p>
              <p className="text-3xl font-bold text-foreground">{mockProfile.contests}</p>
            </CardContent>
          </Card>

          <Card className="bg-card border-border shadow-sm">
            <CardContent className="p-6 text-center">
              <p className="text-muted-foreground text-sm mb-2">Current Streak</p>
              <div className="flex items-baseline justify-center gap-1">
                <Flame className="w-6 h-6 text-orange-500" />
                <p className="text-3xl font-bold text-foreground">{mockProfile.streak}</p>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-card border-border shadow-sm">
            <CardContent className="p-6 text-center">
              <p className="text-muted-foreground text-sm mb-2">Percentile</p>
              <p className="text-3xl font-bold text-green-500">Top {mockProfile.percentile}%</p>
            </CardContent>
          </Card>
        </div>

        {/* Contribution Graph */}
        <Card className="bg-card border-border shadow-sm">
          <CardContent className="p-6">
            <h2 className="text-lg font-semibold text-foreground mb-4">Activity</h2>
            <p className="text-xs text-muted-foreground mb-4">548 submissions in the last year</p>
            
            {/* Contribution Graph */}
            <div className="overflow-x-auto">
              <div className="flex gap-1 pb-4">
                {/* Weeks */}
                {Array.from({ length: 52 }).map((_, weekIdx) => (
                  <div key={weekIdx} className="flex flex-col gap-1">
                    {/* Days in week */}
                    {Array.from({ length: 7 }).map((_, dayIdx) => {
                      const contribution = contributionData[weekIdx * 7 + dayIdx];
                      return (
                        <div
                          key={`${weekIdx}-${dayIdx}`}
                          title={`${contribution?.count || 0} submissions`}
                          className={`w-3 h-3 rounded-sm border ${getContributionColor(contribution?.level || 0)} cursor-pointer hover:ring-2 hover:ring-primary/30 transition-all`}
                        />
                      );
                    })}
                  </div>
                ))}
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 text-xs text-muted-foreground mt-4 pt-4 border-t border-border">
              <span>Less</span>
              {[0, 1, 2, 3, 4].map((level) => (
                <div key={level} className={`w-3 h-3 rounded-sm ${getContributionColor(level)}`} />
              ))}
              <span>More</span>
            </div>
          </CardContent>
        </Card>

        {/* Achievements */}
        <Card className="bg-card border-border shadow-sm">
          <CardContent className="p-6">
            <h2 className="text-lg font-semibold text-foreground mb-4">Achievements</h2>
            <div className="grid grid-cols-3 md:grid-cols-6 gap-4">
              {achievements.map((achievement) => (
                <div key={achievement.id} className="flex flex-col items-center gap-2">
                  <div className={`w-12 h-12 rounded-full border-2 flex items-center justify-center text-xl ${
                    achievement.earned 
                      ? 'border-yellow-500/50 bg-yellow-500/10' 
                      : 'border-border bg-muted'
                  }`}>
                    {achievement.icon}
                  </div>
                  <p className={`text-xs text-center ${achievement.earned ? 'text-foreground' : 'text-muted-foreground'}`}>
                    {achievement.name}
                  </p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Recent Activity */}
          <Card className="bg-card border-border shadow-sm">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-foreground">Recent Activity</h2>
                <Button variant="link" className="text-primary p-0 h-auto text-sm">
                  View All
                </Button>
              </div>
              
              <div className="space-y-3">
                {recentActivities.map((activity) => {
                  const Icon = activity.icon;
                  return (
                    <div key={activity.id} className="flex gap-3 pb-3 border-b border-border last:border-0 last:pb-0">
                      <div className={`w-8 h-8 rounded-lg ${activity.color} flex items-center justify-center flex-shrink-0`}>
                        <Icon className="w-4 h-4" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-foreground">{activity.title}</p>
                        <p className="text-xs text-muted-foreground">{activity.subtitle}</p>
                        <p className="text-xs text-muted-foreground mt-1">{activity.time}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          {/* Topic Strength & Languages */}
          <div className="space-y-6">
            <Card className="bg-card border-border shadow-sm">
              <CardContent className="p-6">
                <h2 className="text-lg font-semibold text-foreground mb-4">Topic Strength</h2>
                <div className="space-y-4">
                  {topicStrength.map((topic) => (
                    <div key={topic.name}>
                      <div className="flex items-center justify-between mb-2">
                        <p className="text-sm text-foreground">{topic.name}</p>
                        <span className="text-xs text-muted-foreground">{topic.solved}/{topic.total}</span>
                      </div>
                      <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
                        <div
                          className={`h-full ${topic.color}`}
                          style={{ width: `${(topic.solved / topic.total) * 100}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card className="bg-card border-border shadow-sm">
              <CardContent className="p-6">
                <h2 className="text-lg font-semibold text-foreground mb-4">Languages</h2>
                <div className="space-y-3">
                  {languages.map((lang) => (
                    <div key={lang.name} className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-blue-500" />
                        <span className="text-sm text-foreground">{lang.name}</span>
                      </div>
                      <span className="text-sm font-medium text-foreground">{lang.solved} solved</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Community */}
        <Card className="bg-card border-border shadow-sm">
          <CardContent className="p-6">
            <h2 className="text-lg font-semibold text-foreground mb-4">Community</h2>
            <div className="grid grid-cols-3 gap-6 text-center">
              <div>
                <div className="text-2xl font-bold text-foreground mb-1">4,285</div>
                <p className="text-xs text-muted-foreground">Reputation</p>
              </div>
              <div>
                <div className="text-2xl font-bold text-foreground mb-1">47</div>
                <p className="text-xs text-muted-foreground">Solutions Posted</p>
              </div>
              <div>
                <div className="text-2xl font-bold text-foreground mb-1">12.5k</div>
                <p className="text-xs text-muted-foreground">Views</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

