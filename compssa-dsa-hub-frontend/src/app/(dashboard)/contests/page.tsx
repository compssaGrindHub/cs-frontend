'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
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

const mockContests = [
  {
    id: 1,
    title: 'Codeforces Round 982 (Div. 2)',
    platform: 'Codeforces',
    duration: '2h 00m',
    startTime: '16:35 UTC',
    participants: 12482,
    date: { month: 'OCT', day: '29' },
    registered: false,
  },
  {
    id: 2,
    title: 'Biweekly Contest 117',
    platform: 'LeetCode',
    duration: '1h 30m',
    startTime: '14:38 UTC',
    participants: 8031,
    date: { month: 'NOV', day: '02' },
    registered: true,
  },
  {
    id: 3,
    title: 'AtCoder Beginner Contest 327',
    platform: 'AtCoder',
    duration: '1h 40m',
    startTime: '12:08 UTC',
    participants: 0,
    date: { month: 'NOV', day: '04' },
    registered: false,
  },
  {
    id: 4,
    title: 'Weekly Contest 422',
    platform: 'LeetCode',
    duration: '1h 30m',
    startTime: '02:38 UTC',
    participants: 0,
    date: { month: 'NOV', day: '05' },
    registered: false,
  },
];

export default function ContestsPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPlatform, setSelectedPlatform] = useState('all');
  const [selectedDuration, setSelectedDuration] = useState('any');
  const [activeTab, setActiveTab] = useState('upcoming');

  // Countdown timer for featured contest
  const [countdown, setCountdown] = useState({
    days: 2,
    hours: 4,
    minutes: 32,
  });

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
        <Card className="bg-gradient-to-br from-blue-900/40 to-blue-950/40 border-blue-500/20 overflow-hidden">
          <CardContent className="p-8">
            <div className="flex items-start justify-between">
              <div className="space-y-4 flex-1">
                <Badge className="bg-blue-500/20 text-blue-400 border-0">
                  Up Next
                </Badge>
                <div className="space-y-1">
                  <p className="text-sm text-blue-300">Starts Oct 28, 14:00 UTC</p>
                  <h2 className="text-3xl font-bold text-foreground">Weekly Contest 421</h2>
                </div>
                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  <div className="flex items-center gap-2">
                    <span className="text-yellow-500">⚡</span>
                    <span>LeetCode</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4" />
                    <span>1h 30m duration</span>
                  </div>
                </div>
                <div className="flex gap-3 pt-2">
                  <Button className="bg-primary hover:bg-primary/90 text-primary-foreground">
                    Register Now
                  </Button>
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
              </div>
            </div>
          </CardContent>
        </Card>

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
                <input
                  type="text"
                  placeholder="Filter contests..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full h-10 pl-10 pr-4 bg-card border border-border rounded-lg text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                />
              </div>

              <Button variant="outline" className="border-border bg-primary/10 text-primary hover:bg-primary/20">
                <BarChart3 className="w-4 h-4 mr-2" />
                Platform: All
              </Button>

              <Button variant="outline" className="border-border bg-primary/10 text-primary hover:bg-primary/20">
                <Clock className="w-4 h-4 mr-2" />
                Duration: Any
              </Button>
            </div>

            {/* Contest List */}
            <div className="space-y-3">
              {mockContests.map((contest) => (
                <Card key={contest.id} className="bg-card border-border hover:border-border transition-colors">
                  <CardContent className="p-5">
                    <div className="flex items-center gap-4">
                      {/* Date Badge */}
                      <div className="flex-shrink-0 w-16 h-16 bg-primary rounded-lg flex flex-col items-center justify-center">
                        <div className="text-xs text-primary-foreground font-medium">{contest.date.month}</div>
                        <div className="text-2xl font-bold text-primary-foreground">{contest.date.day}</div>
                      </div>

                      {/* Icon */}
                      <div className="flex-shrink-0">
                        <div className="w-10 h-10 rounded-lg bg-foreground/5 flex items-center justify-center">
                          <BarChart3 className="w-5 h-5 text-muted-foreground\" />
                        </div>
                      </div>

                      {/* Contest Info */}
                      <div className="flex-1 min-w-0">
                        <h3 className="text-foreground font-medium mb-2">{contest.title}</h3>
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          <div className="flex items-center gap-1.5">
                            <span className="text-yellow-500">⚡</span>
                            <span>{contest.platform}</span>
                          </div>
                          <div className="flex items-center gap-1.5">
                            <Clock className="w-4 h-4" />
                            <span>{contest.duration}</span>
                          </div>
                        </div>
                        <div className="flex items-center gap-4 text-xs text-muted-foreground/75 mt-1">
                          <span>Start Time</span>
                          <span>{contest.startTime}</span>
                          {contest.participants > 0 && (
                            <>
                              <span>Participants</span>
                              <span>{contest.participants.toLocaleString()}</span>
                            </>
                          )}
                        </div>
                        {contest.registered && (
                          <div className="flex items-center gap-1.5 mt-2">
                            <CheckCircle2 className="w-4 h-4 text-green-500" />
                            <span className="text-sm text-green-500">Registered</span>
                          </div>
                        )}
                      </div>

                      {/* Action Button */}
                      <div className="flex-shrink-0">
                        {contest.registered ? (
                          <Badge className="bg-green-500/20 text-green-500 border-0 px-4 py-2">
                            ✓ Registered
                          </Badge>
                        ) : (
                          <Button className="bg-primary hover:bg-primary/90 text-primary-foreground">
                            Register
                          </Button>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

