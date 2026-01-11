'use client';

import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useAuthStore } from '@/lib/stores/authStore';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CalendarDays } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Loading } from '@/components/common/Loading';
import { EmptyState } from '@/components/common/EmptyState';
import { getUserAttendance, getAttendanceStats } from '@/lib/api/attendance';
import { format } from 'date-fns';

const levelColors = {
  0: 'bg-muted border-border/60',
  1: 'bg-emerald-100 dark:bg-emerald-900/50 border-emerald-200 dark:border-emerald-800/60',
  2: 'bg-emerald-200 dark:bg-emerald-800/80 border-emerald-300 dark:border-emerald-700/80',
  3: 'bg-emerald-300 dark:bg-emerald-700 border-emerald-400 dark:border-emerald-600',
  4: 'bg-emerald-400 dark:bg-emerald-600 border-emerald-500 dark:border-emerald-500',
};

export default function AttendancePage() {
  const { user } = useAuthStore();

  const { data: attendanceData, isLoading: attendanceLoading } = useQuery({
    queryKey: ['userAttendance', user?.id],
    queryFn: () => getUserAttendance(user!.id),
    enabled: !!user?.id,
    refetchInterval: 30000,
  });

  const { data: statsData, isLoading: statsLoading } = useQuery({
    queryKey: ['attendanceStats', user?.id],
    queryFn: () => getAttendanceStats(user!.id),
    enabled: !!user?.id,
    refetchInterval: 30000,
  });

  const attendance = useMemo(() => attendanceData || [], [attendanceData]);
  const stats = statsData || { totalDays: 0, presentDays: 0, absentDays: 0, percentage: 0, recentStreak: 0 };

  const attendanceMap = useMemo(() => {
    const map = new Map<string, number>();
    attendance.forEach((a) => {
      if (a.session) {
        const date = new Date(a.session.date).toISOString().slice(0, 10);
        const current = map.get(date) || 0;
        map.set(date, current + (a.present ? 1 : 0));
      }
    });
    return map;
  }, [attendance]);

  const heatmapData = useMemo(() => {
    const data = [];
    const today = new Date();
    for (let i = 59; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().slice(0, 10);
      const count = attendanceMap.get(dateStr) || 0;
      const level = Math.min(count, 4);
      data.push({ date: dateStr, level });
    }
    return data;
  }, [attendanceMap]);

  const recentAttendance = useMemo(() => {
    return attendance
      .filter((a) => a.session)
      .sort((a, b) => {
        const dateA = new Date(a.session!.date).getTime();
        const dateB = new Date(b.session!.date).getTime();
        return dateB - dateA;
      })
      .slice(0, 5);
  }, [attendance]);

  const isLoading = attendanceLoading || statsLoading;

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background text-foreground p-6">
        <Loading size="lg" label="Loading attendance..." />
      </div>
    );
  }
  return (
    <div className="min-h-screen bg-background text-foreground p-6">
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="flex items-start justify-between gap-3 flex-wrap">
          <div>
            <h1 className="text-2xl font-bold">Attendance</h1>
            <p className="text-sm text-muted-foreground">Your attendance overview across sessions.</p>
          </div>
          <Button variant="outline" className="gap-2"><CalendarDays className="w-4 h-4" /> Export CSV</Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="bg-card border-border shadow-sm">
            <CardContent className="p-4">
              <p className="text-xs text-muted-foreground">Total sessions</p>
              <p className="text-2xl font-semibold">{stats.totalDays}</p>
            </CardContent>
          </Card>
          <Card className="bg-card border-border shadow-sm">
            <CardContent className="p-4">
              <p className="text-xs text-muted-foreground">Present</p>
              <p className="text-2xl font-semibold">{stats.presentDays}</p>
            </CardContent>
          </Card>
          <Card className="bg-card border-border shadow-sm">
            <CardContent className="p-4">
              <p className="text-xs text-muted-foreground">Attendance rate</p>
              <p className="text-2xl font-semibold">{Math.round(stats.percentage)}%</p>
            </CardContent>
          </Card>
        </div>

        <Card className="bg-card border-border shadow-sm">
          <CardContent className="p-6 space-y-4">
            <div className="flex items-center justify-between gap-3 flex-wrap">
              <div>
                <h2 className="text-lg font-semibold">Attendance heatmap</h2>
                <p className="text-sm text-muted-foreground">Recent sessions (sample data for now).</p>
              </div>
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <span>Less</span>
                {[0, 1, 2, 3, 4].map((level) => (
                  <span key={level} className={`w-3 h-3 rounded-sm border ${levelColors[level as keyof typeof levelColors]}`} />
                ))}
                <span>More</span>
              </div>
            </div>

            <div className="grid grid-cols-12 gap-1">
              {heatmapData.map((entry) => (
                <div key={entry.date} className="space-y-1">
                  <div
                    title={`${entry.date}: ${entry.level > 0 ? 'Present' : 'No attendance'}`}
                    className={`w-full h-6 rounded-sm border ${levelColors[entry.level as keyof typeof levelColors]}`}
                  />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card border-border shadow-sm">
          <CardContent className="p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold">Recent sessions attended</h2>
              {stats.recentStreak > 0 && (
                <Badge variant="secondary">Streak: {stats.recentStreak} days</Badge>
              )}
            </div>
            {recentAttendance.length === 0 ? (
              <EmptyState title="No attendance records" description="Attend sessions to see your progress here." />
            ) : (
              <div className="space-y-3">
                {recentAttendance.map((entry) => (
                  <div key={entry.id} className="flex items-center justify-between border-b border-border last:border-0 pb-3 last:pb-0">
                    <div className="flex-1">
                      <div className="text-sm font-medium text-foreground">{entry.session?.name || 'Session'}</div>
                      <div className="text-xs text-muted-foreground">
                        {entry.session?.date ? format(new Date(entry.session.date), 'MMM dd, yyyy') : 'Unknown date'}
                        {entry.session?.type && ` • ${entry.session.type}`}
                      </div>
                    </div>
                    <Badge variant={entry.present ? 'default' : 'secondary'}>
                      {entry.present ? 'Present' : 'Absent'}
                    </Badge>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
