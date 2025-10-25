'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Navbar } from '@/components/navbar';
import { supabase } from '@/lib/supabase/client';
import { getCurrentUser } from '@/lib/supabase/auth';
import { Poll, PollResult, VoterInfo } from '@/lib/types';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';
import Link from 'next/link';

const CHART_COLORS = ['#1441D0', '#8b5cf6', '#ec4899', '#f59e0b', '#10b981', '#06b6d4'];

export default function AdminPollResultsPage() {
  const params = useParams();
  const router = useRouter();
  const pollId = params.pollId as string;
  
  const [poll, setPoll] = useState<Poll | null>(null);
  const [results, setResults] = useState<PollResult[]>([]);
  const [voters, setVoters] = useState<VoterInfo[]>([]);
  const [accessCode, setAccessCode] = useState('');
  const [chartType, setChartType] = useState<'bar' | 'pie'>('bar');
  const [totalVotes, setTotalVotes] = useState(0);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    let channel: any = null;

    const checkAuthAndLoad = async () => {
      const { user, error } = await getCurrentUser();
      if (error || !user) {
        router.push('/admin/login');
        return;
      }
      setUser(user);
      await loadPollAndResults(user.id);
      
      // Subscribe to real-time updates
      channel = supabase
        .channel(`admin_poll_${pollId}`)
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'votes',
            filter: `poll_id=eq.${pollId}`,
          },
          (payload) => {
            console.log('Real-time vote update received:', payload);
            loadResults();
            loadVoters(user.id);
          }
        )
        .subscribe((status) => {
          console.log('Subscription status:', status);
        });
    };

    checkAuthAndLoad();

    // Cleanup function
    return () => {
      if (channel) {
        supabase.removeChannel(channel);
      }
    };
  }, [pollId]);

  const loadPollAndResults = async (userId: string) => {
    try {
      const { data: pollData, error: pollError } = await supabase
        .from('polls')
        .select(`
          *,
          access_codes(code_display)
        `)
        .eq('id', pollId)
        .single();

      if (pollError) throw pollError;
      
      // Verify admin owns this poll
      if (pollData.admin_id !== userId) {
        router.push('/admin');
        return;
      }

      setPoll(pollData);
      setAccessCode(pollData.access_codes?.[0]?.code_display || '');

      await loadResults();
      await loadVoters(userId);
    } catch (err) {
      console.error('Failed to load poll:', err);
    } finally {
      setLoading(false);
    }
  };

  const loadResults = async () => {
    try {
      const { data, error } = await supabase.rpc('get_poll_results', {
        poll_uuid: pollId,
      });

      if (error) throw error;

      setResults(data || []);
      const total = (data || []).reduce((sum: number, r: PollResult) => sum + Number(r.vote_count), 0);
      setTotalVotes(total);
    } catch (err) {
      console.error('Failed to load results:', err);
    }
  };

  const loadVoters = async (userId: string) => {
    try {
      const { data, error } = await supabase.rpc('get_poll_voters', {
        poll_uuid: pollId,
        admin_uuid: userId,
      });

      if (error) throw error;
      setVoters(data || []);
    } catch (err) {
      console.error('Failed to load voters:', err);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen">
        <Navbar />
        <div className="container mx-auto px-4 py-20 text-center">
          <p>Loading...</p>
        </div>
      </div>
    );
  }

  const chartData = results.map((r) => ({
    name: r.option_text,
    votes: Number(r.vote_count),
    percentage: totalVotes > 0 ? ((Number(r.vote_count) / totalVotes) * 100).toFixed(1) : '0',
  }));

  return (
    <div className="min-h-screen">
      <Navbar />
      
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto space-y-6">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <CardTitle className="text-2xl">{poll?.title}</CardTitle>
                  {poll?.description && (
                    <CardDescription className="text-base mt-2">
                      {poll.description}
                    </CardDescription>
                  )}
                </div>
                <div className="text-right space-y-2">
                  <div>
                    <div className="text-3xl font-bold text-primary">{totalVotes}</div>
                    <div className="text-sm text-muted-foreground">Total Votes</div>
                  </div>
                  <Badge variant="secondary" className="font-mono text-lg">
                    {accessCode}
                  </Badge>
                  <div className="text-xs text-muted-foreground">Access Code</div>
                </div>
              </div>
            </CardHeader>
          </Card>

          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle>Live Results</CardTitle>
                <div className="flex gap-2">
                  <Button
                    variant={chartType === 'bar' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setChartType('bar')}
                  >
                    Bar Chart
                  </Button>
                  <Button
                    variant={chartType === 'pie' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setChartType('pie')}
                  >
                    Pie Chart
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {totalVotes === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
                  No votes yet. Share your access code to start collecting votes!
                </div>
              ) : (
                <div className="space-y-6">
                  {chartType === 'bar' ? (
                    <ResponsiveContainer width="100%" height={300}>
                      <BarChart data={chartData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                        <XAxis dataKey="name" stroke="#888" />
                        <YAxis stroke="#888" />
                        <Tooltip
                          contentStyle={{ backgroundColor: '#1a1a1a', border: '1px solid #333' }}
                          labelStyle={{ color: '#fff' }}
                        />
                        <Bar dataKey="votes" fill="#1441D0" />
                      </BarChart>
                    </ResponsiveContainer>
                  ) : (
                    <ResponsiveContainer width="100%" height={300}>
                      <PieChart>
                        <Pie
                          data={chartData}
                          dataKey="votes"
                          nameKey="name"
                          cx="50%"
                          cy="50%"
                          outerRadius={100}
                          label={(entry) => `${entry.name}: ${entry.percentage}%`}
                        >
                          {chartData.map((_, index) => (
                            <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip
                          contentStyle={{ backgroundColor: '#1a1a1a', border: '1px solid #333' }}
                        />
                        <Legend />
                      </PieChart>
                    </ResponsiveContainer>
                  )}

                  <div className="space-y-3">
                    {results.map((result, index) => {
                      const percentage = totalVotes > 0 ? (Number(result.vote_count) / totalVotes) * 100 : 0;
                      return (
                        <div key={result.option_id} className="space-y-2">
                          <div className="flex justify-between text-sm">
                            <span className="font-medium">{result.option_text}</span>
                            <span className="text-muted-foreground">
                              {result.vote_count} votes ({percentage.toFixed(1)}%)
                            </span>
                          </div>
                          <div className="h-2 bg-secondary rounded-full overflow-hidden">
                            <div
                              className="h-full transition-all duration-500"
                              style={{
                                width: `${percentage}%`,
                                backgroundColor: CHART_COLORS[index % CHART_COLORS.length],
                              }}
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {voters.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Voters</CardTitle>
                <CardDescription>
                  People who have voted in this poll
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Vote</TableHead>
                      <TableHead>Time</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {voters.map((voter, index) => (
                      <TableRow key={index}>
                        <TableCell>{voter.voter_name}</TableCell>
                        <TableCell>{voter.option_text}</TableCell>
                        <TableCell>
                          {new Date(voter.voted_at).toLocaleString()}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          )}

          <div className="text-center">
            <Link href="/admin">
              <Button variant="outline">Back to Dashboard</Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

