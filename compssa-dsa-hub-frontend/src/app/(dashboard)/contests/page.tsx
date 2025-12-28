'use client';

import { useState, useEffect, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuthStore } from '@/lib/stores/authStore';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { 
  Calendar, 
  Clock, 
  Users, 
  Search,
  BarChart3,
  CheckCircle2,
  CalendarPlus
} from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { getContests, getUpcomingContests, getUserContests, registerForContest, Contest } from '@/lib/api';
import { Loading } from '@/components/common/Loading';
import { EmptyState } from '@/components/common/EmptyState';
import { Pagination } from '@/components/common/Pagination';
import { toast } from 'sonner';

export default function ContestsPage() {
  const { user } = useAuthStore();
  const queryClient = useQueryClient();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPlatform, setSelectedPlatform] = useState('all');
  const [activeTab, setActiveTab] = useState('upcoming');
  const [page, setPage] = useState(1);

  const upcomingParams = useMemo(() => ({
    status: 'UPCOMING' as const,
    platform: selectedPlatform !== 'all' ? selectedPlatform.toUpperCase() as 'LEETCODE' | 'CODEFORCES' | 'CUSTOM' : undefined,
    page,
    limit: 10,
  }), [selectedPlatform, page]);

  const completedParams = useMemo(() => ({
    status: 'COMPLETED' as const,
    platform: selectedPlatform !== 'all' ? selectedPlatform.toUpperCase() as 'LEETCODE' | 'CODEFORCES' | 'CUSTOM' : undefined,
    page,
    limit: 10,
  }), [selectedPlatform, page]);

  const { data: upcomingContestsData, isLoading: upcomingLoading } = useQuery({
    queryKey: ['contests', 'upcoming', upcomingParams],
    queryFn: () => getContests(upcomingParams),
    enabled: activeTab === 'upcoming',
  });

  const { data: myContestsData, isLoading: myContestsLoading } = useQuery({
    queryKey: ['userContests', user?.id],
    queryFn: () => getUserContests(user!.id),
    enabled: !!user?.id,
  });

  const { data: completedContestsData, isLoading: completedLoading } = useQuery({
    queryKey: ['contests', 'completed', completedParams],
    queryFn: () => getContests(completedParams),
    enabled: activeTab === 'past',
  });

  const { data: featuredContestData } = useQuery({
    queryKey: ['upcomingContests', 1],
    queryFn: () => getUpcomingContests(1),
    refetchInterval: 30000,
  });

  const [optimisticallyRegistered, setOptimisticallyRegistered] = useState<Set<string>>(new Set());

  const registerMutation = useMutation({
    mutationFn: (contestId: string) => {
      setOptimisticallyRegistered((prev) => new Set(prev).add(contestId));
      return registerForContest(contestId);
    },
    onSuccess: (_, contestId) => {
      queryClient.invalidateQueries({ queryKey: ['userContests', user?.id] });
      queryClient.invalidateQueries({ queryKey: ['contests'] });
      queryClient.invalidateQueries({ queryKey: ['upcomingContests'] });
      queryClient.refetchQueries({ queryKey: ['userContests', user?.id] });
      queryClient.refetchQueries({ queryKey: ['upcomingContests'] });
      toast.success('Successfully registered for contest');
    },
    onError: (error: any, contestId) => {
      setOptimisticallyRegistered((prev) => {
        const next = new Set(prev);
        next.delete(contestId);
        return next;
      });
      const errorMessage = error.response?.data?.error || 'Failed to register for contest';
      if (errorMessage.includes('already registered') || errorMessage.includes('Already registered')) {
        setOptimisticallyRegistered((prev) => new Set(prev).add(contestId));
        queryClient.invalidateQueries({ queryKey: ['userContests', user?.id] });
        queryClient.refetchQueries({ queryKey: ['userContests', user?.id] });
      }
      toast.error(errorMessage);
    },
  });

  const featuredContest = featuredContestData?.[0];
  const upcomingContests = upcomingContestsData?.data || [];
  const myContests = myContestsData?.data || [];
  const completedContests = completedContestsData?.data || [];

  const registeredContestIds = useMemo(() => {
    const ids = new Set(myContests.map((c: Contest) => c.id));
    optimisticallyRegistered.forEach((id) => ids.add(id));
    return ids;
  }, [myContests, optimisticallyRegistered]);

  const [countdown, setCountdown] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });

  useEffect(() => {
    if (!featuredContest) return;

    const updateCountdown = () => {
      const now = new Date();
      const start = new Date(featuredContest.startTime);
      const diff = start.getTime() - now.getTime();

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

  const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hours > 0) return `${hours}h ${mins}m`;
    return `${mins}m`;
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return {
      month: date.toLocaleDateString('en-US', { month: 'short' }).toUpperCase(),
      day: date.getDate().toString(),
    };
  };

  const filteredContests = useMemo(() => {
    let contests: Contest[] = [];
    if (activeTab === 'upcoming') contests = upcomingContests;
    else if (activeTab === 'my-contests') contests = myContests;
    else contests = completedContests;

    if (!searchQuery) return contests;
    return contests.filter((c) => c.name.toLowerCase().includes(searchQuery.toLowerCase()));
  }, [activeTab, upcomingContests, myContests, completedContests, searchQuery]);

  const isLoading = upcomingLoading || myContestsLoading || completedLoading;

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-foreground">Contests</h1>
          <Button variant="outline" className="border-border text-foreground hover:bg-foreground/5">
            <Calendar className="w-4 h-4 mr-2" />
            Sync Calendar
          </Button>
        </div>

        {/* Featured Contest Hero Card */}
        {featuredContest && (
          <Card className="bg-gradient-to-br from-blue-900/40 to-blue-950/40 border-blue-500/20 overflow-hidden">
            <CardContent className="p-8">
              <div className="flex items-start justify-between">
                <div className="space-y-4 flex-1">
                  <Badge className="bg-blue-500/20 text-blue-400 border-0">
                    Up Next
                  </Badge>
                  <div className="space-y-1">
                    <p className="text-sm text-blue-300">
                      Starts {new Date(featuredContest.startTime).toLocaleString()}
                    </p>
                    <h2 className="text-3xl font-bold text-foreground">{featuredContest.name}</h2>
                  </div>
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <div className="flex items-center gap-2">
                      <span className="text-yellow-500">⚡</span>
                      <span>{featuredContest.platform}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4" />
                      <span>{formatDuration(featuredContest.duration)} duration</span>
                    </div>
                  </div>
                  <div className="flex gap-3 pt-2">
                    {registeredContestIds.has(featuredContest.id) ? (
                      <Badge className="bg-green-500/20 text-green-400 border-0 px-4 py-2">
                        ✓ Registered
                      </Badge>
                    ) : (
                      <Button 
                        className="bg-primary hover:bg-primary/90 text-primary-foreground"
                        onClick={() => registerMutation.mutate(featuredContest.id)}
                        disabled={registerMutation.isPending}
                      >
                        {registerMutation.isPending ? 'Registering...' : 'Register Now'}
                      </Button>
                    )}
                    <Button variant="outline" className="border-border text-foreground hover:bg-foreground/5">
                      Add to Calendar
                    </Button>
                  </div>
                </div>

                {/* Countdown Timer */}
                <div className="flex items-center gap-4">
                  <div className="text-center">
                    <div className="text-4xl font-bold text-foreground">{countdown.days.toString().padStart(2, '0')}</div>
                    <div className="text-xs text-muted-foreground uppercase mt-1">Days</div>
                  </div>
                  <div className="text-2xl text-muted-foreground/50">:</div>
                  <div className="text-center">
                    <div className="text-4xl font-bold text-foreground">{countdown.hours.toString().padStart(2, '0')}</div>
                    <div className="text-xs text-muted-foreground uppercase mt-1">Hrs</div>
                  </div>
                  <div className="text-2xl text-muted-foreground/50">:</div>
                  <div className="text-center">
                    <div className="text-4xl font-bold text-foreground">{countdown.minutes.toString().padStart(2, '0')}</div>
                    <div className="text-xs text-muted-foreground uppercase mt-1">Min</div>
                  </div>
                  <div className="text-2xl text-muted-foreground/50">:</div>
                  <div className="text-center">
                    <div className="text-4xl font-bold text-foreground">{countdown.seconds.toString().padStart(2, '0')}</div>
                    <div className="text-xs text-muted-foreground uppercase mt-1">Sec</div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
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
            {/* Search and Filters */}
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

              <Select value={selectedPlatform} onValueChange={setSelectedPlatform}>
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
            ) : filteredContests.length === 0 ? (
              <EmptyState
                title="No contests found"
                description="Try adjusting your filters or check back later for new contests."
              />
            ) : (
              <>
                <div className="space-y-3">
                  {filteredContests.map((contest) => {
                    const date = formatDate(contest.startTime);
                    const isRegistered = registeredContestIds.has(contest.id);
                    
                    return (
                      <Card key={contest.id} className="bg-card border-border hover:border-primary/50 transition-colors">
                        <CardContent className="p-5">
                          <div className="flex items-center gap-4">
                            {/* Date Badge */}
                            <div className="flex-shrink-0 w-16 h-16 bg-primary rounded-lg flex flex-col items-center justify-center">
                              <div className="text-xs text-primary-foreground font-medium">{date.month}</div>
                              <div className="text-2xl font-bold text-primary-foreground">{date.day}</div>
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
                                <div className="flex items-center gap-1.5">
                                  <span className="text-yellow-500">⚡</span>
                                  <span>{contest.platform}</span>
                                </div>
                                <div className="flex items-center gap-1.5">
                                  <Clock className="w-4 h-4" />
                                  <span>{formatDuration(contest.duration)}</span>
                                </div>
                              </div>
                              <div className="flex items-center gap-4 text-xs text-muted-foreground/75 mt-1">
                                <span>Start Time</span>
                                <span>{new Date(contest.startTime).toLocaleString()}</span>
                                {contest.participantCount > 0 && (
                                  <>
                                    <span>•</span>
                                    <span>Participants: {contest.participantCount.toLocaleString()}</span>
                                  </>
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
                              {isRegistered ? (
                                <Badge className="bg-green-500/20 text-green-500 border-0 px-4 py-2">
                                  ✓ Registered
                                </Badge>
                              ) : contest.status === 'UPCOMING' ? (
                                <Button 
                                  className="bg-primary hover:bg-primary/90 text-primary-foreground"
                                  onClick={() => registerMutation.mutate(contest.id)}
                                  disabled={registerMutation.isPending}
                                >
                                  {registerMutation.isPending ? 'Registering...' : 'Register'}
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
                  })}
                </div>
                {activeTab === 'upcoming' && upcomingContestsData?.meta && upcomingContestsData.meta.totalPages > 1 && (
                  <div className="flex justify-center pt-6">
                    <Pagination
                      page={upcomingContestsData.meta.page}
                      pageCount={upcomingContestsData.meta.totalPages}
                      onPageChange={setPage}
                    />
                  </div>
                )}
                {activeTab === 'past' && completedContestsData?.meta && completedContestsData.meta.totalPages > 1 && (
                  <div className="flex justify-center pt-6">
                    <Pagination
                      page={completedContestsData.meta.page}
                      pageCount={completedContestsData.meta.totalPages}
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

