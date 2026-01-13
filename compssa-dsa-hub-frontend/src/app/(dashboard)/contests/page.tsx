"use client";

import { useState, useEffect, useMemo, useRef } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuthStore } from "@/lib/stores/authStore";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Calendar,
  Clock,
  Search,
  BarChart3,
  CheckCircle2,
  X,
  ExternalLink,
  Users,
  Trophy,
} from "lucide-react";
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
  getContestStandings,
  Contest,
  ContestParticipation,
  Standing,
} from "@/lib/api";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Loading } from "@/components/common/Loading";
import { EmptyState } from "@/components/common/EmptyState";
import { Pagination } from "@/components/common/Pagination";
import { toast } from "sonner";
import Link from "next/link";

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

// Check if contest has started
function hasContestStarted(startTime: string): boolean {
  return Date.now() >= new Date(startTime).getTime();
}

// Check if contest is currently live
function isContestLive(startTime: string, durationMinutes: number): boolean {
  return (
    hasContestStarted(startTime) && !hasContestEnded(startTime, durationMinutes)
  );
}

// Check if contest is upcoming (hasn't started yet)
function isContestUpcoming(startTime: string): boolean {
  return Date.now() < new Date(startTime).getTime();
}

// Get external contest URL based on platform
function getExternalContestUrl(
  platform: string,
  externalId?: string
): string | null {
  if (!externalId) return null;

  switch (platform.toUpperCase()) {
    case "CODEFORCES":
      return `https://codeforces.com/contest/${externalId}`;
    case "LEETCODE":
      return `https://leetcode.com/contest/${externalId}`;
    default:
      return null;
  }
}

type ContestStatus = "UPCOMING" | "LIVE" | "COMPLETED";
type Platform = "LEETCODE" | "CODEFORCES" | "CUSTOM";
type TabValue = "upcoming" | "my-contests" | "past";

// In-memory cache for contest standings to avoid refetching
const standingsCache = new Map<string, Standing[]>();

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

  // Selected contest for overlay
  const [selectedContest, setSelectedContest] = useState<Contest | null>(null);

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
      const allContests = contestsData?.data || [];

      // Filter based on computed status (not API status)
      if (activeTab === "upcoming") {
        // Show contests that haven't ended yet (upcoming or live)
        contests = allContests.filter(
          (c) => !hasContestEnded(c.startTime, c.duration)
        );
      } else if (activeTab === "past") {
        // Show contests that have ended
        contests = allContests.filter((c) =>
          hasContestEnded(c.startTime, c.duration)
        );
      } else {
        contests = allContests;
      }
    }

    // Apply search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      contests = contests.filter((c) => c.name.toLowerCase().includes(query));
    }

    return contests;
  }, [activeTab, myContests, contestsData?.data, searchQuery]);

  // Get truly upcoming contests (haven't started yet) for featured section
  const upcomingContests = useMemo(() => {
    const allContests = contestsData?.data || [];
    return allContests
      .filter((c) => isContestUpcoming(c.startTime))
      .sort(
        (a, b) =>
          new Date(a.startTime).getTime() - new Date(b.startTime).getTime()
      );
  }, [contestsData?.data]);

  // Featured contest - the closest upcoming contest
  const featuredContest =
    activeTab === "upcoming" && upcomingContests.length > 0
      ? upcomingContests[0]
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

        {/* Featured Contest Hero - Only show on upcoming tab */}
        {activeTab === "upcoming" &&
          !contestsLoading &&
          (featuredContest ? (
            <FeaturedContestCard
              contest={featuredContest}
              countdown={countdown}
              isRegistered={registeredContestIds.has(featuredContest.id)}
              onRegister={() => registerMutation.mutate(featuredContest.id)}
              isRegistering={registerMutation.isPending}
            />
          ) : (
            <Card className="bg-gradient-to-br from-muted/50 to-muted/30 border-border">
              <CardContent className="p-8 text-center">
                <div className="space-y-4">
                  <div className="w-16 h-16 mx-auto bg-muted rounded-full flex items-center justify-center">
                    <Calendar className="w-8 h-8 text-muted-foreground" />
                  </div>
                  <div className="space-y-2">
                    <h2 className="text-xl font-semibold text-foreground">
                      No Upcoming Contests
                    </h2>
                    <p className="text-muted-foreground max-w-md mx-auto">
                      There are no upcoming contests scheduled at the moment. In
                      the meantime, sharpen your skills with some practice
                      problems!
                    </p>
                  </div>
                  <Link href="/problems">
                    <Button className="bg-primary hover:bg-primary/90 text-primary-foreground mt-2">
                      Browse Practice Problems
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          ))}

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
                      onClick={() => setSelectedContest(contest)}
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

      {/* Contest Detail Overlay */}
      {selectedContest && (
        <ContestOverlay
          contest={selectedContest}
          isRegistered={registeredContestIds.has(selectedContest.id)}
          onClose={() => setSelectedContest(null)}
          onRegister={() => registerMutation.mutate(selectedContest.id)}
          isRegistering={registerMutation.isPending}
          currentUserId={userId}
        />
      )}
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
  onClick,
}: {
  contest: Contest;
  isRegistered: boolean;
  onRegister: () => void;
  isRegistering: boolean;
  onClick?: () => void;
}) {
  const date = formatDate(contest.startTime);

  return (
    <Card
      className="bg-card border-border hover:border-primary/50 transition-colors cursor-pointer"
      onClick={onClick}
    >
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
                onClick={(e) => {
                  e.stopPropagation();
                  onRegister();
                }}
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

function ContestOverlay({
  contest,
  isRegistered,
  onClose,
  onRegister,
  isRegistering,
  currentUserId,
}: {
  contest: Contest;
  isRegistered: boolean;
  onClose: () => void;
  onRegister: () => void;
  isRegistering: boolean;
  currentUserId: string | null;
}) {
  const ended = hasContestEnded(contest.startTime, contest.duration);
  const live = isContestLive(contest.startTime, contest.duration);
  const externalUrl = getExternalContestUrl(
    contest.platform,
    contest.externalId
  );

  // Standings state
  const [standings, setStandings] = useState<Standing[]>([]);
  const [standingsLoading, setStandingsLoading] = useState(false);
  const [standingsError, setStandingsError] = useState<string | null>(null);

  // Fetch standings when overlay opens for ended contests
  useEffect(() => {
    if (!ended) return;

    // Check cache first
    const cached = standingsCache.get(contest.id);
    if (cached) {
      setStandings(cached);
      return;
    }

    // Fetch standings
    const fetchStandings = async () => {
      setStandingsLoading(true);
      setStandingsError(null);
      try {
        const response = await getContestStandings(contest.id);
        const data = response.data || [];
        setStandings(data);
        // Cache the results
        standingsCache.set(contest.id, data);
      } catch (err) {
        setStandingsError("Failed to load standings");
        console.error("Error fetching standings:", err);
      } finally {
        setStandingsLoading(false);
      }
    };

    fetchStandings();
  }, [contest.id, ended]);

  // Get medal emoji for top 3
  const getMedalEmoji = (rank: number) => {
    switch (rank) {
      case 1:
        return "🥇";
      case 2:
        return "🥈";
      case 3:
        return "🥉";
      default:
        return null;
    }
  };

  return (
    <div
      className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <Card
        className={`bg-card border-border w-full overflow-hidden ${
          ended ? "max-w-3xl h-[85vh]" : "max-w-lg"
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        <CardContent
          className={`p-6 flex flex-col ${ended ? "h-full" : "space-y-6"}`}
        >
          {/* Header */}
          <div className="flex items-start justify-between">
            <div className="space-y-2">
              <div className="flex items-center gap-2 flex-wrap">
                <Badge className="bg-primary/20 text-primary border-0">
                  {contest.platform}
                </Badge>
                {live && (
                  <Badge className="bg-red-500/20 text-red-400 border-0">
                    🔴 Live
                  </Badge>
                )}
                {ended && (
                  <Badge className="bg-muted text-muted-foreground border-0">
                    Ended
                  </Badge>
                )}
                {isRegistered && !ended && (
                  <Badge className="bg-green-500/20 text-green-400 border-0">
                    ✓ Registered
                  </Badge>
                )}
              </div>
              <h2 className="text-xl font-bold text-foreground">
                {contest.name}
              </h2>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={onClose}
              className="text-muted-foreground hover:text-foreground flex-shrink-0"
            >
              <X className="w-5 h-5" />
            </Button>
          </div>

          {/* Contest Details */}
          <div className={ended ? "flex-shrink-0 mt-4" : ""}>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center gap-3 p-3 bg-muted/30 rounded-lg">
                  <Calendar className="w-5 h-5 text-primary" />
                  <div>
                    <div className="text-xs text-muted-foreground">
                      Start Time
                    </div>
                    <div className="text-sm font-medium text-foreground">
                      {new Date(contest.startTime).toLocaleDateString("en-US", {
                        weekday: "short",
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {new Date(contest.startTime).toLocaleTimeString("en-US", {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-3 bg-muted/30 rounded-lg">
                  <Clock className="w-5 h-5 text-primary" />
                  <div>
                    <div className="text-xs text-muted-foreground">
                      Duration
                    </div>
                    <div className="text-sm font-medium text-foreground">
                      {formatDuration(contest.duration)}
                    </div>
                  </div>
                </div>
              </div>

              {/* Participants */}
              {contest.participantCount > 0 && (
                <div className="flex items-center gap-3 p-3 bg-muted/30 rounded-lg">
                  <Users className="w-5 h-5 text-primary" />
                  <div>
                    <div className="text-xs text-muted-foreground">
                      Participants
                    </div>
                    <div className="text-sm font-medium text-foreground">
                      {contest.participantCount.toLocaleString()} registered
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Standings Table for Ended Contests */}
          {ended && (
            <div className="flex-1 flex flex-col min-h-0 mt-4">
              <div className="flex items-center gap-2 flex-shrink-0 mb-3">
                <Trophy className="w-5 h-5 text-yellow-500" />
                <h3 className="text-lg font-semibold text-foreground">
                  Final Standings
                </h3>
              </div>

              {standingsLoading ? (
                <div className="flex items-center justify-center py-8 flex-1">
                  <Loading size="md" label="Loading standings..." />
                </div>
              ) : standingsError ? (
                <div className="text-center py-8 text-muted-foreground flex-1">
                  {standingsError}
                </div>
              ) : standings.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground flex-1">
                  No standings available yet
                </div>
              ) : (
                <div className="border border-border rounded-lg overflow-hidden flex-1 flex flex-col min-h-0">
                  <div className="overflow-y-auto flex-1">
                    <table className="w-full">
                      <thead className="bg-muted/50">
                        <tr>
                          <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                            Rank
                          </th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                            User
                          </th>
                          <th className="px-4 py-3 text-center text-xs font-medium text-muted-foreground uppercase tracking-wider">
                            Solved
                          </th>
                          <th className="px-4 py-3 text-center text-xs font-medium text-muted-foreground uppercase tracking-wider">
                            Points
                          </th>
                          <th className="px-4 py-3 text-center text-xs font-medium text-muted-foreground uppercase tracking-wider">
                            Rating Δ
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-border">
                        {standings.map((standing) => {
                          const isCurrentUser =
                            currentUserId && standing.user.id === currentUserId;
                          const medal = getMedalEmoji(standing.rank);

                          return (
                            <tr
                              key={standing.user.id}
                              className={`${
                                isCurrentUser
                                  ? "bg-primary/10 border-l-2 border-l-primary"
                                  : "hover:bg-muted/30"
                              } transition-colors`}
                            >
                              <td className="px-4 py-3 whitespace-nowrap">
                                <div className="flex items-center gap-2">
                                  <span
                                    className={`text-sm font-medium ${
                                      standing.rank <= 3
                                        ? "text-foreground"
                                        : "text-muted-foreground"
                                    }`}
                                  >
                                    {standing.rank}
                                  </span>
                                  {medal && (
                                    <span className="text-lg">{medal}</span>
                                  )}
                                </div>
                              </td>
                              <td className="px-4 py-3 whitespace-nowrap">
                                <div className="flex items-center gap-3">
                                  <Avatar className="h-8 w-8">
                                    <AvatarImage
                                      src={standing.user.profilePicture}
                                    />
                                    <AvatarFallback className="text-xs">
                                      {standing.user.username
                                        .slice(0, 2)
                                        .toUpperCase()}
                                    </AvatarFallback>
                                  </Avatar>
                                  <span
                                    className={`text-sm font-medium ${
                                      isCurrentUser
                                        ? "text-primary"
                                        : "text-foreground"
                                    }`}
                                  >
                                    {standing.user.username}
                                    {isCurrentUser && (
                                      <span className="ml-2 text-xs text-primary">
                                        (You)
                                      </span>
                                    )}
                                  </span>
                                </div>
                              </td>
                              <td className="px-4 py-3 whitespace-nowrap text-center">
                                <span className="text-sm text-foreground">
                                  {standing.problemsSolved}
                                </span>
                              </td>
                              <td className="px-4 py-3 whitespace-nowrap text-center">
                                <span className="text-sm font-medium text-foreground">
                                  {standing.totalPoints.toLocaleString()}
                                </span>
                              </td>
                              <td className="px-4 py-3 whitespace-nowrap text-center">
                                <span
                                  className={`text-sm font-medium ${
                                    standing.ratingChange > 0
                                      ? "text-green-500"
                                      : standing.ratingChange < 0
                                      ? "text-red-500"
                                      : "text-muted-foreground"
                                  }`}
                                >
                                  {standing.ratingChange > 0 ? "+" : ""}
                                  {standing.ratingChange}
                                </span>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Actions */}
          <div
            className={`flex items-center gap-3 ${
              ended ? "flex-shrink-0 mt-4" : "pt-2"
            }`}
          >
            {externalUrl && (
              <Button
                className="flex-1 bg-primary hover:bg-primary/90 text-primary-foreground"
                onClick={() => window.open(externalUrl, "_blank")}
              >
                <ExternalLink className="w-4 h-4 mr-2" />
                Open on {contest.platform}
              </Button>
            )}

            {!ended && !isRegistered && (
              <Button
                variant={externalUrl ? "outline" : "default"}
                className={
                  externalUrl
                    ? "flex-1"
                    : "flex-1 bg-primary hover:bg-primary/90 text-primary-foreground"
                }
                onClick={onRegister}
                disabled={isRegistering}
              >
                {isRegistering ? "Registering..." : "Register"}
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
