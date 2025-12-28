'use client';

import { use, useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { notFound, useRouter } from 'next/navigation';
import { useAuthStore } from '@/lib/stores/authStore';
import { getProblemBySlug } from '@/lib/api/problems';
import { createSubmission } from '@/lib/api/submissions';
import { getCurrentUser } from '@/lib/api';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Loading } from '@/components/common/Loading';
import { EmptyState } from '@/components/common/EmptyState';
import { CheckCircle2, XCircle, Play, Code2, ArrowLeft } from 'lucide-react';
import { toast } from 'sonner';
import Link from 'next/link';

type SubmissionStatus = 'ACCEPTED' | 'WRONG_ANSWER' | 'TIME_LIMIT_EXCEEDED' | 'RUNTIME_ERROR' | 'COMPILATION_ERROR';

const languages = [
  { value: 'javascript', label: 'JavaScript' },
  { value: 'typescript', label: 'TypeScript' },
  { value: 'python', label: 'Python' },
  { value: 'java', label: 'Java' },
  { value: 'cpp', label: 'C++' },
  { value: 'c', label: 'C' },
  { value: 'csharp', label: 'C#' },
  { value: 'go', label: 'Go' },
  { value: 'rust', label: 'Rust' },
  { value: 'kotlin', label: 'Kotlin' },
];

const statusOptions = [
  { value: 'ACCEPTED', label: 'Accepted' },
  { value: 'WRONG_ANSWER', label: 'Wrong Answer' },
  { value: 'TIME_LIMIT_EXCEEDED', label: 'Time Limit Exceeded' },
  { value: 'RUNTIME_ERROR', label: 'Runtime Error' },
  { value: 'COMPILATION_ERROR', label: 'Compilation Error' },
];

function formatCode(code: string): string {
  const lines = code.split('\n');
  const indentSize = 2;
  let formatted = '';
  let indentLevel = 0;
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    
    if (!line) {
      formatted += '\n';
      continue;
    }
    
    if (line.includes('}') || line.includes(')') || line.includes(']')) {
      indentLevel = Math.max(0, indentLevel - 1);
    }
    
    formatted += ' '.repeat(indentLevel * indentSize) + line + '\n';
    
    if (line.includes('{') || (line.includes('(') && !line.includes(')')) || (line.includes('[') && !line.includes(']'))) {
      indentLevel++;
    }
  }
  
  return formatted.trim();
}

export default function SubmitSolutionPage({ params }: { params: Promise<{ slug: string }> }) {
  const { user } = useAuthStore();
  const router = useRouter();
  const queryClient = useQueryClient();
  const { slug } = use(params);
  
  const [language, setLanguage] = useState('javascript');
  const [code, setCode] = useState('');
  const [status, setStatus] = useState<SubmissionStatus>('ACCEPTED');

  const { data: userData } = useQuery({
    queryKey: ['currentUser'],
    queryFn: () => getCurrentUser(),
    enabled: !!user,
  });

  const currentUserData = userData?.data || user;
  const hasGithubConnected = !!currentUserData?.githubUsername;

  const { data: problemData, isLoading: problemLoading, error: problemError } = useQuery({
    queryKey: ['problem', slug],
    queryFn: async () => {
      const result = await getProblemBySlug(slug);
      return result;
    },
  });

  const problem = problemData?.data;

  const submitMutation = useMutation({
    mutationFn: async (data: { problemId: string; status: SubmissionStatus; language: string; code: string }) => {
      const result = await createSubmission(data);
      return result;
    },
    onSuccess: async (response) => {
      const submission = response.data;
      toast.success('Solution submitted successfully!');
      
      // If accepted and GitHub is connected, push to GitHub
      if (submission.status === 'ACCEPTED' && hasGithubConnected && !submission.githubUrl) {
        try {
          const { pushSubmissionToGitHub } = await import('@/lib/api/submissions');
          const pushResult = await pushSubmissionToGitHub(submission.id);
          if (pushResult.data?.commitUrl) {
            toast.success('Solution pushed to GitHub!', {
              description: 'View it on GitHub',
              action: {
                label: 'Open',
                onClick: () => window.open(pushResult.data.commitUrl, '_blank'),
              },
            });
          }
        } catch (error: any) {
          console.error('GitHub push failed:', error);
          toast.error(error.response?.data?.error || 'Failed to push to GitHub', {
            description: 'Your submission was saved, but GitHub push failed',
          });
        }
      }
      
      // Invalidate all relevant queries
      queryClient.invalidateQueries({ queryKey: ['problem', slug] });
      queryClient.invalidateQueries({ queryKey: ['problems'] }); // Invalidate problems list to update solved status
      queryClient.invalidateQueries({ queryKey: ['problemSubmissions'] });
      queryClient.invalidateQueries({ queryKey: ['userSubmissions', user?.id] }); // Invalidate all user submissions
      queryClient.invalidateQueries({ queryKey: ['userSubmissions', user?.id, problem?.id] }); // Invalidate specific problem submissions
      queryClient.invalidateQueries({ queryKey: ['userStats'] });
      queryClient.invalidateQueries({ queryKey: ['problemStats', problem?.id] });
      
      // Refetch submissions immediately
      await queryClient.refetchQueries({ queryKey: ['userSubmissions', user?.id, problem?.id] });
      
      router.push(`/problems/${slug}`);
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.error || 'Failed to submit solution');
    },
  });

  const handleSubmit = () => {
    if (!code.trim()) {
      toast.error('Please enter your solution code');
      return;
    }

    if (!problem) {
      toast.error('Problem not found');
      return;
    }

    submitMutation.mutate({
      problemId: problem.id,
      status,
      language,
      code: code.trim(),
    });
  };

  const handleFormatCode = () => {
    if (!code.trim()) {
      toast.info('No code to format');
      return;
    }
    setCode(formatCode(code));
    toast.success('Code formatted');
  };

  if (problemLoading) {
    return (
      <div className="min-h-screen bg-background p-6">
        <Loading size="lg" label="Loading problem..." />
      </div>
    );
  }

  if (problemError || !problem) {
    return (
      <div className="min-h-screen bg-background p-6">
        <EmptyState
          title="Problem not found"
          description="The problem you're looking for doesn't exist."
        />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-background p-6">
        <EmptyState
          title="Authentication required"
          description="Please log in to submit a solution."
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-7xl mx-auto">
        {/* Back Button */}
        <div className="mb-4">
          <Button
            variant="ghost"
            onClick={() => router.back()}
            className="text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
        </div>

        <div className="mb-6">
          <h1 className="text-2xl font-bold text-foreground mb-2">Submit Solution</h1>
          <p className="text-muted-foreground">
            Submit your solution for: <span className="font-semibold text-foreground">{problem.title}</span>
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Form */}
          <div className="lg:col-span-2">
            <Card className="bg-card border-border">
              <CardContent className="p-6">
                <div className="space-y-6">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label className="text-foreground mb-2 block text-sm">Language</Label>
                      <Select value={language} onValueChange={setLanguage}>
                        <SelectTrigger className="bg-muted border-border text-foreground">
                          <SelectValue placeholder="Select language" />
                        </SelectTrigger>
                        <SelectContent>
                          {languages.map((lang) => (
                            <SelectItem key={lang.value} value={lang.value}>
                              {lang.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label className="text-foreground mb-2 block text-sm">Status</Label>
                      <Select value={status} onValueChange={(value) => setStatus(value as SubmissionStatus)}>
                        <SelectTrigger className="bg-muted border-border text-foreground">
                          <SelectValue placeholder="Select status" />
                        </SelectTrigger>
                        <SelectContent>
                          {statusOptions.map((option) => (
                            <SelectItem key={option.value} value={option.value}>
                              <div className="flex items-center gap-2">
                                {option.value === 'ACCEPTED' ? (
                                  <CheckCircle2 className="w-4 h-4 text-green-500" />
                                ) : (
                                  <XCircle className="w-4 h-4 text-red-500" />
                                )}
                                {option.label}
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <Label className="text-foreground block text-sm">Code</Label>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={handleFormatCode}
                        className="text-primary hover:text-primary/80"
                      >
                        Format Code
                      </Button>
                    </div>
                    <Textarea
                      value={code}
                      onChange={(e) => setCode(e.target.value)}
                      className="bg-muted border-border text-foreground font-mono text-sm min-h-[400px] resize-none"
                      placeholder="Paste your solution code here..."
                    />
                    <p className="text-xs text-muted-foreground mt-2">
                      Paste your solution code. Use "Format Code" to automatically format it.
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    <Button
                      onClick={handleSubmit}
                      disabled={submitMutation.isPending || !code.trim()}
                      className="bg-primary hover:bg-primary/90 text-primary-foreground"
                    >
                      <Play className="w-4 h-4 mr-2" />
                      {submitMutation.isPending ? 'Submitting...' : 'Submit Solution'}
                    </Button>
                    <Link href={`/problems/${slug}`}>
                      <Button variant="outline" className="border-border text-foreground hover:bg-foreground/5">
                        Cancel
                      </Button>
                    </Link>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            <Card className="bg-card border-border">
              <CardContent className="p-6">
                <h3 className="text-lg font-semibold text-foreground mb-4">Problem Info</h3>
                <div className="space-y-3">
                  <div>
                    <span className="text-sm text-muted-foreground">Title</span>
                    <p className="text-sm font-medium text-foreground">{problem.title}</p>
                  </div>
                  <div>
                    <span className="text-sm text-muted-foreground">Difficulty</span>
                    <Badge variant="outline" className="mt-1">
                      {problem.difficulty}
                    </Badge>
                  </div>
                  <div>
                    <span className="text-sm text-muted-foreground">Platform</span>
                    <p className="text-sm font-medium text-foreground">{problem.platform}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-card border-border">
              <CardContent className="p-6">
                <h3 className="text-lg font-semibold text-foreground mb-4">Tips</h3>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li>• Paste your complete solution code</li>
                  <li>• Use "Format Code" to clean up indentation</li>
                  <li>• Select the correct language</li>
                  <li>• Mark the submission status accurately</li>
                  <li>• Accepted solutions will update your stats</li>
                  {hasGithubConnected && (
                    <li className="text-green-500">• Accepted solutions will automatically push to GitHub</li>
                  )}
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}

