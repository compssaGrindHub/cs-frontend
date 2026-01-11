'use client';

import { useState, useMemo, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useSearchParams } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Checkbox } from '@/components/ui/checkbox';
import { Search, UserCheck, UserX, Users, CalendarClock, Save, Download } from 'lucide-react';
import { format } from 'date-fns';
import { getSessions } from '@/lib/api';
import { getSessionAttendance, markBulkAttendance } from '@/lib/api/attendance';
import { getUsers } from '@/lib/api';

interface AttendanceRecord {
  userId: string;
  username: string;
  email: string;
  present: boolean;
}

export default function AdminAttendancePage() {
  const queryClient = useQueryClient();
  const searchParams = useSearchParams();
  const sessionIdFromUrl = searchParams.get('sessionId');
  
  const [selectedSessionId, setSelectedSessionId] = useState<string>(() => sessionIdFromUrl || '');
  const [searchTerm, setSearchTerm] = useState('');
  const [attendance, setAttendance] = useState<Map<string, AttendanceRecord>>(new Map());
  const [hasChanges, setHasChanges] = useState(false);

  const { data: sessionsData } = useQuery({
    queryKey: ['sessions'],
    queryFn: () => getSessions({ limit: 100 }),
  });

  const sessions = useMemo(() => sessionsData?.data || [], [sessionsData?.data]);

  useEffect(() => {
    // Sync URL parameter to state - legitimate pattern for syncing external state
    if (sessionIdFromUrl && sessionIdFromUrl !== selectedSessionId) {
      setSelectedSessionId(sessionIdFromUrl);
    }
  }, [sessionIdFromUrl, selectedSessionId]);

  useEffect(() => {
    // Initialize session if not set from URL - legitimate pattern for syncing external state
    if (sessions.length > 0 && !sessionIdFromUrl) {
      setSelectedSessionId(sessions[0].id);
    }
  }, [sessions, sessionIdFromUrl]);

  const { data: usersData } = useQuery({
    queryKey: ['users', 'all'],
    queryFn: () => getUsers({ limit: 1000 }),
  });

  const allUsers = useMemo(() => usersData?.data || [], [usersData?.data]);

  const { data: attendanceData } = useQuery({
    queryKey: ['attendance', 'session', selectedSessionId],
    queryFn: () => getSessionAttendance(selectedSessionId),
    enabled: !!selectedSessionId,
  });

  // eslint-disable react-hooks/set-state-in-effect
  useEffect(() => {
    // Build attendance map from fetched data - legitimate pattern for syncing query state to local state
    if (allUsers.length > 0 && attendanceData) {
      const attendanceMap = new Map<string, AttendanceRecord>();

      allUsers.forEach((user) => {
        const marked = attendanceData.users.find((u) => u.userId === user.id);
        attendanceMap.set(user.id, {
          userId: user.id,
          username: user.username,
          email: user.email || '',
          present: marked?.present || false,
        });
      });

      setAttendance(attendanceMap);
      setHasChanges(false);
    } else if (allUsers.length > 0 && !attendanceData) {
      const attendanceMap = new Map<string, AttendanceRecord>();
      allUsers.forEach((user) => {
        attendanceMap.set(user.id, {
          userId: user.id,
          username: user.username,
          email: user.email || '',
          present: false,
        });
      });
      setAttendance(attendanceMap);
      setHasChanges(false);
    }
  }, [allUsers, attendanceData]);

  const selectedSession = sessions.find((s) => s.id === selectedSessionId);

  const attendanceList = useMemo(() => {
    return Array.from(attendance.values()).filter((user) =>
      user.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [attendance, searchTerm]);

  const stats = useMemo(() => {
    const total = attendance.size;
    const present = Array.from(attendance.values()).filter((u) => u.present).length;
    const absent = total - present;
    const rate = total > 0 ? Math.round((present / total) * 100) : 0;

    return { total, present, absent, rate };
  }, [attendance]);

  const bulkAttendanceMutation = useMutation({
    mutationFn: markBulkAttendance,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['attendance', 'session', selectedSessionId] });
      queryClient.invalidateQueries({ queryKey: ['userAttendance'] });
      queryClient.invalidateQueries({ queryKey: ['attendanceStats'] });
      queryClient.refetchQueries({ queryKey: ['attendance', 'session', selectedSessionId] });
      setHasChanges(false);
    },
  });

  const toggleAttendance = (userId: string) => {
    const user = attendance.get(userId);
    if (user) {
      const updated = new Map(attendance);
      updated.set(userId, { ...user, present: !user.present });
      setAttendance(updated);
      setHasChanges(true);
    }
  };

  const toggleAll = (present: boolean) => {
    const updated = new Map();
    attendance.forEach((user, userId) => {
      updated.set(userId, { ...user, present });
    });
    setAttendance(updated);
    setHasChanges(true);
  };

  const handleSave = () => {
    if (!selectedSessionId) return;

    const presentUserIds = Array.from(attendance.values())
      .filter((u) => u.present)
      .map((u) => u.userId);

    const absentUserIds = Array.from(attendance.values())
      .filter((u) => !u.present)
      .map((u) => u.userId);

    Promise.all([
      presentUserIds.length > 0
        ? bulkAttendanceMutation.mutateAsync({
            userIds: presentUserIds,
            sessionId: selectedSessionId,
            present: true,
          })
        : Promise.resolve(),
      absentUserIds.length > 0
        ? bulkAttendanceMutation.mutateAsync({
            userIds: absentUserIds,
            sessionId: selectedSessionId,
            present: false,
          })
        : Promise.resolve(),
    ]);
  };

  const handleExport = () => {
    // Export attendance as CSV
    const csv = [
      ['Username', 'Email', 'Present'],
      ...Array.from(attendance.values()).map((u) => [u.username, u.email, u.present ? 'Yes' : 'No']),
    ]
      .map((row) => row.join(','))
      .join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `attendance-${selectedSession?.name || 'session'}-${new Date().toISOString()}.csv`;
    a.click();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Attendance Management</h1>
          <p className="text-muted-foreground mt-1">Mark and manage session attendance</p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" onClick={handleExport} className="gap-2">
            <Download className="w-4 h-4" />
            Export CSV
          </Button>
          <Button 
            onClick={handleSave} 
            disabled={!hasChanges || !selectedSessionId || bulkAttendanceMutation.isPending} 
            className="gap-2"
          >
            <Save className="w-4 h-4" />
            {bulkAttendanceMutation.isPending ? 'Saving...' : 'Save Changes'}
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="bg-card border-border shadow-sm">
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-lg bg-blue-500/10">
                <Users className="w-5 h-5 text-blue-500" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Students</p>
                <p className="text-2xl font-bold text-foreground">{stats.total}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card border-border shadow-sm">
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-lg bg-green-500/10">
                <UserCheck className="w-5 h-5 text-green-500" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Present</p>
                <p className="text-2xl font-bold text-green-500">{stats.present}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card border-border shadow-sm">
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-lg bg-red-500/10">
                <UserX className="w-5 h-5 text-red-500" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Absent</p>
                <p className="text-2xl font-bold text-red-500">{stats.absent}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card border-border shadow-sm">
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-lg bg-purple-500/10">
                <CalendarClock className="w-5 h-5 text-purple-500" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Attendance Rate</p>
                <p className="text-2xl font-bold text-purple-500">{stats.rate}%</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Session Selector & Table */}
      <Card className="bg-card border-border shadow-sm">
        <CardHeader>
          <CardTitle className="text-foreground">Mark Attendance</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Session Selector */}
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <Select value={selectedSessionId} onValueChange={setSelectedSessionId}>
                <SelectTrigger className="bg-background border-border">
                  <SelectValue placeholder="Select session" />
                </SelectTrigger>
                <SelectContent>
                  {sessions.map((session) => (
                    <SelectItem key={session.id} value={session.id}>
                      {session.name} - {format(new Date(session.date), 'MMM dd, yyyy')}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search students..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9 bg-background border-border"
              />
            </div>
          </div>

          {/* Session Info */}
          {selectedSession && (
            <div className="p-4 rounded-lg bg-muted/50 border border-border">
              <div className="flex items-start justify-between">
                <div className="space-y-1">
                  <h3 className="font-semibold text-foreground">{selectedSession.name}</h3>
                  <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-muted-foreground">
                    <span>📅 {format(new Date(selectedSession.date), 'MMMM dd, yyyy')}</span>
                    <span>🕐 {format(new Date(selectedSession.startTime), 'HH:mm')} - {format(new Date(selectedSession.endTime), 'HH:mm')}</span>
                  {selectedSession.location && <span>📍 {selectedSession.location}</span>}
                  {selectedSession.instructor && <span>👨‍🏫 {selectedSession.instructor}</span>}
                  </div>
                </div>
                <Badge className="bg-blue-500/10 text-blue-500 border-blue-500/20">
                  {selectedSession.type}
                </Badge>
              </div>
            </div>
          )}

          {/* Bulk Actions */}
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={() => toggleAll(true)}>
              Mark All Present
            </Button>
            <Button variant="outline" size="sm" onClick={() => toggleAll(false)}>
              Mark All Absent
            </Button>
          </div>

          {/* Attendance Table */}
          <div className="border border-border rounded-lg">
            <Table>
              <TableHeader>
                <TableRow className="hover:bg-muted/50">
                  <TableHead className="w-12 text-muted-foreground">Present</TableHead>
                  <TableHead className="text-muted-foreground">Username</TableHead>
                  <TableHead className="text-muted-foreground">Email</TableHead>
                  <TableHead className="text-muted-foreground">Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {attendanceList.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center py-8 text-muted-foreground">
                      No students found
                    </TableCell>
                  </TableRow>
                ) : (
                  attendanceList.map((user) => (
                    <TableRow key={user.userId} className="hover:bg-muted/50">
                      <TableCell>
                        <Checkbox
                          checked={user.present}
                          onCheckedChange={() => toggleAttendance(user.userId)}
                        />
                      </TableCell>
                      <TableCell className="font-medium text-foreground">{user.username}</TableCell>
                      <TableCell className="text-muted-foreground">{user.email}</TableCell>
                      <TableCell>
                        {user.present ? (
                          <Badge className="bg-green-500/10 text-green-500 border-green-500/20">
                            Present
                          </Badge>
                        ) : (
                          <Badge className="bg-red-500/10 text-red-500 border-red-500/20">
                            Absent
                          </Badge>
                        )}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
