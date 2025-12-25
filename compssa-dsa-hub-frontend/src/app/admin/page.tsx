'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, CalendarClock, Code2, Trophy, TrendingUp, UserCheck, BarChart3, ArrowUpRight, ArrowDownRight } from 'lucide-react';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

export default function AdminDashboard() {
  // Mock data - will be replaced with API calls
  const stats = [
    { 
      title: 'Total Users', 
      value: '248', 
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
      value: '8', 
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
      value: '342', 
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
      value: '12', 
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
      value: '87%', 
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
      value: '74%', 
      icon: TrendingUp, 
      change: '+8%', 
      trend: 'up',
      color: 'orange',
      bgClass: 'bg-orange-500/10 dark:bg-orange-500/20',
      iconClass: 'text-orange-500',
      borderClass: 'border-orange-500/20'
    },
  ];

  // Mock chart data
  const userGrowthData = [
    { month: 'Jul', users: 145 },
    { month: 'Aug', users: 162 },
    { month: 'Sep', users: 178 },
    { month: 'Oct', users: 195 },
    { month: 'Nov', users: 221 },
    { month: 'Dec', users: 248 },
  ];

  const submissionData = [
    { day: 'Mon', count: 42 },
    { day: 'Tue', count: 58 },
    { day: 'Wed', count: 51 },
    { day: 'Thu', count: 67 },
    { day: 'Fri', count: 73 },
    { day: 'Sat', count: 38 },
    { day: 'Sun', count: 29 },
  ];

  const platformDistribution = [
    { name: 'LeetCode', value: 156, color: '#FFA116' },
    { name: 'Codeforces', value: 98, color: '#1F8ACB' },
    { name: 'AtCoder', value: 54, color: '#000000' },
    { name: 'CodeChef', value: 34, color: '#5B4638' },
  ];

  const recentActivity = [
    { user: 'johndoe', action: 'Solved', target: 'Two Sum', time: '2 mins ago', type: 'submission' },
    { user: 'admin', action: 'Created', target: 'Weekly Contest 45', time: '15 mins ago', type: 'contest' },
    { user: 'janedoe', action: 'Registered for', target: 'Advanced Algorithms', time: '23 mins ago', type: 'session' },
    { user: 'instructor01', action: 'Marked attendance for', target: 'DSA Workshop', time: '1 hour ago', type: 'attendance' },
    { user: 'newuser123', action: 'Joined', target: 'CompSSA Hub', time: '2 hours ago', type: 'user' },
  ];

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
              {recentActivity.map((activity, index) => (
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
              ))}
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
