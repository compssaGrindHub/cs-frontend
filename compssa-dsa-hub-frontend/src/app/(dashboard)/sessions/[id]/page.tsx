'use client';

import { useQuery } from '@tanstack/react-query';
import { notFound } from 'next/navigation';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { CalendarDays, Clock3, MapPin, Users } from 'lucide-react';
import { getSessionById, SessionType } from '@/lib/api/sessions';
import { getSessionAttendance } from '@/lib/api/attendance';
import { Loading } from '@/components/common/Loading';
import EmptyState from '@/components/common/EmptyState';
import Link from 'next/link';

const sessionTypeColors: Record<SessionType, string> = {
  LECTURE: 'bg-blue-100 text-blue-700 dark:bg-blue-500/20 dark:text-blue-200',
  PRACTICE: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-200',
  CONTEST: 'bg-purple-100 text-purple-700 dark:bg-purple-500/20 dark:text-purple-200',
  WORKSHOP: 'bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-200',
  OTHER: 'bg-slate-100 text-slate-700 dark:bg-slate-500/20 dark:text-slate-200',
};

export default function SessionDetailPage({ params }: { params: { id: string } }) {
  const { data: session, isLoading: sessionLoading, error: sessionError } = useQuery({
    queryKey: ['session', params.id],
    queryFn: () => getSessionById(params.id),
  });

  const { data: attendanceData, isLoading: attendanceLoading } = useQuery({
    queryKey: ['attendance', 'session', params.id],
    queryFn: () => getSessionAttendance(params.id),
    enabled: !!session,
  });

  if (sessionLoading) {
    return (
      <div className="min-h-screen bg-background p-6">
        <Loading size="lg" label="Loading session..." />
      </div>
    );
  }

  if (sessionError || !session) {
    return notFound();
  }

  const date = new Date(session.date).toLocaleDateString(undefined, { weekday: 'long', month: 'short', day: 'numeric' });
  const start = new Date(session.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  const end = new Date(session.endTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  const stats = {
    registered: attendanceData?.total || session.attendances?.length || 0,
    present: attendanceData?.present || session.attendances?.filter((a) => a.present).length || 0,
    absent: attendanceData?.absent || session.attendances?.filter((a) => !a.present).length || 0,
  };
  const attendanceRate = stats.registered > 0 ? Math.round((stats.present / stats.registered) * 100) : 0;

  return (
    <div className="min-h-screen bg-background text-foreground p-6">
      <div className="max-w-5xl mx-auto space-y-6">
        <div className="flex items-start justify-between gap-3 flex-wrap">
          <div className="space-y-2">
            <Badge className={sessionTypeColors[session.type]}>{session.type}</Badge>
            <h1 className="text-3xl font-bold leading-tight">{session.name}</h1>
            <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
              <span className="inline-flex items-center gap-1"><CalendarDays className="w-4 h-4" /> {date}</span>
              <span className="inline-flex items-center gap-1"><Clock3 className="w-4 h-4" /> {start} - {end}</span>
              {session.location && <span className="inline-flex items-center gap-1"><MapPin className="w-4 h-4" /> {session.location}</span>}
              {session.instructor && <span className="inline-flex items-center gap-1"><Users className="w-4 h-4" /> {session.instructor}</span>}
            </div>
          </div>
          <Link href="/attendance" className="ml-auto">
            <Button variant="outline">View attendance</Button>
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="bg-card border-border shadow-sm">
            <CardContent className="p-4">
              <p className="text-xs text-muted-foreground">Total</p>
              <p className="text-2xl font-semibold">{stats.registered || '—'}</p>
            </CardContent>
          </Card>
          <Card className="bg-card border-border shadow-sm">
            <CardContent className="p-4">
              <p className="text-xs text-muted-foreground">Present</p>
              <p className="text-2xl font-semibold">{stats.present}</p>
            </CardContent>
          </Card>
          <Card className="bg-card border-border shadow-sm">
            <CardContent className="p-4">
              <p className="text-xs text-muted-foreground">Attendance rate</p>
              <p className="text-2xl font-semibold">{attendanceRate}%</p>
            </CardContent>
          </Card>
        </div>

        <Card className="bg-card border-border shadow-sm">
          <CardContent className="p-6 space-y-4">
            <h2 className="text-lg font-semibold">Overview</h2>
            {session.description ? (
              <p className="text-sm text-muted-foreground leading-relaxed">{session.description}</p>
            ) : (
              <EmptyState title="No description yet" description="The organizer has not provided details for this session." />
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm text-muted-foreground pt-2">
              <div className="space-y-1">
                <p className="font-medium text-foreground">Date & Time</p>
                <p>{date}</p>
                <p>{start} - {end}</p>
              </div>
              <div className="space-y-1">
                <p className="font-medium text-foreground">Logistics</p>
                <p>{session.location || 'TBD'}</p>
                {session.capacity && <p>Capacity: {session.capacity}</p>}
                {session.instructor && <p>Instructor: {session.instructor}</p>}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
