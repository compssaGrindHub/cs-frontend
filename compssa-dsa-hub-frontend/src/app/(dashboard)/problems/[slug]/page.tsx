'use client';

import { use } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useAuthStore } from '@/lib/stores/authStore';
import { getProblemBySlug, getProblemStats } from '@/lib/api/problems';
import { getUserSubmissions } from '@/lib/api/submissions';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Loading } from '@/components/common/Loading';
import { EmptyState } from '@/components/common/EmptyState';
import { CheckCircle2, XCircle, Clock, ExternalLink, Code2, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { format } from 'date-fns';

const difficultyColors = {
  EASY: 'text-green-500 bg-green-500/10 border-green-500/30',
  MEDIUM: 'text-yellow-500 bg-yellow-500/10 border-yellow-500/30',
  HARD: 'text-red-500 bg-red-500/10 border-red-500/30',
};

export default function ProblemDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = use(params);
  const router = useRouter();
  const { user } = useAuthStore();

  const { data: problemData, isLoading: problemLoading } = useQuery({
    queryKey: ['problem', slug],
    queryFn: async () => {
      const result = await getProblemBySlug(slug);
      return result;
    },
  });

  const problem = problemData?.data;

  const { data: statsData } = useQuery({
    queryKey: ['problemStats', problem?.id],
    queryFn: async () => {
      const result = await getProblemStats(problem!.id);
      return result;
    },
    enabled: !!problem?.id,
  });

  const stats = statsData?.data;

  const { data: submissionsData } = useQuery({
    queryKey: ['userSubmissions', user?.id, problem?.id],
    queryFn: async () => {
      const result = await getUserSubmissions(user!.id, { problemId: problem!.id, limit: 10 });
      return result;
    },
    enabled: !!user?.id && !!problem?.id,
    refetchOnWindowFocus: true,
  });

  const submissions = submissionsData?.data || [];

  if (problemLoading) {
    return (
      <div className="min-h-screen bg-background p-6">
        <Loading size="lg" label="Loading problem..." />
      </div>
    );
  }

  if (!problem) {
    return (
      <div className="min-h-screen bg-background p-6">
        <EmptyState
          title="Problem not found"
          description="The problem you're looking for doesn't exist or has been removed."
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Back Button */}
        <Button
          variant="ghost"
          onClick={() => router.back()}
          className="text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back
        </Button>

        {/* Header */}
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <h1 className="text-3xl font-bold text-foreground">{problem.title}</h1>
              <Badge variant="outline" className={difficultyColors[problem.difficulty]}>
                {problem.difficulty}
              </Badge>
              {problem.isDailyQuestion && (
                <Badge className="bg-purple-500/20 text-purple-400 border-0">
                  Daily Question
                </Badge>
              )}
            </div>
            <div className="flex items-center gap-4 text-sm text-muted-foreground mb-4">
              <span>{problem.platform}</span>
              {problem.acceptanceRate !== null && problem.acceptanceRate !== undefined && (
                <>
                  <span>•</span>
                  <span>Acceptance Rate: {problem.acceptanceRate.toFixed(1)}%</span>
                </>
              )}
              {stats && (
                <>
                  <span>•</span>
                  <span>{stats.totalSubmissions || 0} submissions</span>
                </>
              )}
            </div>
            <div className="flex items-center gap-2 flex-wrap">
              {problem.topics.map((topic) => (
                <Badge key={topic} className="bg-blue-600/20 text-blue-400 border-0">
                  {topic}
                </Badge>
              ))}
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Link href={problem.problemLink} target="_blank" rel="noopener noreferrer">
              <Button variant="outline" className="border-border text-foreground">
                <ExternalLink className="w-4 h-4 mr-2" />
                Open on {problem.platform}
              </Button>
            </Link>
            <Link href={`/problems/${slug}/submit`}>
              <Button className="bg-primary hover:bg-primary/90 text-primary-foreground">
                <Code2 className="w-4 h-4 mr-2" />
                Submit Solution
              </Button>
            </Link>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Description */}
            <Card className="bg-card border-border">
              <CardContent className="p-6">
                <h2 className="text-xl font-semibold text-foreground mb-4">Description</h2>
                <div
                  className="prose prose-invert max-w-none text-foreground"
                  dangerouslySetInnerHTML={{ __html: problem.description || 'No description available.' }}
                />
              </CardContent>
            </Card>

            {/* Your Submissions */}
            {user && (
              <Card className="bg-card border-border">
                <CardContent className="p-6">
                  <h2 className="text-xl font-semibold text-foreground mb-4">Your Submissions</h2>
                  {submissions.length === 0 ? (
                    <EmptyState
                      title="No submissions yet"
                      description="Submit your solution to see it here."
                    />
                  ) : (
                    <div className="space-y-3">
                      {submissions.map((submission: any) => {
                        const StatusIcon =
                          submission.status === 'ACCEPTED'
                            ? CheckCircle2
                            : submission.status === 'WRONG_ANSWER'
                            ? XCircle
                            : Clock;
                        const statusColor =
                          submission.status === 'ACCEPTED'
                            ? 'text-green-500'
                            : submission.status === 'WRONG_ANSWER'
                            ? 'text-red-500'
                            : 'text-yellow-500';

                        return (
                          <div
                            key={submission.id}
                            className="flex items-center justify-between p-3 bg-muted rounded-lg border border-border"
                          >
                            <div className="flex items-center gap-3">
                              <StatusIcon className={`w-5 h-5 ${statusColor}`} />
                              <div>
                                <p className="text-sm font-medium text-foreground">
                                  {submission.language} • {submission.status}
                                </p>
                                <p className="text-xs text-muted-foreground">
                                  {format(new Date(submission.submissionTime), 'MMM d, yyyy h:mm a')}
                                </p>
                              </div>
                            </div>
                            {submission.githubUrl && (
                              <a
                                href={submission.githubUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-primary hover:underline text-sm"
                              >
                                View on GitHub
                              </a>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )}
                </CardContent>
              </Card>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Stats */}
            {stats && (
              <Card className="bg-card border-border">
                <CardContent className="p-6">
                  <h3 className="text-lg font-semibold text-foreground mb-4">Statistics</h3>
                  <div className="space-y-3">
                    <div>
                      <p className="text-sm text-muted-foreground">Total Submissions</p>
                      <p className="text-2xl font-bold text-foreground">{stats.totalSubmissions || 0}</p>
                    </div>
                    {stats.acceptedSubmissions !== undefined && (
                      <div>
                        <p className="text-sm text-muted-foreground">Accepted</p>
                        <p className="text-2xl font-bold text-green-500">{stats.acceptedSubmissions}</p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

