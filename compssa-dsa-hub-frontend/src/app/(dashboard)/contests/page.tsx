"use client";

import { useState, useEffect, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuthStore } from "@/lib/stores/authStore";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Calendar, Clock, Search, BarChart3, CheckCircle2 } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import {
  getContests,
  getUserContests,
  registerForContest,
  Contest,
  ContestParticipation,
} from "@/lib/api";
import { Loading } from "@/components/common/Loading";
import { EmptyState } from "@/components/common/EmptyState";
import { Pagination } from "@/components/common/Pagination";
import { toast } from "sonner";

// ============================================================================
// HELPERS
// ============================================================================

// Extract user ID from potentially corrupted store data
// The store sometimes has {success: true, data: {...}} instead of just the user
function extractUserId(user: unknown): string | null {
  if (!user) return null;

  // Normal case: user.id exists directly
  if (
    typeof user === "object" &&
    "id" in user &&
    typeof (user as { id: unknown }).id === "string"
  ) {
    return (user as { id: string }).id;
  }

  // Corrupted case: user is wrapped in API response {success: true, data: {id: ...}}
  if (typeof user === "object" && "data" in user) {
    const data = (user as { data: unknown }).data;
    if (typeof data === "object" && data && "id" in data) {
      return (data as { id: string }).id;
    }
  }

  return null;
}

function formatDuration(minutes: number): string {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;
}

function formatDate(dateString: string) {
  const date = new Date(dateString);
  return {
    month: date.toLocaleDateString("en-US", { month: "short" }).toUpperCase(),
    day: date.getDate().toString(),
  };
}

// Check if contest has ended (startTime + duration has passed)
function hasContestEnded(startTime: string, durationMinutes: number): boolean {
  const endTime = new Date(startTime).getTime() + durationMinutes * 60 * 1000;
  return Date.now() > endTime;
}

type ContestStatus = "UPCOMING" | "LIVE" | "COMPLETED";
type Platform = "LEETCODE" | "CODEFORCES" | "CUSTOM";
type TabValue = "upcoming" | "my-contests" | "past";

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export default function ContestsPage() {
  const { user } = useAuthStore();
  const queryClient = useQueryClient();

  // UI State
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedPlatform, setSelectedPlatform] = useState("all");
  const [activeTab, setActiveTab] = useState<TabValue>("upcoming");
  const [page, setPage] = useState(1);
  const [optimisticallyRegistered, setOptimisticallyRegistered] = useState<
    Set<string>
  >(new Set());

  // Extract user ID (handles both normal and corrupted store data)
  const userId = useMemo(() => extractUserId(user), [user]);

  // Build query params based on current filters
  const queryParams = useMemo(() => {
    const platformFilter =
      selectedPlatform !== "all"
        ? (selectedPlatform.toUpperCase() as Platform)
        : undefined;

    return {
      upcoming: {
        status: "UPCOMING" as ContestStatus,
        platform: platformFilter,
        page,
        limit: 10,
      },
      completed: {
        status: "COMPLETED" as ContestStatus,
        platform: platformFilter,
        page,
        limit: 10,
      },
    };
  }, [selectedPlatform, page]);

  // ============================================================================
  // DATA FETCHING
  // ============================================================================

  // Fetch contests (upcoming or past based on tab)
  const { data: contestsData, isLoading: contestsLoading } = useQuery({
    queryKey: [
      "contests",
      activeTab === "past" ? "completed" : "upcoming",
      queryParams,
    ],
    queryFn: () =>
      getContests(
        activeTab === "past" ? queryParams.completed : queryParams.upcoming
      ),
    enabled: activeTab !== "my-contests",
  });

  // Fetch user's registered contests - this is key for showing registration status
  const { data: userContestsData, isLoading: userContestsLoading } = useQuery({
    queryKey: ["userContests", userId],
    queryFn: () => getUserContests(userId!),
    enabled: !!userId,
  });

  // ============================================================================
  // DERIVED DATA
  // ============================================================================

  // Build set of contest IDs user is registered for
  const registeredContestIds = useMemo(() => {
    const ids = new Set<string>();

    if (Array.isArray(userContestsData)) {
      userContestsData.forEach((p: ContestParticipation) => {
        if (p?.contestId) ids.add(p.contestId);
      });
    }

    // Include optimistically registered contests for instant UI feedback
    optimisticallyRegistered.forEach((id) => ids.add(id));

    return ids;
  }, [userContestsData, optimisticallyRegistered]);

  // Extract contests from participations for "My Contests" tab
  const myContests = useMemo(() => {
    if (!Array.isArray(userContestsData)) return [];
    return userContestsData
      .map((p: ContestParticipation) => p.contest)
      .filter(Boolean);
  }, [userContestsData]);

  // Get contests to display based on active tab and search filter
  const displayedContests = useMemo(() => {
    let contests: Contest[] = [];

    if (activeTab === "my-contests") {
      contests = myContests;
    } else {
      contests = contestsData?.data || [];
    }

    // Apply search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      contests = contests.filter((c) => c.name.toLowerCase().includes(query));
    }

    return contests;
  }, [activeTab, myContests, contestsData?.data, searchQuery]);

  // Featured contest for hero section
  const featuredContest =
    activeTab === "upcoming" && displayedContests.length > 0
      ? displayedContests[0]
      : null;

  // ============================================================================
  // COUNTDOWN TIMER
  // ============================================================================

  const [countdown, setCountdown] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
  });

  useEffect(() => {
    if (!featuredContest) return;

    const updateCountdown = () => {
      const diff = new Date(featuredContest.startTime).getTime() - Date.now();

      if (diff <= 0) {
        setCountdown({ days: 0, hours: 0, minutes: 0, seconds: 0 });
        return;
      }

      setCountdown({
        days: Math.floor(diff / (1000 * 60 * 60 * 24)),
        hours: Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
        minutes: Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60)),
        seconds: Math.floor((diff % (1000 * 60)) / 1000),
      });
    };

    updateCountdown();
    const interval = setInterval(updateCountdown, 1000);
    return () => clearInterval(interval);
  }, [featuredContest]);

  // ============================================================================
  // MUTATIONS
  // ============================================================================

  const registerMutation = useMutation({
    mutationFn: (contestId: string) => {
      // Optimistic update for instant feedback
      setOptimisticallyRegistered((prev) => new Set(prev).add(contestId));
      return registerForContest(contestId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["userContests"] });
      queryClient.invalidateQueries({ queryKey: ["contests"] });
      toast.success("Successfully registered for contest");
    },
    onError: (
      error: { response?: { status?: number; data?: { error?: string } } },
      contestId: string
    ) => {
      const errorMessage = error.response?.data?.error || "Failed to register";

      // Handle "already registered" as success
      if (
        error.response?.status === 409 ||
        errorMessage.toLowerCase().includes("already registered")
      ) {
        queryClient.invalidateQueries({ queryKey: ["userContests"] });
        toast.success("You are already registered for this contest");
        return;
      }

      // Rollback optimistic update on error
      setOptimisticallyRegistered((prev) => {
        const next = new Set(prev);
        next.delete(contestId);
        return next;
      });
      toast.error(errorMessage);
    },
  });

  // ============================================================================
  // EFFECTS
  // ============================================================================

  // Reset page when changing tabs
  useEffect(() => {
    setPage(1);
  }, [activeTab]);

  // ============================================================================
  // RENDER
  // ============================================================================

  const isLoading = contestsLoading || userContestsLoading;
  const paginationMeta = contestsData?.meta;

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-foreground">Contests</h1>
          <Button
            variant="outline"
            className="border-border text-foreground hover:bg-foreground/5"
          >
            <Calendar className="w-4 h-4 mr-2" />
            Sync Calendar
          </Button>
        </div>

        {/* Featured Contest Hero */}
        {featuredContest && (
          <FeaturedContestCard
            contest={featuredContest}
            countdown={countdown}
            isRegistered={registeredContestIds.has(featuredContest.id)}
            onRegister={() => registerMutation.mutate(featuredContest.id)}
            isRegistering={registerMutation.isPending}
          />
        )}

        {/* Tabs */}
        <Tabs
          value={activeTab}
          onValueChange={(v) => setActiveTab(v as TabValue)}
        >
          <TabsList className="bg-transparent border-b border-white/10 rounded-none w-full justify-start p-0 h-auto">
            <TabsTrigger
              value="upcoming"
              className="data-[state=active]:bg-transparent data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none pb-3 text-muted-foreground data-[state=active]:text-foreground"
            >
              Upcoming
            </TabsTrigger>
            <TabsTrigger
              value="my-contests"
              className="data-[state=active]:bg-transparent data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none pb-3 text-muted-foreground data-[state=active]:text-foreground"
            >
              My Contests
            </TabsTrigger>
            <TabsTrigger
              value="past"
              className="data-[state=active]:bg-transparent data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none pb-3 text-muted-foreground data-[state=active]:text-foreground"
            >
              Past & Virtual
            </TabsTrigger>
          </TabsList>

          <TabsContent value={activeTab} className="mt-6 space-y-6">
            {/* Filters */}
            <div className="flex items-center gap-3">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  type="text"
                  placeholder="Filter contests..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full h-10 pl-10 pr-4 bg-card border-border"
                />
              </div>
              <Select
                value={selectedPlatform}
                onValueChange={setSelectedPlatform}
              >
                <SelectTrigger className="w-[180px] border-border bg-card">
                  <SelectValue placeholder="Platform" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Platform: All</SelectItem>
                  <SelectItem value="leetcode">LeetCode</SelectItem>
                  <SelectItem value="codeforces">Codeforces</SelectItem>
                  <SelectItem value="custom">Custom</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Contest List */}
            {isLoading ? (
              <Loading size="lg" label="Loading contests..." />
            ) : displayedContests.length === 0 ? (
              <EmptyState
                title="No contests found"
                description="Try adjusting your filters or check back later for new contests."
              />
            ) : (
              <>
                <div className="space-y-3">
                  {displayedContests.map((contest) => (
                    <ContestCard
                      key={contest.id}
                      contest={contest}
                      isRegistered={registeredContestIds.has(contest.id)}
                      onRegister={() => registerMutation.mutate(contest.id)}
                      isRegistering={registerMutation.isPending}
                    />
                  ))}
                </div>

                {/* Pagination */}
                {paginationMeta &&
                  paginationMeta.totalPages > 1 &&
                  activeTab !== "my-contests" && (
                    <div className="flex justify-center pt-6">
                      <Pagination
                        page={paginationMeta.page}
                        pageCount={paginationMeta.totalPages}
                        onPageChange={setPage}
                      />
                    </div>
                  )}
              </>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

// ============================================================================
// SUB-COMPONENTS
// ============================================================================

function FeaturedContestCard({
  contest,
  countdown,
  isRegistered,
  onRegister,
  isRegistering,
}: {
  contest: Contest;
  countdown: { days: number; hours: number; minutes: number; seconds: number };
  isRegistered: boolean;
  onRegister: () => void;
  isRegistering: boolean;
}) {
  const countdownItems = [
    { value: countdown.days, label: "Days" },
    { value: countdown.hours, label: "Hrs" },
    { value: countdown.minutes, label: "Min" },
    { value: countdown.seconds, label: "Sec" },
  ];

  return (
    <Card className="bg-gradient-to-br from-blue-900/40 to-blue-950/40 border-blue-500/20 overflow-hidden">
      <CardContent className="p-8">
        <div className="flex items-start justify-between">
          <div className="space-y-4 flex-1">
            <Badge className="bg-blue-500/20 text-blue-400 border-0">
              Up Next
            </Badge>
            <div className="space-y-1">
              <p className="text-sm text-blue-300">
                Starts {new Date(contest.startTime).toLocaleString()}
              </p>
              <h2 className="text-3xl font-bold text-foreground">
                {contest.name}
              </h2>
            </div>
            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <span className="flex items-center gap-2">
                <span className="text-yellow-500">⚡</span>
                {contest.platform}
              </span>
              <span className="flex items-center gap-2">
                <Clock className="w-4 h-4" />
                {formatDuration(contest.duration)} duration
              </span>
            </div>
            <div className="flex gap-3 pt-2">
              {hasContestEnded(contest.startTime, contest.duration) ? (
                <Badge className="bg-muted text-muted-foreground border-0 px-4 py-2">
                  Ended
                </Badge>
              ) : isRegistered ? (
                <Badge className="bg-green-500/20 text-green-400 border-0 px-4 py-2">
                  ✓ Registered
                </Badge>
              ) : (
                <Button
                  className="bg-primary hover:bg-primary/90 text-primary-foreground"
                  onClick={onRegister}
                  disabled={isRegistering}
                >
                  {isRegistering ? "Registering..." : "Register Now"}
                </Button>
              )}
            </div>
          </div>

          {/* Countdown Timer */}
          <div className="flex items-center gap-4">
            {countdownItems.map((item, i) => (
              <div key={item.label} className="flex items-center gap-4">
                {i > 0 && (
                  <span className="text-2xl text-muted-foreground/50">:</span>
                )}
                <div className="text-center">
                  <div className="text-4xl font-bold text-foreground">
                    {item.value.toString().padStart(2, "0")}
                  </div>
                  <div className="text-xs text-muted-foreground uppercase mt-1">
                    {item.label}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function ContestCard({
  contest,
  isRegistered,
  onRegister,
  isRegistering,
}: {
  contest: Contest;
  isRegistered: boolean;
  onRegister: () => void;
  isRegistering: boolean;
}) {
  const date = formatDate(contest.startTime);

  return (
    <Card className="bg-card border-border hover:border-primary/50 transition-colors">
      <CardContent className="p-5">
        <div className="flex items-center gap-4">
          {/* Date Badge */}
          <div className="flex-shrink-0 w-16 h-16 bg-primary rounded-lg flex flex-col items-center justify-center">
            <div className="text-xs text-primary-foreground font-medium">
              {date.month}
            </div>
            <div className="text-2xl font-bold text-primary-foreground">
              {date.day}
            </div>
          </div>

          {/* Icon */}
          <div className="flex-shrink-0">
            <div className="w-10 h-10 rounded-lg bg-foreground/5 flex items-center justify-center">
              <BarChart3 className="w-5 h-5 text-muted-foreground" />
            </div>
          </div>

          {/* Contest Info */}
          <div className="flex-1 min-w-0">
            <h3 className="text-foreground font-medium mb-2">{contest.name}</h3>
            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <span className="flex items-center gap-1.5">
                <span className="text-yellow-500">⚡</span>
                {contest.platform}
              </span>
              <span className="flex items-center gap-1.5">
                <Clock className="w-4 h-4" />
                {formatDuration(contest.duration)}
              </span>
            </div>
            <div className="flex items-center gap-4 text-xs text-muted-foreground/75 mt-1">
              <span>{new Date(contest.startTime).toLocaleString()}</span>
              {contest.participantCount > 0 && (
                <span>
                  • {contest.participantCount.toLocaleString()} participants
                </span>
              )}
            </div>
            {isRegistered && (
              <div className="flex items-center gap-1.5 mt-2">
                <CheckCircle2 className="w-4 h-4 text-green-500" />
                <span className="text-sm text-green-500">Registered</span>
              </div>
            )}
          </div>

          {/* Action Button */}
          <div className="flex-shrink-0">
            {hasContestEnded(contest.startTime, contest.duration) ? (
              <Badge className="bg-muted text-muted-foreground border-0 px-4 py-2">
                Ended
              </Badge>
            ) : isRegistered ? (
              <Badge className="bg-green-500/20 text-green-500 border-0 px-4 py-2">
                ✓ Registered
              </Badge>
            ) : contest.status === "UPCOMING" ? (
              <Button
                className="bg-primary hover:bg-primary/90 text-primary-foreground"
                onClick={onRegister}
                disabled={isRegistering}
              >
                {isRegistering ? "Registering..." : "Register"}
              </Button>
            ) : (
              <Badge className="bg-muted text-muted-foreground border-0 px-4 py-2">
                {contest.status}
              </Badge>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
