"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Plus,
  Search,
  Pencil,
  Trash2,
  Trophy,
  Clock,
  Users,
  RefreshCw,
} from "lucide-react";
import { format } from "date-fns";
import {
  getContests,
  createContest,
  updateContest,
  deleteContest,
  // TODO: new implementation for private contest implemented by Zigla in the evaluateContest api logic, review later
  syncContestStandings,
  evaluateContest,
} from "@/lib/api";
import { Contest, Platform } from "@/lib/types/contest";
import { Loading } from "@/components/common/Loading";

const platformColors: Record<string, string> = {
  CODEFORCES: "bg-blue-500/10 text-blue-500 border-blue-500/20",
  LEETCODE: "bg-orange-500/10 text-orange-500 border-orange-500/20",
  CUSTOM: "bg-purple-500/10 text-purple-500 border-purple-500/20",
};

const statusColors: Record<string, string> = {
  UPCOMING: "bg-blue-500/10 text-blue-500 border-blue-500/20",
  LIVE: "bg-green-500/10 text-green-500 border-green-500/20",
  COMPLETED: "bg-gray-500/10 text-gray-500 border-gray-500/20",
  ENDED: "bg-gray-500/10 text-gray-500 border-gray-500/20",
};

// ============================================================================
// HELPER FUNCTIONS - Compute contest status client-side
// ============================================================================

// Check if contest has ended (startTime + duration < now)
function hasContestEnded(contest: Contest): boolean {
  const startTime = new Date(contest.startTime).getTime();
  const endTime = startTime + contest.duration * 60 * 1000; // duration in minutes
  return Date.now() > endTime;
}

// Check if contest is currently live (started but not ended)
function isContestLive(contest: Contest): boolean {
  const startTime = new Date(contest.startTime).getTime();
  const endTime = startTime + contest.duration * 60 * 1000;
  const now = Date.now();
  return now >= startTime && now <= endTime;
}

// Check if contest is upcoming (hasn't started yet)
function isContestUpcoming(contest: Contest): boolean {
  const startTime = new Date(contest.startTime).getTime();
  return Date.now() < startTime;
}

// Get computed status for a contest
function getComputedStatus(contest: Contest): "UPCOMING" | "LIVE" | "ENDED" {
  if (isContestUpcoming(contest)) return "UPCOMING";
  if (isContestLive(contest)) return "LIVE";
  return "ENDED";
}

const emptyContest = {
  name: "",
  platform: "CODEFORCES" as Platform,
  externalId: "",
  startTime: "",
  duration: 120,
  isRated: true,
};

export default function AdminContestsPage() {
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState("");
  const [platformFilter, setPlatformFilter] = useState<Platform | "ALL">("ALL");
  const [statusFilter, setStatusFilter] = useState<
    "ALL" | "UPCOMING" | "LIVE" | "COMPLETED"
  >("ALL");
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedContest, setSelectedContest] = useState<Contest | null>(null);
  const [formData, setFormData] = useState(emptyContest);

  const { data: contestsData, isLoading } = useQuery({
    queryKey: ["contests", "all", platformFilter, statusFilter, searchTerm],
    queryFn: () =>
      getContests({
        limit: 50,
        platform: platformFilter !== "ALL" ? platformFilter : undefined,
        status: statusFilter !== "ALL" ? statusFilter : undefined,
      }),
  });

  const contests = contestsData?.data || [];
  const meta = contestsData?.meta;

  const createMutation = useMutation({
    mutationFn: createContest,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["contests", "all"] });
      queryClient.refetchQueries({ queryKey: ["contests", "all"] });
      setIsCreateDialogOpen(false);
      setFormData(emptyContest);
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Contest }) =>
      updateContest(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["contests", "all"] });
      queryClient.refetchQueries({ queryKey: ["contests", "all"] });
      setIsEditDialogOpen(false);
      setSelectedContest(null);
      setFormData(emptyContest);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: deleteContest,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["contests", "all"] });
      queryClient.refetchQueries({ queryKey: ["contests", "all"] });
      setIsDeleteDialogOpen(false);
      setSelectedContest(null);
    },
  });

  const syncStandingsMutation = useMutation({
    // TODO: new implementation for private contest implemented by Zigla in the evaluateContest api logic, review later
    // Old: mutationFn: syncContestStandings,
    mutationFn: evaluateContest,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["contests", "all"] });
      queryClient.refetchQueries({ queryKey: ["contests", "all"] });
    },
  });

  const stats = [
    {
      label: "Total Contests",
      value: meta?.total || 0,
      color: "text-blue-500",
    },
    {
      label: "Upcoming",
      value: contests.filter((c) => isContestUpcoming(c)).length,
      color: "text-green-500",
    },
    {
      label: "Live",
      value: contests.filter((c) => isContestLive(c)).length,
      color: "text-yellow-500",
    },
    {
      label: "Ended",
      value: contests.filter((c) => hasContestEnded(c)).length,
      color: "text-gray-500",
    },
  ];

  const handleCreate = () => {
    const requestData = {
      name: formData.name,
      platform: formData.platform,
      startTime: new Date(formData.startTime).toISOString(),
      duration: formData.duration,
      isRated: formData.isRated !== undefined ? formData.isRated : true,
      ...(formData.externalId && { externalId: formData.externalId }),
    };

    createMutation.mutate(requestData as unknown as Contest);
  };

  const handleEdit = () => {
    if (!selectedContest) return;
    const requestData = {
      name: formData.name,
      platform: formData.platform,
      startTime: new Date(formData.startTime).toISOString(),
      duration: formData.duration,
      ...(formData.externalId && { externalId: formData.externalId }),
      ...(formData.isRated !== undefined && { isRated: formData.isRated }),
    };

    updateMutation.mutate({
      id: selectedContest.id,
      data: requestData as unknown as Contest,
    });
  };

  const handleDelete = () => {
    if (!selectedContest) return;
    deleteMutation.mutate(selectedContest.id);
  };

  const handleSyncStandings = (contestId: string) => {
    syncStandingsMutation.mutate(contestId);
  };

  const openEditDialog = (contest: Contest) => {
    setSelectedContest(contest);
    setFormData({
      name: contest.name,
      platform: contest.platform,
      externalId: contest.externalId || "",
      startTime: contest.startTime,
      duration: contest.duration,
      isRated: contest.isRated,
    });
    setIsEditDialogOpen(true);
  };

  const openDeleteDialog = (contest: Contest) => {
    setSelectedContest(contest);
    setIsDeleteDialogOpen(true);
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Loading size="lg" label="Loading contests..." />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">
            Contest Management
          </h1>
          <p className="text-muted-foreground mt-1">
            Manage and track coding contests
          </p>
        </div>
        <Button onClick={() => setIsCreateDialogOpen(true)} className="gap-2">
          <Plus className="w-4 h-4" />
          Add Contest
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {stats.map((stat) => (
          <Card key={stat.label} className="bg-card border-border shadow-sm">
            <CardContent className="p-6">
              <p className="text-sm text-muted-foreground">{stat.label}</p>
              <p className={`text-3xl font-bold mt-2 ${stat.color}`}>
                {stat.value}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Filters & Table */}
      <Card className="bg-card border-border shadow-sm">
        <CardHeader>
          <CardTitle className="text-foreground">Contests</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search contests..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9 bg-background border-border"
              />
            </div>
            <Select
              value={platformFilter}
              onValueChange={(v) => setPlatformFilter(v as Platform | "ALL")}
            >
              <SelectTrigger className="w-full md:w-[180px] bg-background border-border">
                <SelectValue placeholder="Platform" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">All Platforms</SelectItem>
                <SelectItem value="CODEFORCES">Codeforces</SelectItem>
                <SelectItem value="LEETCODE">LeetCode</SelectItem>
                <SelectItem value="CUSTOM">Custom</SelectItem>
              </SelectContent>
            </Select>
            <Select
              value={statusFilter}
              onValueChange={(v) => setStatusFilter(v as typeof statusFilter)}
            >
              <SelectTrigger className="w-full md:w-[180px] bg-background border-border">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">All Status</SelectItem>
                <SelectItem value="UPCOMING">Upcoming</SelectItem>
                <SelectItem value="LIVE">Live</SelectItem>
                <SelectItem value="COMPLETED">Completed</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Table */}
          <div className="border border-border rounded-lg">
            <Table>
              <TableHeader>
                <TableRow className="hover:bg-muted/50">
                  <TableHead className="text-muted-foreground">
                    Contest
                  </TableHead>
                  <TableHead className="text-muted-foreground">
                    Platform
                  </TableHead>
                  <TableHead className="text-muted-foreground">
                    Start Time
                  </TableHead>
                  <TableHead className="text-muted-foreground">
                    Duration
                  </TableHead>
                  <TableHead className="text-muted-foreground">
                    Status
                  </TableHead>
                  <TableHead className="text-muted-foreground">
                    Participants
                  </TableHead>
                  <TableHead className="text-right text-muted-foreground">
                    Actions
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {contests.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={7}
                      className="text-center py-8 text-muted-foreground"
                    >
                      No contests found
                    </TableCell>
                  </TableRow>
                ) : (
                  contests.map((contest) => {
                    const computedStatus = getComputedStatus(contest);
                    const canEdit = computedStatus === "UPCOMING";

                    return (
                      <TableRow key={contest.id} className="hover:bg-muted/50">
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Trophy className="w-4 h-4 text-yellow-500" />
                            <div>
                              <p className="font-medium text-foreground">
                                {contest.name}
                              </p>
                              <p className="text-xs text-muted-foreground">
                                ID: {contest.externalId}
                              </p>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge className={platformColors[contest.platform]}>
                            {contest.platform}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-foreground">
                          <div className="text-sm">
                            <p>
                              {format(
                                new Date(contest.startTime),
                                "MMM dd, yyyy"
                              )}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {format(new Date(contest.startTime), "HH:mm")}
                            </p>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1 text-sm text-foreground">
                            <Clock className="w-3 h-3 text-muted-foreground" />
                            {contest.duration} min
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Badge className={statusColors[computedStatus]}>
                              {computedStatus}
                            </Badge>
                            {contest.isRated && (
                              <Badge
                                variant="outline"
                                className="text-xs bg-yellow-500/10 text-yellow-500 border-yellow-500/20"
                              >
                                Rated
                              </Badge>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1 text-sm text-foreground">
                            <Users className="w-3 h-3 text-muted-foreground" />
                            {contest.participantCount || 0}
                          </div>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-2">
                            {computedStatus === "ENDED" && (
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleSyncStandings(contest.id)}
                                className="h-8 px-2 gap-1 text-blue-500 hover:text-blue-600 hover:bg-blue-500/10"
                                title="Sync Standings"
                                disabled={syncStandingsMutation.isPending}
                              >
                                <RefreshCw className="w-4 h-4" />
                              </Button>
                            )}
                            {canEdit && (
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => openEditDialog(contest)}
                                className="h-8 w-8 p-0"
                                title="Edit Contest"
                              >
                                <Pencil className="w-4 h-4" />
                              </Button>
                            )}
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => openDeleteDialog(contest)}
                              className="h-8 w-8 p-0 text-red-500 hover:text-red-600 hover:bg-red-500/10"
                              title="Delete Contest"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Create Dialog */}
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent className="max-w-2xl bg-card border-border">
          <DialogHeader>
            <DialogTitle className="text-foreground">
              Add New Contest
            </DialogTitle>
            <DialogDescription className="text-muted-foreground">
              Enter contest details to add to the platform
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="name" className="text-foreground">
                Contest Name
              </Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                className="bg-background border-border"
                placeholder="e.g., Codeforces Round #918"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="platform" className="text-foreground">
                  Platform
                </Label>
                <Select
                  value={formData.platform}
                  onValueChange={(v) =>
                    setFormData({ ...formData, platform: v as Platform })
                  }
                >
                  <SelectTrigger className="bg-background border-border">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="CODEFORCES">Codeforces</SelectItem>
                    <SelectItem value="LEETCODE">LeetCode</SelectItem>
                    <SelectItem value="ATCODER">AtCoder</SelectItem>
                    <SelectItem value="CODECHEF">CodeChef</SelectItem>
                    <SelectItem value="OTHER">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="externalId" className="text-foreground">
                  External ID
                </Label>
                <Input
                  id="externalId"
                  value={formData.externalId}
                  onChange={(e) =>
                    setFormData({ ...formData, externalId: e.target.value })
                  }
                  className="bg-background border-border"
                  placeholder="e.g., 1918 (optional)"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="startTime" className="text-foreground">
                  Start Time
                </Label>
                <Input
                  id="startTime"
                  type="datetime-local"
                  value={
                    formData.startTime ? formData.startTime.slice(0, 16) : ""
                  }
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      startTime: new Date(e.target.value).toISOString(),
                    })
                  }
                  className="bg-background border-border"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="duration" className="text-foreground">
                  Duration (minutes)
                </Label>
                <Input
                  id="duration"
                  type="number"
                  value={formData.duration}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      duration: parseInt(e.target.value) || 0,
                    })
                  }
                  className="bg-background border-border"
                  placeholder="120"
                />
              </div>
            </div>
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="isRated"
                checked={formData.isRated}
                onChange={(e) =>
                  setFormData({ ...formData, isRated: e.target.checked })
                }
                className="w-4 h-4"
              />
              <Label
                htmlFor="isRated"
                className="text-foreground cursor-pointer"
              >
                Rated Contest
              </Label>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsCreateDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button
              onClick={handleCreate}
              disabled={!formData.name || createMutation.isPending}
            >
              {createMutation.isPending ? "Creating..." : "Add Contest"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-2xl bg-card border-border">
          <DialogHeader>
            <DialogTitle className="text-foreground">Edit Contest</DialogTitle>
            <DialogDescription className="text-muted-foreground">
              Update contest details
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="edit-name" className="text-foreground">
                Contest Name
              </Label>
              <Input
                id="edit-name"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                className="bg-background border-border"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="edit-platform" className="text-foreground">
                  Platform
                </Label>
                <Select
                  value={formData.platform}
                  onValueChange={(v) =>
                    setFormData({ ...formData, platform: v as Platform })
                  }
                >
                  <SelectTrigger className="bg-background border-border">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="CODEFORCES">Codeforces</SelectItem>
                    <SelectItem value="LEETCODE">LeetCode</SelectItem>
                    <SelectItem value="CUSTOM">Custom</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="edit-externalId" className="text-foreground">
                  External ID
                </Label>
                <Input
                  id="edit-externalId"
                  value={formData.externalId}
                  onChange={(e) =>
                    setFormData({ ...formData, externalId: e.target.value })
                  }
                  className="bg-background border-border"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="edit-startTime" className="text-foreground">
                  Start Time
                </Label>
                <Input
                  id="edit-startTime"
                  type="datetime-local"
                  value={
                    formData.startTime ? formData.startTime.slice(0, 16) : ""
                  }
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      startTime: new Date(e.target.value).toISOString(),
                    })
                  }
                  className="bg-background border-border"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="edit-duration" className="text-foreground">
                  Duration (minutes)
                </Label>
                <Input
                  id="edit-duration"
                  type="number"
                  value={formData.duration}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      duration: parseInt(e.target.value) || 0,
                    })
                  }
                  className="bg-background border-border"
                />
              </div>
            </div>
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="edit-isRated"
                checked={formData.isRated}
                onChange={(e) =>
                  setFormData({ ...formData, isRated: e.target.checked })
                }
                className="w-4 h-4"
              />
              <Label
                htmlFor="edit-isRated"
                className="text-foreground cursor-pointer"
              >
                Rated Contest
              </Label>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsEditDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button onClick={handleEdit} disabled={updateMutation.isPending}>
              {updateMutation.isPending ? "Saving..." : "Save Changes"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent className="bg-card border-border">
          <DialogHeader>
            <DialogTitle className="text-foreground">
              Delete Contest
            </DialogTitle>
            <DialogDescription className="text-muted-foreground">
              Are you sure you want to delete &quot;{selectedContest?.name}
              &quot;? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsDeleteDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={deleteMutation.isPending}
            >
              {deleteMutation.isPending ? "Deleting..." : "Delete"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
