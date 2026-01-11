"use client";

import Link from 'next/link';
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { CalendarDays, Clock3, MapPin, Users } from 'lucide-react';
import { getSessions, Session, SessionType } from '@/lib/api/sessions';
import { cn } from '@/lib/utils';
import { EmptyState } from '@/components/common/EmptyState';
import { Pagination } from '@/components/common/Pagination';
import { Loading } from '@/components/common/Loading';

const sessionTypeColors: Record<SessionType, string> = {
  LECTURE: 'bg-blue-100 text-blue-700 dark:bg-blue-500/20 dark:text-blue-200',
  PRACTICE: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-200',
  CONTEST: 'bg-purple-100 text-purple-700 dark:bg-purple-500/20 dark:text-purple-200',
  WORKSHOP: 'bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-200',
  OTHER: 'bg-slate-100 text-slate-700 dark:bg-slate-500/20 dark:text-slate-200',
};

function SessionCard({ session }: { session: Session }) {
  const start = new Date(session.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  const end = new Date(session.endTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  const date = new Date(session.date).toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' });
  return (
    <Card className="bg-card border-border shadow-sm h-full">
      <CardContent className="p-4 flex flex-col gap-3 h-full">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <CalendarDays className="w-4 h-4 text-muted-foreground" />
            <span className="text-sm text-muted-foreground">{date}</span>
          </div>
          <Badge className={cn('text-xs font-medium border-0', sessionTypeColors[session.type])}>{session.type}</Badge>
        </div>

        <div className="space-y-1">
          <h3 className="text-lg font-semibold text-foreground leading-snug">{session.name}</h3>
          {session.description && (
            <p className="text-sm text-muted-foreground line-clamp-2">{session.description}</p>
          )}
        </div>

        <div className="flex flex-wrap gap-3 text-sm text-muted-foreground">
          <span className="inline-flex items-center gap-1"><Clock3 className="w-4 h-4" /> {start} - {end}</span>
          {session.location && (
            <span className="inline-flex items-center gap-1"><MapPin className="w-4 h-4" /> {session.location}</span>
          )}
          {session.instructor && (
            <span className="inline-flex items-center gap-1"><Users className="w-4 h-4" /> {session.instructor}</span>
          )}
        </div>

        <div className="mt-auto flex items-center justify-between pt-2">
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            {session.capacity && (
              <span>Capacity: {session.capacity}</span>
            )}
            {session.attendances && session.attendances.length > 0 && (
              <span>• {session.attendances.length} attendees</span>
            )}
          </div>
          <Link href={`/sessions/${session.id}`} className="ml-auto">
            <Button size="sm" variant="ghost" className="text-primary hover:text-primary">View details</Button>
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}

export default function SessionsPage() {
  const [search, setSearch] = useState('');
  const [type, setType] = useState<SessionType | 'ALL'>('ALL');
  const [upcomingOnly, setUpcomingOnly] = useState(false);
  const [page, setPage] = useState(1);
  const pageSize = 6;

  const apiParams = {
    page,
    limit: pageSize,
    type: type !== 'ALL' ? type : undefined,
    upcoming: upcomingOnly || undefined,
  };

  const { data: sessionsData, isLoading } = useQuery({
    queryKey: ['sessions', apiParams],
    queryFn: () => getSessions(apiParams),
  });

  const sessions = sessionsData?.data || [];
  const meta = sessionsData?.meta;

  const filtered = sessions.filter((s) => {
    if (!search) return true;
    return s.name.toLowerCase().includes(search.toLowerCase());
  });

  return (
    <div className="min-h-screen bg-background text-foreground p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-6">
          <div>
            <h1 className="text-2xl font-bold">Sessions</h1>
            <p className="text-sm text-muted-foreground">Browse upcoming practice, lectures, and contests.</p>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-sm text-muted-foreground">Upcoming only</span>
            <Switch checked={upcomingOnly} onCheckedChange={setUpcomingOnly} />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-[2fr_1fr] gap-4 mb-6">
          <Card className="bg-card border-border shadow-sm">
            <CardContent className="p-4 space-y-3">
              <label className="text-xs text-muted-foreground">Search</label>
              <Input
                placeholder="Search sessions"
                value={search}
                onChange={(e) => {
                  setPage(1);
                  setSearch(e.target.value);
                }}
              />
            </CardContent>
          </Card>

          <Card className="bg-card border-border shadow-sm">
            <CardContent className="p-4 space-y-3">
              <label className="text-xs text-muted-foreground">Type</label>
              <select
                value={type}
                onChange={(e) => {
                  setPage(1);
                  setType(e.target.value as SessionType | 'ALL');
                }}
                className="w-full h-10 rounded-md border border-border bg-background text-foreground text-sm px-3"
              >
                <option value="ALL">All types</option>
                <option value="LECTURE">Lecture</option>
                <option value="PRACTICE">Practice</option>
                <option value="CONTEST">Contest</option>
                <option value="WORKSHOP">Workshop</option>
                <option value="OTHER">Other</option>
              </select>
            </CardContent>
          </Card>
        </div>

        {isLoading ? (
          <Loading size="lg" label="Loading sessions..." />
        ) : filtered.length === 0 ? (
          <EmptyState
            title="No sessions found"
            description="Try adjusting filters or check back later for new sessions."
            action={{ label: 'Reset filters', onClick: () => { setSearch(''); setType('ALL'); setUpcomingOnly(false); setPage(1); } }}
          />
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 mb-6">
              {filtered.map((session) => (
                <SessionCard key={session.id} session={session} />
              ))}
            </div>
            {meta && meta.totalPages > 1 && (
              <div className="flex justify-center">
                <Pagination page={meta.page} pageCount={meta.totalPages} onPageChange={setPage} />
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
