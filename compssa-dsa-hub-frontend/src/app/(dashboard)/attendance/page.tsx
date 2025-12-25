import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CalendarDays } from 'lucide-react';
import { Button } from '@/components/ui/button';
import EmptyState from '@/components/common/EmptyState';

const mockStats = {
  total: 42,
  present: 38,
  rate: 90,
};

const mockAttendance = Array.from({ length: 60 }, (_, i) => {
  const date = new Date();
  date.setDate(date.getDate() - i);
  const level = Math.random() > 0.5 ? Math.floor(Math.random() * 4) + 1 : 0;
  return { date: date.toISOString().slice(0, 10), level };
}).reverse();

const levelColors = {
  0: 'bg-muted border-border/60',
  1: 'bg-emerald-100 dark:bg-emerald-900/50 border-emerald-200 dark:border-emerald-800/60',
  2: 'bg-emerald-200 dark:bg-emerald-800/80 border-emerald-300 dark:border-emerald-700/80',
  3: 'bg-emerald-300 dark:bg-emerald-700 border-emerald-400 dark:border-emerald-600',
  4: 'bg-emerald-400 dark:bg-emerald-600 border-emerald-500 dark:border-emerald-500',
};

export default function AttendancePage() {
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
              <p className="text-2xl font-semibold">{mockStats.total}</p>
            </CardContent>
          </Card>
          <Card className="bg-card border-border shadow-sm">
            <CardContent className="p-4">
              <p className="text-xs text-muted-foreground">Present</p>
              <p className="text-2xl font-semibold">{mockStats.present}</p>
            </CardContent>
          </Card>
          <Card className="bg-card border-border shadow-sm">
            <CardContent className="p-4">
              <p className="text-xs text-muted-foreground">Attendance rate</p>
              <p className="text-2xl font-semibold">{mockStats.rate}%</p>
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
              {mockAttendance.map((entry) => (
                <div key={entry.date} className="space-y-1">
                  <div
                    title={entry.date}
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
              <Badge variant="secondary">Sample data</Badge>
            </div>
            {mockAttendance.slice(-5).length === 0 ? (
              <EmptyState title="No attendance records" description="Attend sessions to see your progress here." />
            ) : (
              <div className="space-y-3">
                {mockAttendance.slice(-5).reverse().map((entry) => (
                  <div key={entry.date} className="flex items-center justify-between border-b border-border last:border-0 pb-3 last:pb-0">
                    <div className="text-sm text-foreground">Session on {entry.date}</div>
                    <Badge variant={entry.level > 0 ? 'default' : 'secondary'}>
                      {entry.level > 0 ? 'Present' : 'Absent'}
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
