'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Plus, Edit2, Trash2, Calendar, Clock, MapPin, Users, ChevronRight, UserCheck } from 'lucide-react';
import { format } from 'date-fns';
import { getSessions, createSession, updateSession, deleteSession } from '@/lib/api';
import { Session, SessionType } from '@/lib/api/sessions';
import { Loading } from '@/components/common/Loading';

const sessionTypes = [
  { value: 'LECTURE', label: 'Lecture', color: 'bg-blue-500' },
  { value: 'PRACTICE', label: 'Practice', color: 'bg-green-500' },
  { value: 'CONTEST', label: 'Contest', color: 'bg-purple-500' },
  { value: 'WORKSHOP', label: 'Workshop', color: 'bg-orange-500' },
  { value: 'OTHER', label: 'Other', color: 'bg-gray-500' },
];

const emptySession = {
  name: '',
  type: 'LECTURE' as SessionType,
  date: '',
  startTime: '',
  endTime: '',
  instructor: '',
  description: '',
  location: '',
  capacity: 50,
};

export default function SessionManagementPage() {
  const queryClient = useQueryClient();
  const [isOpen, setIsOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState(emptySession);

  const { data: sessionsData, isLoading } = useQuery({
    queryKey: ['sessions'],
    queryFn: () => getSessions({ limit: 100 }),
  });

  const sessions = sessionsData?.data || [];
  const meta = sessionsData?.meta;

  const createMutation = useMutation({
    mutationFn: createSession,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sessions'] });
      queryClient.refetchQueries({ queryKey: ['sessions'] });
      resetForm();
      setIsOpen(false);
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) => updateSession(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sessions'] });
      queryClient.refetchQueries({ queryKey: ['sessions'] });
      resetForm();
      setIsOpen(false);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: deleteSession,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sessions'] });
      queryClient.refetchQueries({ queryKey: ['sessions'] });
    },
  });

  const handleSave = () => {
    const sessionDate = new Date(formData.date);
    const startDateTime = new Date(`${formData.date}T${formData.startTime}`);
    const endDateTime = new Date(`${formData.date}T${formData.endTime}`);

    const baseData: any = {
      name: formData.name,
      type: formData.type,
      date: sessionDate.toISOString(),
      startTime: startDateTime.toISOString(),
      endTime: endDateTime.toISOString(),
    };

    if (formData.instructor) {
      baseData.instructor = formData.instructor;
    }
    if (formData.description) {
      baseData.description = formData.description;
    }
    if (formData.location) {
      baseData.location = formData.location;
    }
    if (formData.capacity) {
      baseData.capacity = formData.capacity;
    }

    if (editingId) {
      updateMutation.mutate({
        id: editingId,
        data: baseData,
      });
    } else {
      createMutation.mutate(baseData);
    }
  };

  const handleEdit = (session: Session) => {
    setEditingId(session.id);
    const sessionDate = new Date(session.date);
    const startDate = new Date(session.startTime);
    const endDate = new Date(session.endTime);
    
    setFormData({
      name: session.name,
      type: session.type,
      date: sessionDate.toISOString().split('T')[0],
      startTime: startDate.toTimeString().slice(0, 5),
      endTime: endDate.toTimeString().slice(0, 5),
      instructor: session.instructor || '',
      description: session.description || '',
      location: session.location || '',
      capacity: session.capacity || 50,
    });
    setIsOpen(true);
  };

  const handleDelete = (id: string) => {
    deleteMutation.mutate(id);
  };

  const resetForm = () => {
    setEditingId(null);
    setFormData(emptySession);
  };

  const getTypeColor = (type: string) => {
    return sessionTypes.find((t) => t.value === type)?.color || 'bg-gray-500';
  };

  const getTypeLabel = (type: string) => {
    return sessionTypes.find((t) => t.value === type)?.label || type;
  };

  if (isLoading) {
    return (
      <div className="space-y-8">
        <Loading size="lg" label="Loading sessions..." />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Session Management</h1>
          <p className="text-muted-foreground mt-1">Create and manage all platform sessions</p>
        </div>
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogTrigger asChild>
            <Button
              size="lg"
              className="bg-primary hover:bg-primary/90 text-primary-foreground gap-2"
              onClick={() => resetForm()}
            >
              <Plus className="w-4 h-4" />
              Create Session
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl bg-card border-border">
            <DialogHeader>
              <DialogTitle className="text-foreground">
                {editingId ? 'Edit Session' : 'Create New Session'}
              </DialogTitle>
              <DialogDescription className="text-muted-foreground">
                Fill in the details below to {editingId ? 'update the' : 'create a new'} session
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-foreground">Session Name</Label>
                  <Input
                    value={formData.name || ''}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="e.g., Algorithms Masterclass"
                    className="border-border bg-muted text-foreground"
                  />
                </div>
                <div>
                  <Label className="text-foreground">Type</Label>
                  <Select
                    value={formData.type}
                    onValueChange={(value) =>
                      setFormData({ ...formData, type: value as Session['type'] })
                    }
                  >
                    <SelectTrigger className="border-border bg-muted text-foreground">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-card border-border">
                      {sessionTypes.map((t) => (
                        <SelectItem key={t.value} value={t.value}>
                          {t.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-foreground">Date</Label>
                  <Input
                    type="date"
                    value={formData.date || ''}
                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                    className="border-border bg-muted text-foreground"
                  />
                </div>
                <div>
                  <Label className="text-foreground">Instructor</Label>
                  <Input
                    value={formData.instructor || ''}
                    onChange={(e) => setFormData({ ...formData, instructor: e.target.value })}
                    placeholder="Instructor name"
                    className="border-border bg-muted text-foreground"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-foreground">Start Time</Label>
                  <Input
                    type="time"
                    value={formData.startTime || ''}
                    onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
                    className="border-border bg-muted text-foreground"
                  />
                </div>
                <div>
                  <Label className="text-foreground">End Time</Label>
                  <Input
                    type="time"
                    value={formData.endTime || ''}
                    onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
                    className="border-border bg-muted text-foreground"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-foreground">Location</Label>
                  <Input
                    value={formData.location || ''}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                    placeholder="e.g., Room 101"
                    className="border-border bg-muted text-foreground"
                  />
                </div>
                <div>
                  <Label className="text-foreground">Capacity</Label>
                  <Input
                    type="number"
                    value={formData.capacity || ''}
                    onChange={(e) => setFormData({ ...formData, capacity: parseInt(e.target.value) })}
                    placeholder="50"
                    className="border-border bg-muted text-foreground"
                  />
                </div>
              </div>

              <div>
                <Label className="text-foreground">Description</Label>
                <Textarea
                  value={formData.description || ''}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Session description..."
                  className="border-border bg-muted text-foreground resize-none"
                  rows={3}
                />
              </div>
            </div>

            <div className="flex gap-3 justify-end">
              <Button
                variant="outline"
                className="border-border"
                onClick={() => {
                  setIsOpen(false);
                  resetForm();
                }}
              >
                Cancel
              </Button>
              <Button
                className="bg-primary hover:bg-primary/90 text-primary-foreground"
                onClick={handleSave}
                disabled={createMutation.isPending || updateMutation.isPending}
              >
                {createMutation.isPending || updateMutation.isPending
                  ? (editingId ? 'Updating...' : 'Creating...')
                  : (editingId ? 'Update Session' : 'Create Session')}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Sessions List */}
      <div className="grid grid-cols-1 gap-4">
        {sessions.map((session) => (
          <Card
            key={session.id}
            className="bg-gradient-to-r from-card to-card/80 border-border shadow-sm hover:shadow-md transition-shadow"
          >
            <CardContent className="p-6">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-lg font-semibold text-foreground">{session.name}</h3>
                    <Badge className={`${getTypeColor(session.type)} text-white`}>
                      {getTypeLabel(session.type)}
                    </Badge>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Calendar className="w-4 h-4 text-primary" />
                      {format(new Date(session.date), 'MMM dd, yyyy')}
                    </div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Clock className="w-4 h-4 text-primary" />
                      {format(new Date(session.startTime), 'HH:mm')} - {format(new Date(session.endTime), 'HH:mm')}
                    </div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <MapPin className="w-4 h-4 text-primary" />
                      {session.location}
                    </div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Users className="w-4 h-4 text-primary" />
                      {session.attendances?.filter(a => a.present).length || 0}/{session.capacity || 'N/A'}
                    </div>
                  </div>

                  <p className="text-sm text-muted-foreground mt-3 line-clamp-2">
                    {session.description}
                  </p>
                  <p className="text-sm text-muted-foreground mt-2">
                    <span className="font-medium text-foreground">Instructor:</span> {session.instructor}
                  </p>
                </div>

                <div className="flex flex-col gap-2 ml-4">
                  <Link href={`/admin/attendance?sessionId=${session.id}`}>
                    <Button
                      size="sm"
                      className="w-full gap-2 bg-green-500/10 text-green-500 hover:bg-green-500/20 border border-green-500/20"
                    >
                      <UserCheck className="w-4 h-4" />
                      Mark Attendance
                    </Button>
                  </Link>
                  <div className="flex gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-muted-foreground hover:text-primary hover:bg-primary/10"
                      onClick={() => handleEdit(session)}
                    >
                      <Edit2 className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                      onClick={() => handleDelete(session.id)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Empty State */}
      {sessions.length === 0 && (
        <Card className="bg-card border-border shadow-sm">
          <CardContent className="p-12 flex flex-col items-center justify-center">
            <Calendar className="w-12 h-12 text-muted-foreground/50 mb-4" />
            <p className="text-lg font-medium text-foreground">No sessions yet</p>
            <p className="text-sm text-muted-foreground">Create your first session to get started</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
