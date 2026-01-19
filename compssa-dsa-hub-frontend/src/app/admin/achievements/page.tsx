"use client";

import { useState, useMemo } from "react";
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
import { Textarea } from "@/components/ui/textarea";
import { Plus, Search, Trash2, Award, TrendingUp } from "lucide-react";
import { getAchievements, createAchievement } from "@/lib/api";
import { Achievement, AchievementType } from "@/lib/api/achievements";
import { Loading } from "@/components/common/Loading";
import { toast } from "sonner";

const achievementTypes = [
  { value: "CONTEST_FIRST", label: "Contest First Place" },
  { value: "CONTEST_SECOND", label: "Contest Second Place" },
  { value: "CONTEST_THIRD", label: "Contest Third Place" },
  { value: "STREAK_7", label: "7-Day Streak" },
  { value: "STREAK_30", label: "30-Day Streak" },
  { value: "STREAK_100", label: "100-Day Streak" },
  { value: "TOPIC_MASTER", label: "Topic Master" },
  { value: "EARLY_BIRD", label: "Early Bird" },
  { value: "NIGHT_OWL", label: "Night Owl" },
  { value: "PERFECT_WEEK", label: "Perfect Week" },
];

const iconOptions = [
  "🔥",
  "⭐",
  "🏆",
  "💎",
  "🎯",
  "🚀",
  "💪",
  "🎖️",
  "👑",
  "⚡",
  "🌟",
  "🥇",
  "🥈",
  "🥉",
  "🎓",
  "📚",
];

const emptyAchievement = {
  name: "",
  description: "",
  icon: "🏆",
  type: "STREAK_7" as AchievementType,
  requirement: {},
};

export default function AdminAchievementsPage() {
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState("");
  const [typeFilter, setTypeFilter] = useState<AchievementType | "ALL">("ALL");
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedAchievement, setSelectedAchievement] =
    useState<Achievement | null>(null);
  const [formData, setFormData] = useState(emptyAchievement);
  const [requirementInput, setRequirementInput] = useState("");

  const { data: achievementsData, isLoading } = useQuery({
    queryKey: ["achievements"],
    queryFn: () => getAchievements(),
  });

  const achievements = useMemo(
    () => achievementsData?.data || [],
    [achievementsData?.data],
  );

  const filteredAchievements = useMemo(() => {
    return achievements.filter((achievement) => {
      const matchesSearch =
        achievement.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        achievement.description
          .toLowerCase()
          .includes(searchTerm.toLowerCase());
      const matchesType =
        typeFilter === "ALL" || achievement.type === typeFilter;
      return matchesSearch && matchesType;
    });
  }, [achievements, searchTerm, typeFilter]);

  const createMutation = useMutation({
    mutationFn: createAchievement,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["achievements"] });
      queryClient.refetchQueries({ queryKey: ["achievements"] });
      setIsCreateDialogOpen(false);
      setFormData(emptyAchievement);
      setRequirementInput("");
    },
  });

  const stats = [
    {
      label: "Total Achievements",
      value: achievements.length,
      color: "text-blue-500",
      icon: Award,
    },
    {
      label: "Achievement Types",
      value: new Set(achievements.map((a) => a.type)).size,
      color: "text-green-500",
      icon: TrendingUp,
    },
  ];

  const handleCreate = () => {
    try {
      const requirement = requirementInput.trim()
        ? JSON.parse(requirementInput)
        : {};
      createMutation.mutate({
        name: formData.name,
        description: formData.description,
        icon: formData.icon,
        type: formData.type,
        requirement,
      });
    } catch {
      toast.error("Invalid JSON format", {
        description:
          "Please check the requirement field and ensure it contains valid JSON",
      });
    }
  };

  const openDeleteDialog = (achievement: Achievement) => {
    setSelectedAchievement(achievement);
    setIsDeleteDialogOpen(true);
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Loading size="lg" label="Loading achievements..." />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">
            Achievement Management
          </h1>
          <p className="text-muted-foreground mt-1">
            Create and manage user achievements
          </p>
        </div>
        <Button onClick={() => setIsCreateDialogOpen(true)} className="gap-2">
          <Plus className="w-4 h-4" />
          Create Achievement
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <Card key={stat.label} className="bg-card border-border shadow-sm">
              <CardContent className="p-6">
                <div className="flex items-center gap-3">
                  <div className="p-3 rounded-lg bg-primary/10">
                    <Icon className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">
                      {stat.label}
                    </p>
                    <p className={`text-2xl font-bold ${stat.color}`}>
                      {stat.value}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Filters & Table */}
      <Card className="bg-card border-border shadow-sm">
        <CardHeader>
          <CardTitle className="text-foreground">Achievements</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search achievements..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9 bg-background border-border"
              />
            </div>
            <Select
              value={typeFilter}
              onValueChange={(v) => setTypeFilter(v as AchievementType | "ALL")}
            >
              <SelectTrigger className="w-full md:w-[220px] bg-background border-border">
                <SelectValue placeholder="Filter by type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">All Types</SelectItem>
                {achievementTypes.map((type) => (
                  <SelectItem key={type.value} value={type.value}>
                    {type.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Table */}
          <div className="border border-border rounded-lg">
            <Table>
              <TableHeader>
                <TableRow className="hover:bg-muted/50">
                  <TableHead className="text-muted-foreground">
                    Achievement
                  </TableHead>
                  <TableHead className="text-muted-foreground">Type</TableHead>
                  <TableHead className="text-muted-foreground">
                    Requirement
                  </TableHead>
                  <TableHead className="text-right text-muted-foreground">
                    Actions
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredAchievements.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={4}
                      className="text-center py-8 text-muted-foreground"
                    >
                      No achievements found
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredAchievements.map((achievement) => (
                    <TableRow
                      key={achievement.id}
                      className="hover:bg-muted/50"
                    >
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <div className="text-3xl">{achievement.icon}</div>
                          <div>
                            <p className="font-medium text-foreground">
                              {achievement.name}
                            </p>
                            <p className="text-sm text-muted-foreground">
                              {achievement.description}
                            </p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant="outline"
                          className="bg-primary/10 text-primary border-primary/20"
                        >
                          {achievementTypes.find(
                            (t) => t.value === achievement.type,
                          )?.label || achievement.type}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <code className="text-xs bg-muted px-2 py-1 rounded text-foreground">
                          {JSON.stringify(achievement.requirement)}
                        </code>
                      </TableCell>
                      <TableCell>
                        <span className="text-muted-foreground">-</span>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => openDeleteDialog(achievement)}
                            className="h-8 w-8 p-0 text-red-500 hover:text-red-600 hover:bg-red-500/10"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
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
              Create New Achievement
            </DialogTitle>
            <DialogDescription className="text-muted-foreground">
              Define a new achievement that users can unlock
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="name" className="text-foreground">
                Achievement Name
              </Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                className="bg-background border-border"
                placeholder="e.g., Week Warrior"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="description" className="text-foreground">
                Description
              </Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                className="bg-background border-border min-h-[80px]"
                placeholder="e.g., Maintain a 7-day solving streak"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="icon" className="text-foreground">
                  Icon
                </Label>
                <Select
                  value={formData.icon}
                  onValueChange={(v) => setFormData({ ...formData, icon: v })}
                >
                  <SelectTrigger className="bg-background border-border">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {iconOptions.map((icon) => (
                      <SelectItem key={icon} value={icon}>
                        <span className="text-2xl">{icon}</span>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="type" className="text-foreground">
                  Type
                </Label>
                <Select
                  value={formData.type}
                  onValueChange={(v) =>
                    setFormData({ ...formData, type: v as AchievementType })
                  }
                >
                  <SelectTrigger className="bg-background border-border">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {achievementTypes.map((type) => (
                      <SelectItem key={type.value} value={type.value}>
                        {type.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="requirement" className="text-foreground">
                Requirement (JSON)
              </Label>
              <Textarea
                id="requirement"
                value={requirementInput}
                onChange={(e) => setRequirementInput(e.target.value)}
                className="bg-background border-border min-h-[100px] font-mono text-sm"
                placeholder='{ "streakDays": 7 }'
              />
              <p className="text-xs text-muted-foreground">
                Example: {`{ "streakDays": 7 }`} or{" "}
                {`{ "problemsSolved": 100 }`}
              </p>
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
              disabled={
                !formData.name ||
                !formData.description ||
                createMutation.isPending
              }
            >
              {createMutation.isPending ? "Creating..." : "Create Achievement"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent className="bg-card border-border">
          <DialogHeader>
            <DialogTitle className="text-foreground">
              Delete Achievement
            </DialogTitle>
            <DialogDescription className="text-muted-foreground">
              Are you sure you want to delete &quot;{selectedAchievement?.name}
              &quot;? Users who unlocked this achievement will lose it.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsDeleteDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button variant="destructive" onClick={() => {}}>
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
