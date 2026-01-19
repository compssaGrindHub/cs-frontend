"use client";

import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useAuthStore } from "@/lib/stores/authStore";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  CheckCircle2,
  Flame,
  Trophy,
  ArrowRight,
  Code2,
  BarChart3,
  Clock,
} from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { Loading } from "@/components/common/Loading";
import { EmptyState } from "@/components/common/EmptyState";
import Link from "next/link";
import {
  getCurrentUser,
  getUserStats,
  getUserRank,
  getDailyQuestion,
  getUpcomingContests,
  getUserSubmissions,
  getUserProgress,
} from "@/lib/api";
import { formatDistanceToNow } from "date-fns";
import { toast } from "sonner";

export default function DashboardPage() {
  const { user: currentUser, isAuthenticated } = useAuthStore();

  // Fetch user data (optional - use store user as fallback)
  const {
    data: userData,
    isLoading: userLoading,
    error: userError,
  } = useQuery({
    queryKey: ["currentUser"],
    queryFn: () => getCurrentUser(),
    enabled: isAuthenticated && !!currentUser,
    retry: 1,
  });

  // Fetch user stats
  const {
    data: userStats,
    isLoading: statsLoading,
    error: statsError,
  } = useQuery({
    queryKey: ["userStats", currentUser?.id],
    queryFn: () => getUserStats(currentUser?.id || ""),
    enabled: !!currentUser?.id,
    retry: 1,
  });

  // Fetch user rank
  const { data: rankData, isLoading: rankLoading } = useQuery({
    queryKey: ["userRank", currentUser?.id],
    queryFn: () => getUserRank(currentUser?.id || ""),
    enabled: !!currentUser?.id,
    retry: 1,
  });

  // Fetch daily question
  const { data: dailyQuestion, isLoading: dailyLoading } = useQuery({
    queryKey: ["dailyQuestion"],
    queryFn: () => getDailyQuestion(),
  });

  // Fetch upcoming contests
  const { data: contestsData, isLoading: contestsLoading } = useQuery({
    queryKey: ["upcomingContests"],
    queryFn: () => getUpcomingContests(3),
  });

  // Fetch recent submissions
  const { data: submissionsData, isLoading: submissionsLoading } = useQuery({
    queryKey: ["recentSubmissions", currentUser?.id],
    queryFn: () =>
      getUserSubmissions(currentUser?.id || "", { page: 1, limit: 5 }),
    enabled: !!currentUser?.id,
  });

  // Fetch user progress
  const { data: progressData, isLoading: progressLoading } = useQuery({
    queryKey: ["userProgress", currentUser?.id],
    queryFn: () => getUserProgress(currentUser?.id || ""),
    enabled: !!currentUser?.id,
  });

  // Show toast error when dashboard data fails to load
  useEffect(() => {
    if (userError || statsError) {
      toast.error("Failed to load some dashboard data", {
        description: "Some information may not be available",
      });
    }
  }, [userError, statsError]);

  const isLoading =
    userLoading ||
    statsLoading ||
    rankLoading ||
    dailyLoading ||
    contestsLoading ||
    submissionsLoading ||
    progressLoading;

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background p-6">
        <Loading size="lg" label="Loading dashboard..." />
      </div>
    );
  }

  // Use user from API response if available, otherwise fall back to store
  const user = userData?.data || currentUser;
  const stats = userStats;
  const userRank = rankData?.rank || 0;
  const daily = dailyQuestion?.data;
  // getUpcomingContests already returns the array (extracts response.data.data)
  const upcomingContests = contestsData || [];
  // getUserSubmissions returns { data: [], meta: {} } directly (not wrapped in ApiResponse)
  const recentSubmissions = submissionsData?.data || [];
  const progress = progressData?.topics || [];

  // Calculate derived stats
  const totalProblems = stats?.totalProblems || 0;
  const solvedProblems = stats?.solvedProblems || 0;
  const contestsParticipated = stats?.contestsParticipated || 0;
  const currentStreak = user?.currentStreak || 0;
  const totalRating = user?.totalRating || 0;
  const totalMinutesSpent = stats?.totalMinutesSpent || 0;
  const hoursSpent = Math.floor(totalMinutesSpent / 60);
  const minutesSpent = totalMinutesSpent % 60;

  return (
    <div className="min-h-screen bg-background p-4 md:p-6">
      <div className="max-w-7xl mx-auto space-y-4 md:space-y-6">
        {/* Top Stats Row */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6">
          {/* Global Rank & Rating Combined Card */}
          <Card className="bg-card border-border lg:col-span-2">
            <CardContent className="p-4 md:p-6">
              <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 md:gap-6">
                <div className="flex-1 space-y-4">
                  <div className="grid grid-cols-2 gap-4 md:gap-6">
                    {/* Global Rank */}
                    <div>
                      <p className="text-sm text-muted-foreground mb-1">
                        Global Rank
                      </p>
                      <div className="flex items-baseline gap-2">
                        <h2 className="text-2xl md:text-3xl font-bold text-foreground">
                          #{userRank || "--"}
                        </h2>
                        <span className="text-sm text-muted-foreground hidden sm:inline">
                          users
                        </span>
                      </div>
                    </div>
                    {/* Rating */}
                    <div>
                      <p className="text-sm text-muted-foreground mb-1">
                        Rating
                      </p>
                      <div className="flex items-baseline gap-2">
                        <h2 className="text-2xl md:text-3xl font-bold text-foreground">
                          {totalRating.toLocaleString()}
                        </h2>
                      </div>
                    </div>
                  </div>
                  <div className="flex flex-col sm:flex-row gap-2">
                    {daily && (
                      <Link href={`/problems/${daily.slug}`} className="flex-1">
                        <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white text-sm">
                          Start Daily Challenge
                        </Button>
                      </Link>
                    )}
                    <Link href="/profile" className="flex-1">
                      <Button variant="outline" className="w-full text-sm">
                        View Profile
                      </Button>
                    </Link>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Daily Challenge Card */}
          {daily ? (
            <Card className="bg-gradient-to-br from-orange-500/20 to-orange-600/10 border-orange-500/20">
              <CardContent className="p-6">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <Badge className="bg-orange-500/20 text-orange-500 border-0 mb-2">
                        Daily Challenge
                      </Badge>
                      <p className="text-sm text-gray-400">
                        {daily.dailyDate
                          ? formatDistanceToNow(new Date(daily.dailyDate), {
                              addSuffix: true,
                            })
                          : "Today"}
                      </p>
                    </div>
                  </div>
                  <div>
                    <h3 className="text-white font-semibold mb-1">
                      {daily.title}
                    </h3>
                    <div className="flex items-center gap-2 mb-3 flex-wrap">
                      <Badge
                        variant="outline"
                        className={`border-${
                          daily.difficulty === "HARD"
                            ? "red"
                            : daily.difficulty === "MEDIUM"
                              ? "yellow"
                              : "green"
                        }-500/50 text-${
                          daily.difficulty === "HARD"
                            ? "red"
                            : daily.difficulty === "MEDIUM"
                              ? "yellow"
                              : "green"
                        }-500 text-xs`}
                      >
                        {daily.difficulty}
                      </Badge>
                      {daily.topics.slice(0, 2).map((topic) => (
                        <Badge
                          key={topic}
                          variant="outline"
                          className="border-blue-500/50 text-blue-500 text-xs"
                        >
                          {topic}
                        </Badge>
                      ))}
                    </div>
                    <Link href={`/problems/${daily.slug}`}>
                      <Button
                        size="sm"
                        className="w-full bg-white text-black hover:bg-gray-200"
                      >
                        Solve Now <ArrowRight className="w-3 h-3 ml-1" />
                      </Button>
                    </Link>
                  </div>
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card className="bg-card border-border">
              <CardContent className="p-6">
                <div className="text-center">
                  <p className="text-sm text-muted-foreground">
                    No daily challenge available
                  </p>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
          {/* Problems */}
          <Card className="bg-card border-border">
            <CardContent className="p-4 md:p-6">
              <div className="flex items-start justify-between mb-2 md:mb-3">
                <p className="text-xs md:text-sm text-gray-400">Problems</p>
                <CheckCircle2 className="w-4 h-4 md:w-5 md:h-5 text-green-500" />
              </div>
              <div className="space-y-2">
                <div className="flex items-baseline gap-1 md:gap-2">
                  <h3 className="text-xl md:text-2xl font-bold text-foreground">
                    {solvedProblems}
                  </h3>
                  <span className="text-xs md:text-sm text-muted-foreground">
                    /{totalProblems}
                  </span>
                </div>
                <Progress
                  value={
                    totalProblems > 0
                      ? (solvedProblems / totalProblems) * 100
                      : 0
                  }
                  className="h-1.5 md:h-2"
                />
              </div>
            </CardContent>
          </Card>

          {/* Contest Rating */}
          <Card className="bg-card border-border">
            <CardContent className="p-4 md:p-6">
              <div className="flex items-start justify-between mb-2 md:mb-3">
                <p className="text-xs md:text-sm text-gray-400">Contests</p>
                <BarChart3 className="w-4 h-4 md:w-5 md:h-5 text-blue-500" />
              </div>
              <div className="space-y-2">
                <h3 className="text-xl md:text-2xl font-bold text-foreground">
                  {contestsParticipated}
                </h3>
                <p className="text-xs md:text-sm text-green-500">
                  Participated
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Current Streak */}
          <Card className="bg-card border-border">
            <CardContent className="p-4 md:p-6">
              <div className="flex items-start justify-between mb-2 md:mb-3">
                <p className="text-xs md:text-sm text-gray-400">
                  Current Streak
                </p>
                <Flame className="w-4 h-4 md:w-5 md:h-5 text-orange-500" />
              </div>
              <div className="space-y-2">
                <h3 className="text-xl md:text-2xl font-bold text-foreground">
                  {currentStreak} days
                </h3>
                <Progress
                  value={Math.min((currentStreak / 30) * 100, 100)}
                  className="h-1.5 md:h-2 bg-orange-900/20"
                />
              </div>
            </CardContent>
          </Card>

          {/* Time Spent */}
          <Card className="bg-card border-border">
            <CardContent className="p-4 md:p-6">
              <div className="flex items-start justify-between mb-2 md:mb-3">
                <p className="text-xs md:text-sm text-gray-400">Time Spent</p>
                <Clock className="w-4 h-4 md:w-5 md:h-5 text-blue-500" />
              </div>
              <div className="space-y-2">
                <h3 className="text-xl md:text-2xl font-bold text-foreground">
                  {hoursSpent > 0
                    ? `${hoursSpent}h ${minutesSpent}m`
                    : `${minutesSpent}m`}
                </h3>
                <p className="text-xs text-muted-foreground">Total Time</p>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
          {/* Recent Activity */}
          <Card className="bg-card border-border">
            <CardContent className="p-6">
              <div className="flex items-center gap-2 mb-4">
                <Clock className="w-5 h-5 text-blue-500" />
                <h2 className="text-lg font-semibold text-foreground">
                  Recent Activity
                </h2>
              </div>
              <div className="space-y-4">
                {recentSubmissions.length > 0 ? (
                  recentSubmissions.slice(0, 5).map((submission) => (
                    <div
                      key={submission.id}
                      className="flex gap-3 pb-4 border-b border-white/5 last:border-0 last:pb-0"
                    >
                      <div
                        className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${
                          submission.status === "ACCEPTED"
                            ? "bg-green-500/20"
                            : "bg-red-500/20"
                        }`}
                      >
                        {submission.status === "ACCEPTED" ? (
                          <CheckCircle2 className="w-4 h-4 text-green-500" />
                        ) : (
                          <Code2 className="w-4 h-4 text-red-500" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-foreground">
                          {submission.status === "ACCEPTED"
                            ? "Solved"
                            : "Attempted"}{" "}
                          &quot;{submission.problem?.title || "Problem"}&quot;
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {submission.problem?.difficulty} •{" "}
                          {submission.language}
                        </p>
                        <p className="text-xs text-muted-foreground/70 mt-1">
                          {formatDistanceToNow(
                            new Date(submission.submissionTime),
                            { addSuffix: true },
                          )}
                        </p>
                      </div>
                    </div>
                  ))
                ) : (
                  <EmptyState
                    title="No recent activity"
                    description="Start solving problems to see your activity here."
                  />
                )}
              </div>
            </CardContent>
          </Card>

          {/* Upcoming Contests */}
          <Card className="bg-card border-border">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Trophy className="w-5 h-5 text-blue-500" />
                  <h2 className="text-lg font-semibold text-foreground">
                    Upcoming Contests
                  </h2>
                </div>
                <Link href="/contests">
                  <Button variant="link" className="text-blue-500 p-0 h-auto">
                    View All
                  </Button>
                </Link>
              </div>
              <div className="space-y-3">
                {upcomingContests.length > 0 ? (
                  upcomingContests.map((contest) => (
                    <div
                      key={contest.id}
                      className="p-4 rounded-lg bg-white/5 border border-white/5"
                    >
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <div
                              className={`w-2 h-2 rounded-full ${
                                contest.status === "LIVE"
                                  ? "bg-green-500"
                                  : "bg-blue-500"
                              }`}
                            />
                            <p className="text-sm font-medium text-foreground">
                              {contest.name}
                            </p>
                          </div>
                          <p className="text-xs text-muted-foreground ml-4">
                            {contest.platform}
                          </p>
                        </div>
                        <Link href={`/contests/${contest.id}`}>
                          <Button
                            size="sm"
                            variant="outline"
                            className="text-xs"
                          >
                            {contest.status === "LIVE" ? "Join" : "Register"}
                          </Button>
                        </Link>
                      </div>
                      <div className="ml-4 space-y-1">
                        <p className="text-xs text-muted-foreground">
                          {formatDistanceToNow(new Date(contest.startTime), {
                            addSuffix: true,
                          })}
                        </p>
                        <p className="text-xs text-muted-foreground/70">
                          ⏰ {new Date(contest.startTime).toLocaleString()}
                        </p>
                      </div>
                    </div>
                  ))
                ) : (
                  <EmptyState
                    title="No upcoming contests"
                    description="Check back later for new contests."
                  />
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Progress by Topic */}
        {progress.length > 0 && (
          <Card className="bg-card border-border">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-semibold text-foreground">
                  Progress by Topic
                </h2>
                <Link href="/profile">
                  <Button variant="link" className="text-blue-500 p-0 h-auto">
                    View All
                  </Button>
                </Link>
              </div>
              <div className="space-y-4">
                {progress.slice(0, 5).map((topic) => (
                  <div key={topic.name}>
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-sm text-foreground">{topic.name}</p>
                      <span className="text-sm text-muted-foreground">
                        {topic.solved}/{topic.total}
                      </span>
                    </div>
                    <Progress value={topic.percentage} className="h-2" />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
