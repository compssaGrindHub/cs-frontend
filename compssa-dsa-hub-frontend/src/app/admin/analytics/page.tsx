'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Calendar, Download, TrendingUp, Users, Code2, Trophy, Activity } from 'lucide-react';
import { format, subDays } from 'date-fns';

// Mock data generators
const generateUserGrowthData = () => {
  const data = [];
  for (let i = 30; i >= 0; i--) {
    const date = subDays(new Date(), i);
    data.push({
      date: format(date, 'MMM dd'),
      users: Math.floor(200 + Math.random() * 50 + i * 1.5),
      active: Math.floor(120 + Math.random() * 30 + i * 0.8),
    });
  }
  return data;
};

const generateSubmissionData = () => {
  const data = [];
  const platforms = ['LeetCode', 'Codeforces', 'AtCoder', 'CodeChef'];
  for (let i = 7; i >= 0; i--) {
    const date = subDays(new Date(), i);
    data.push({
      date: format(date, 'MMM dd'),
      ...platforms.reduce((acc, platform) => ({
        ...acc,
        [platform]: Math.floor(20 + Math.random() * 40),
      }), {}),
    });
  }
  return data;
};

const generateTopicDistribution = () => [
  { name: 'Arrays & Hashing', value: 342, color: '#3b82f6' },
  { name: 'Two Pointers', value: 198, color: '#10b981' },
  { name: 'Dynamic Programming', value: 276, color: '#f59e0b' },
  { name: 'Trees & Graphs', value: 234, color: '#8b5cf6' },
  { name: 'Binary Search', value: 156, color: '#ef4444' },
  { name: 'Other', value: 124, color: '#6b7280' },
];

const generateDifficultyDistribution = () => [
  { name: 'Easy', value: 450, color: '#10b981' },
  { name: 'Medium', value: 620, color: '#f59e0b' },
  { name: 'Hard', value: 260, color: '#ef4444' },
];

const generateEngagementData = () => {
  const data = [];
  for (let i = 12; i >= 0; i--) {
    const date = subDays(new Date(), i * 2);
    data.push({
      date: format(date, 'MMM dd'),
      sessions: Math.floor(150 + Math.random() * 50),
      avgDuration: Math.floor(25 + Math.random() * 15),
    });
  }
  return data;
};

export default function AdminAnalyticsPage() {
  const [timeRange, setTimeRange] = useState<'7d' | '30d' | '90d'>('30d');
  const [userGrowthData] = useState(generateUserGrowthData());
  const [submissionData] = useState(generateSubmissionData());
  const [topicData] = useState(generateTopicDistribution());
  const [difficultyData] = useState(generateDifficultyDistribution());
  const [engagementData] = useState(generateEngagementData());

  const stats = [
    { label: 'Total Users', value: '248', change: '+12%', icon: Users, color: 'text-blue-500' },
    { label: 'Total Submissions', value: '1,330', change: '+18%', icon: Code2, color: 'text-green-500' },
    { label: 'Active Sessions', value: '156', change: '+8%', icon: Activity, color: 'text-purple-500' },
    { label: 'Contests Held', value: '32', change: '+4', icon: Trophy, color: 'text-yellow-500' },
  ];

  const handleExport = (type: 'csv' | 'pdf') => {
    console.log(`Exporting analytics as ${type}`);
    // Mock export - would generate and download file
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Analytics Dashboard</h1>
          <p className="text-muted-foreground mt-1">Platform insights and performance metrics</p>
        </div>
        <div className="flex gap-3">
          <Select value={timeRange} onValueChange={(v) => setTimeRange(v as typeof timeRange)}>
            <SelectTrigger className="w-[150px] bg-background border-border">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7d">Last 7 days</SelectItem>
              <SelectItem value="30d">Last 30 days</SelectItem>
              <SelectItem value="90d">Last 90 days</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" onClick={() => handleExport('csv')} className="gap-2">
            <Download className="w-4 h-4" />
            CSV
          </Button>
          <Button variant="outline" onClick={() => handleExport('pdf')} className="gap-2">
            <Download className="w-4 h-4" />
            PDF
          </Button>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <Card key={stat.label} className="bg-card border-border shadow-sm">
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">{stat.label}</p>
                    <p className={`text-2xl font-bold mt-2 ${stat.color}`}>{stat.value}</p>
                    <p className="text-xs text-green-500 mt-1">{stat.change} from last month</p>
                  </div>
                  <div className="p-2 rounded-lg bg-primary/10">
                    <Icon className="w-5 h-5 text-primary" />
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* User Growth Chart */}
      <Card className="bg-card border-border shadow-sm">
        <CardHeader>
          <CardTitle className="text-foreground flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-blue-500" />
            User Growth & Activity
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={userGrowthData}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey="date" stroke="hsl(var(--muted-foreground))" />
              <YAxis stroke="hsl(var(--muted-foreground))" />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'hsl(var(--card))',
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '8px',
                }}
              />
              <Legend />
              <Line type="monotone" dataKey="users" stroke="#3b82f6" strokeWidth={2} name="Total Users" />
              <Line type="monotone" dataKey="active" stroke="#10b981" strokeWidth={2} name="Active Users" />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Submissions by Platform */}
      <Card className="bg-card border-border shadow-sm">
        <CardHeader>
          <CardTitle className="text-foreground flex items-center gap-2">
            <Code2 className="w-5 h-5 text-green-500" />
            Submissions by Platform
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={submissionData}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey="date" stroke="hsl(var(--muted-foreground))" />
              <YAxis stroke="hsl(var(--muted-foreground))" />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'hsl(var(--card))',
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '8px',
                }}
              />
              <Legend />
              <Bar dataKey="LeetCode" fill="#f59e0b" />
              <Bar dataKey="Codeforces" fill="#3b82f6" />
              <Bar dataKey="AtCoder" fill="#6b7280" />
              <Bar dataKey="CodeChef" fill="#8b5cf6" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Distribution Charts */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Topic Distribution */}
        <Card className="bg-card border-border shadow-sm">
          <CardHeader>
            <CardTitle className="text-foreground">Problem Topics Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={topicData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${((percent ?? 0) * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {topicData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'hsl(var(--card))',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '8px',
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Difficulty Distribution */}
        <Card className="bg-card border-border shadow-sm">
          <CardHeader>
            <CardTitle className="text-foreground">Problem Difficulty Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={difficultyData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${((percent ?? 0) * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {difficultyData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'hsl(var(--card))',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '8px',
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Engagement Metrics */}
      <Card className="bg-card border-border shadow-sm">
        <CardHeader>
          <CardTitle className="text-foreground flex items-center gap-2">
            <Activity className="w-5 h-5 text-purple-500" />
            User Engagement
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={engagementData}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey="date" stroke="hsl(var(--muted-foreground))" />
              <YAxis stroke="hsl(var(--muted-foreground))" />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'hsl(var(--card))',
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '8px',
                }}
              />
              <Legend />
              <Bar dataKey="sessions" fill="#8b5cf6" name="Daily Sessions" />
              <Bar dataKey="avgDuration" fill="#f59e0b" name="Avg Duration (min)" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="bg-gradient-to-br from-blue-500/10 to-blue-500/5 border-blue-500/20 shadow-sm">
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-lg bg-blue-500/20">
                <Calendar className="w-5 h-5 text-blue-500" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Attendance Rate</p>
                <p className="text-2xl font-bold text-blue-500">87%</p>
                <p className="text-xs text-muted-foreground mt-1">Across all sessions</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-500/10 to-green-500/5 border-green-500/20 shadow-sm">
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-lg bg-green-500/20">
                <TrendingUp className="w-5 h-5 text-green-500" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Avg Problem Solve Rate</p>
                <p className="text-2xl font-bold text-green-500">42%</p>
                <p className="text-xs text-muted-foreground mt-1">Platform-wide</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-500/10 to-purple-500/5 border-purple-500/20 shadow-sm">
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-lg bg-purple-500/20">
                <Trophy className="w-5 h-5 text-purple-500" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Contest Participation</p>
                <p className="text-2xl font-bold text-purple-500">74%</p>
                <p className="text-xs text-muted-foreground mt-1">Active members</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
