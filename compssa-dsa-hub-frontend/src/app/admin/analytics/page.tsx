'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Download, TrendingUp, Users, Code2, Trophy, Activity, Calendar } from 'lucide-react';
import { format, subDays } from 'date-fns';
import { getSystemOverview, getUserGrowth, getEngagement, getSubmissionsStats, getAttendanceAnalytics, getUsageTimeStats, getTopicDistribution, getProblemSolveRate, getContestParticipationRate, getEngagementChart } from '@/lib/api';
import { Loading } from '@/components/common/Loading';


export default function AdminAnalyticsPage() {
  const [timeRange, setTimeRange] = useState<'7d' | '30d' | '90d'>('30d');

  const getDateRange = () => {
    const now = new Date();
    const days = timeRange === '7d' ? 7 : timeRange === '30d' ? 30 : 90;
    return {
      from: subDays(now, days).toISOString(),
      to: now.toISOString(),
    };
  };

  const { data: overview, isLoading: overviewLoading } = useQuery({
    queryKey: ['admin', 'overview'],
    queryFn: getSystemOverview,
  });

  const { data: userGrowth, isLoading: growthLoading } = useQuery({
    queryKey: ['admin', 'userGrowth', timeRange],
    queryFn: () => getUserGrowth({ ...getDateRange(), bucket: timeRange === '7d' ? 'day' : 'month' }),
  });

  const { data: engagement, isLoading: engagementLoading } = useQuery({
    queryKey: ['admin', 'engagement', timeRange],
    queryFn: () => getEngagement(getDateRange()),
  });

  const { data: submissionsStats, isLoading: submissionsLoading } = useQuery({
    queryKey: ['admin', 'submissions', timeRange],
    queryFn: () => getSubmissionsStats(getDateRange()),
  });

  const { data: attendanceStats, isLoading: attendanceLoading } = useQuery({
    queryKey: ['admin', 'attendance', timeRange],
    queryFn: () => getAttendanceAnalytics(getDateRange()),
  });

  const { data: usageTimeStats, isLoading: usageTimeLoading } = useQuery({
    queryKey: ['admin', 'usageTime', timeRange],
    queryFn: () => getUsageTimeStats(getDateRange()),
  });

  const { data: topicDistribution, isLoading: topicDistributionLoading } = useQuery({
    queryKey: ['admin', 'topicDistribution'],
    queryFn: getTopicDistribution,
  });

  const { data: problemSolveRate, isLoading: problemSolveRateLoading } = useQuery({
    queryKey: ['admin', 'problemSolveRate', timeRange],
    queryFn: () => getProblemSolveRate(getDateRange()),
  });

  const { data: contestParticipationRate, isLoading: contestParticipationRateLoading } = useQuery({
    queryKey: ['admin', 'contestParticipationRate', timeRange],
    queryFn: () => getContestParticipationRate(getDateRange()),
  });

  const { data: engagementChart, isLoading: engagementChartLoading } = useQuery({
    queryKey: ['admin', 'engagementChart', timeRange],
    queryFn: () => getEngagementChart(getDateRange()),
  });

  const { data: attendanceAnalytics } = useQuery({
    queryKey: ['admin', 'attendance', timeRange],
    queryFn: () => getAttendanceAnalytics(getDateRange()),
  });

  const isLoading = overviewLoading || growthLoading || engagementLoading || submissionsLoading || attendanceLoading || usageTimeLoading || topicDistributionLoading || problemSolveRateLoading || contestParticipationRateLoading || engagementChartLoading;

  const totalHoursSpent = usageTimeStats?.overall ? Math.floor(usageTimeStats.overall / 60) : 0;
  const totalMinutesRemainder = usageTimeStats?.overall ? usageTimeStats.overall % 60 : 0;
  const avgHoursSpent = usageTimeStats?.average ? Math.floor(usageTimeStats.average / 60) : 0;
  const avgMinutesRemainder = usageTimeStats?.average ? Math.floor(usageTimeStats.average % 60) : 0;

  const stats = [
    { label: 'Total Users', value: overview?.users?.toString() || '0', change: '+12%', icon: Users, color: 'text-blue-500' },
    { label: 'Total Submissions', value: overview?.submissions?.toLocaleString() || '0', change: '+18%', icon: Code2, color: 'text-green-500' },
    { label: 'Active Sessions', value: overview?.sessions?.toString() || '0', change: '+8%', icon: Activity, color: 'text-purple-500' },
    { label: 'Total Time Spent', value: `${totalHoursSpent}h ${totalMinutesRemainder}m`, change: `${avgHoursSpent}h ${avgMinutesRemainder}m avg`, icon: Calendar, color: 'text-orange-500' },
  ];

  const userGrowthData = userGrowth?.points.map((p) => ({
    date: p.key,
    users: p.count,
    active: 0,
  })) || [];

  const submissionData = submissionsStats?.daily.map((d) => ({
    date: d.key,
    LeetCode: 0,
    Codeforces: 0,
    AtCoder: 0,
    CodeChef: 0,
  })) || [];

  const topicData = topicDistribution?.slice(0, 10).map((item, index) => {
    const colors = ['#3b82f6', '#10b981', '#f59e0b', '#8b5cf6', '#ef4444', '#ec4899', '#14b8a6', '#f97316', '#6366f1', '#6b7280'];
    return {
      name: item.topic,
      value: item.count,
      color: colors[index % colors.length],
    };
  }) || [];

  const difficultyData = [
    { name: 'Easy', value: 450, color: '#10b981' },
    { name: 'Medium', value: 620, color: '#f59e0b' },
    { name: 'Hard', value: 260, color: '#ef4444' },
  ];

  const engagementData = engagementChart?.map((item) => ({
    date: item.date,
    sessions: item.sessions,
    avgDuration: item.avgDuration,
  })) || [];

  const handleExport = (type: 'csv' | 'pdf') => {
    console.log(`Exporting analytics as ${type}`);
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Loading size="lg" label="Loading analytics..." />
      </div>
    );
  }

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
              <Bar dataKey="count" fill="#3b82f6" name="Submissions" />
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
              <BarChart data={topicData} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis type="number" stroke="hsl(var(--muted-foreground))" />
                <YAxis dataKey="name" type="category" stroke="hsl(var(--muted-foreground))" width={150} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'hsl(var(--card))',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '8px',
                  }}
                />
                <Bar dataKey="value" fill="#3b82f6" name="Problems Solved" />
              </BarChart>
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
                <p className="text-2xl font-bold text-blue-500">
                  {attendanceAnalytics?.items && attendanceAnalytics.items.length > 0
                    ? Math.round(attendanceAnalytics.items.reduce((sum, item) => sum + item.percentage, 0) / attendanceAnalytics.items.length * 100) / 100
                    : 0}%
                </p>
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
                <p className="text-2xl font-bold text-green-500">{problemSolveRate?.solveRate || 0}%</p>
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
                <p className="text-2xl font-bold text-purple-500">{contestParticipationRate?.participationRate || 0}%</p>
                <p className="text-xs text-muted-foreground mt-1">Active members</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
