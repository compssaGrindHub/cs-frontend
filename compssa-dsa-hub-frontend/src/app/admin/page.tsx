'use client';

import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, CalendarClock, Code2, Trophy, TrendingUp, UserCheck, BarChart3 } from 'lucide-react';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { getSystemOverview, getUserGrowth, getSubmissionsStats } from '@/lib/api';
import { Loading } from '@/components/common/Loading';
import { getProblems } from '@/lib/api';

export default function AdminDashboard() {
  const { data: overview, isLoading: overviewLoading } = useQuery({
    queryKey: ['admin', 'overview'],
    queryFn: getSystemOverview,
  });

  const { data: userGrowth, isLoading: growthLoading } = useQuery({
    queryKey: ['admin', 'userGrowth', 'month'],
    queryFn: () => getUserGrowth({ bucket: 'month' }),
  });

  const { data: submissionsStats, isLoading: submissionsLoading } = useQuery({
    queryKey: ['admin', 'submissions'],
    queryFn: () => getSubmissionsStats(),
  });

  const { data: problemsData, isLoading: problemsLoading } = useQuery({
    queryKey: ['problems'],
    queryFn: () => getProblems({ limit: 1000 }),
  });

  const isLoading = overviewLoading || growthLoading || submissionsLoading || problemsLoading;

  const stats = [
    { 
      title: 'Total Users', 
      value: overview?.users?.toString() || '0', 
      icon: Users, 
      change: '+12%', 
      trend: 'up',
      color: 'blue',
      bgClass: 'bg-blue-500/10 dark:bg-blue-500/20',
      iconClass: 'text-blue-500',
      borderClass: 'border-blue-500/20'
    },
    { 
      title: 'Active Sessions', 
      value: overview?.sessions?.toString() || '0', 
      icon: CalendarClock, 
      change: '+3', 
      trend: 'up',
      color: 'purple',
      bgClass: 'bg-purple-500/10 dark:bg-purple-500/20',
      iconClass: 'text-purple-500',
      borderClass: 'border-purple-500/20'
    },
    { 
      title: 'Total Problems', 
      value: overview?.problems?.toString() || '0', 
      icon: Code2, 
      change: '+18', 
      trend: 'up',
      color: 'emerald',
      bgClass: 'bg-emerald-500/10 dark:bg-emerald-500/20',
      iconClass: 'text-emerald-500',
      borderClass: 'border-emerald-500/20'
    },
    { 
      title: 'Contests', 
      value: overview?.contests?.toString() || '0', 
      icon: Trophy, 
      change: '0', 
      trend: 'neutral',
      color: 'yellow',
      bgClass: 'bg-yellow-500/10 dark:bg-yellow-500/20',
      iconClass: 'text-yellow-500',
      borderClass: 'border-yellow-500/20'
    },
    { 
      title: 'Avg. Attendance', 
      value: overview?.attendance?.toString() || '0', 
      icon: UserCheck, 
      change: '+5%', 
      trend: 'up',
      color: 'green',
      bgClass: 'bg-green-500/10 dark:bg-green-500/20',
      iconClass: 'text-green-500',
      borderClass: 'border-green-500/20'
    },
    { 
      title: 'Engagement Rate', 
      value: overview?.submissions?.toString() || '0', 
      icon: TrendingUp, 
      change: '+8%', 
      trend: 'up',
      color: 'orange',
      bgClass: 'bg-orange-500/10 dark:bg-orange-500/20',
      iconClass: 'text-orange-500',
      borderClass: 'border-orange-500/20'
    },
  ];

  const userGrowthData = userGrowth?.points.map((p) => ({
    month: p.key,
    users: p.count,
  })) || [];

  const submissionData = submissionsStats?.daily.map((d) => ({
    day: d.key,
    count: d.count,
  })) || [];

  const platformDistribution = (() => {
    const platforms: Record<string, number> = {};
    (problemsData?.data ?? []).forEach((p) => {
      const platform = p.platform || 'Other';
      platforms[platform] = (platforms[platform] || 0) + 1;
    });
    const colors: Record<string, string> = {
      'LEETCODE': '#FFA116',
      'CODEFORCES': '#1F8ACB',
      'ATCODER': '#000000',
      'CODECHEF': '#5B4638',
    };
    return Object.entries(platforms).map(([name, value]) => ({
      name,
      value,
      color: colors[name.toUpperCase()] || '#6b7280',
    }));
  })();

  const recentActivity: Array<{ user: string; action: string; target: string; time: string; type: string }> = [];

  if (isLoading) {
    return (
      <div className="space-y-8">
        <Loading size="lg" label="Loading dashboard..." />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-foreground">Admin Dashboard</h1>
        <p className="text-muted-foreground mt-1">
          Manage platform content, users, and view analytics
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <Card key={stat.title} className={`bg-card border shadow-sm ${stat.borderClass} overflow-hidden relative`}>
              <div className={`absolute top-0 right-0 w-32 h-32 ${stat.bgClass} rounded-full -mr-16 -mt-16 opacity-50`} />
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 relative">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  {stat.title}
                </CardTitle>
                <div className={`p-2 rounded-lg ${stat.bgClass}`}>
                  <Icon className={`h-4 w-4 ${stat.iconClass}`} />
                </div>
              </CardHeader>
              <CardContent className="relative">
                <div className="text-2xl font-bold text-foreground">{stat.value}</div>
                <p className={`text-xs mt-1 font-medium ${
                  stat.trend === 'up' ? 'text-green-500' : 
                  stat.trend === 'down' ? 'text-red-500' : 
                  'text-muted-foreground'
                }`}>
                  {stat.change} from last month
                </p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* User Growth Chart */}
        <Card className="bg-card border-border shadow-sm">
          <CardHeader>
            <CardTitle className="text-foreground flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-blue-500" />
              User Growth
            </CardTitle>
            <p className="text-sm text-muted-foreground">New user registrations over time</p>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={userGrowthData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis 
                  dataKey="month" 
                  stroke="hsl(var(--muted-foreground))"
                  style={{ fontSize: '12px' }}
                />
                <YAxis 
                  stroke="hsl(var(--muted-foreground))"
                  style={{ fontSize: '12px' }}
                />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'hsl(var(--card))',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '8px',
                    color: 'hsl(var(--foreground))'
                  }}
                />
                <Line 
                  type="monotone" 
                  dataKey="users" 
                  stroke="rgb(59 130 246)" 
                  strokeWidth={2}
                  dot={{ fill: 'rgb(59 130 246)', r: 4 }}
                  activeDot={{ r: 6 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Weekly Submissions */}
        <Card className="bg-card border-border shadow-sm">
          <CardHeader>
            <CardTitle className="text-foreground flex items-center gap-2">
              <Code2 className="w-5 h-5 text-emerald-500" />
              Weekly Submissions
            </CardTitle>
            <p className="text-sm text-muted-foreground">Problem submissions this week</p>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={submissionData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis 
                  dataKey="day" 
                  stroke="hsl(var(--muted-foreground))"
                  style={{ fontSize: '12px' }}
                />
                <YAxis 
                  stroke="hsl(var(--muted-foreground))"
                  style={{ fontSize: '12px' }}
                />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'hsl(var(--card))',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '8px',
                    color: 'hsl(var(--foreground))'
                  }}
                />
                <Bar 
                  dataKey="count" 
                  fill="rgb(16 185 129)" 
                  radius={[8, 8, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Platform Distribution & Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Platform Distribution */}
        <Card className="bg-card border-border shadow-sm">
          <CardHeader>
            <CardTitle className="text-foreground">Platform Distribution</CardTitle>
            <p className="text-sm text-muted-foreground">Problems by platform</p>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie
                  data={platformDistribution}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={80}
                  paddingAngle={2}
                  dataKey="value"
                >
                  {platformDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'hsl(var(--card))',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '8px',
                    color: 'hsl(var(--foreground))'
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
            <div className="mt-4 space-y-2">
              {platformDistribution.map((platform) => (
                <div key={platform.name} className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    <div 
                      className="w-3 h-3 rounded-full" 
                      style={{ backgroundColor: platform.color }}
                    />
                    <span className="text-foreground">{platform.name}</span>
                  </div>
                  <span className="text-muted-foreground font-medium">{platform.value}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Recent Activity */}
        <Card className="bg-card border-border shadow-sm lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-foreground">Recent Activity</CardTitle>
            <p className="text-sm text-muted-foreground">Latest platform activity</p>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentActivity.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-8">No recent activity</p>
              ) : (
                recentActivity.map((activity, index) => (
                  <div key={index} className="flex items-start gap-3 pb-4 border-b border-border last:border-0 last:pb-0">
                    <div className={`p-2 rounded-lg ${
                      activity.type === 'submission' ? 'bg-emerald-500/10' :
                      activity.type === 'contest' ? 'bg-yellow-500/10' :
                      activity.type === 'session' ? 'bg-purple-500/10' :
                      activity.type === 'attendance' ? 'bg-green-500/10' :
                      'bg-blue-500/10'
                    }`}>
                      {activity.type === 'submission' && <Code2 className="w-4 h-4 text-emerald-500" />}
                      {activity.type === 'contest' && <Trophy className="w-4 h-4 text-yellow-500" />}
                      {activity.type === 'session' && <CalendarClock className="w-4 h-4 text-purple-500" />}
                      {activity.type === 'attendance' && <UserCheck className="w-4 h-4 text-green-500" />}
                      {activity.type === 'user' && <Users className="w-4 h-4 text-blue-500" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-foreground">
                        <span className="font-medium">{activity.user}</span>{' '}
                        <span className="text-muted-foreground">{activity.action}</span>{' '}
                        <span className="font-medium">{activity.target}</span>
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">{activity.time}</p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card className="bg-card border-border shadow-sm">
        <CardHeader>
          <CardTitle className="text-foreground">Quick Actions</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <a
            href="/admin/sessions"
            className="flex items-center gap-3 p-4 rounded-lg bg-primary/10 hover:bg-primary/20 transition-colors border border-primary/20"
          >
            <CalendarClock className="w-5 h-5 text-primary" />
            <div>
              <p className="font-medium text-foreground">Create Session</p>
              <p className="text-xs text-muted-foreground">Schedule a new session</p>
            </div>
          </a>

          <a
            href="/admin/problems"
            className="flex items-center gap-3 p-4 rounded-lg bg-blue-500/10 hover:bg-blue-500/20 transition-colors border border-blue-500/20"
          >
            <Code2 className="w-5 h-5 text-blue-500" />
            <div>
              <p className="font-medium text-foreground">Add Problem</p>
              <p className="text-xs text-muted-foreground">Import or create problems</p>
            </div>
          </a>

          <a
            href="/admin/contests"
            className="flex items-center gap-3 p-4 rounded-lg bg-yellow-500/10 hover:bg-yellow-500/20 transition-colors border border-yellow-500/20"
          >
            <Trophy className="w-5 h-5 text-yellow-500" />
            <div>
              <p className="font-medium text-foreground">Create Contest</p>
              <p className="text-xs text-muted-foreground">Set up a new contest</p>
            </div>
          </a>

          <a
            href="/admin/analytics"
            className="flex items-center gap-3 p-4 rounded-lg bg-purple-500/10 hover:bg-purple-500/20 transition-colors border border-purple-500/20"
          >
            <BarChart3 className="w-5 h-5 text-purple-500" />
            <div>
              <p className="font-medium text-foreground">View Analytics</p>
              <p className="text-xs text-muted-foreground">Detailed platform insights</p>
            </div>
          </a>
        </CardContent>
      </Card>
    </div>
  );
}
