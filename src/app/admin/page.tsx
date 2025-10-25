'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Navbar } from '@/components/navbar';
import { supabase } from '@/lib/supabase/client';
import { getCurrentUser, signOut } from '@/lib/supabase/auth';
import { PollWithOptions } from '@/lib/types';
import Link from 'next/link';
import { toast } from 'sonner';

export default function AdminDashboard() {
  const router = useRouter();
  const [polls, setPolls] = useState<PollWithOptions[]>([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    const { user, error } = await getCurrentUser();
    if (error || !user) {
      router.push('/admin/login');
      return;
    }
    setUser(user);
    loadPolls(user.id);
  };

  const loadPolls = async (userId: string) => {
    try {
      const { data: pollsData, error: pollsError } = await supabase
        .from('polls')
        .select(`
          *,
          options:poll_options(*),
          access_codes(code_display)
        `)
        .eq('admin_id', userId)
        .order('created_at', { ascending: false });

      if (pollsError) throw pollsError;

      // Get vote counts for each poll
      const pollsWithVotes = await Promise.all(
        (pollsData || []).map(async (poll) => {
          const { count } = await supabase
            .from('votes')
            .select('*', { count: 'exact', head: true })
            .eq('poll_id', poll.id);

          return {
            ...poll,
            total_votes: count || 0,
            access_code: poll.access_codes?.[0]?.code_display,
          };
        })
      );

      setPolls(pollsWithVotes);
    } catch (err: any) {
      toast.error('Failed to load polls');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSignOut = async () => {
    await signOut();
    router.push('/');
  };

  const handleDeletePoll = async (pollId: string) => {
    if (!confirm('Are you sure you want to delete this poll? This cannot be undone.')) {
      return;
    }

    try {
      const { error } = await supabase.from('polls').delete().eq('id', pollId);
      if (error) throw error;

      toast.success('Poll deleted successfully');
      if (user) loadPolls(user.id);
    } catch (err: any) {
      toast.error('Failed to delete poll');
      console.error(err);
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

  return (
    <div className="min-h-screen">
      <Navbar />
      
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold">Admin Dashboard</h1>
            <p className="text-muted-foreground">Manage your polls</p>
          </div>
          <div className="flex flex-col sm:flex-row gap-2 sm:gap-4">
            <Link href="/admin/new">
              <Button size="lg" className="w-full sm:w-auto">
                Create New Poll
              </Button>
            </Link>
            <Button variant="outline" size="lg" onClick={handleSignOut} className="w-full sm:w-auto">
              Sign Out
            </Button>
          </div>
        </div>

        {polls.length === 0 ? (
          <Card>
            <CardContent className="py-20 text-center">
              <h2 className="text-2xl font-semibold mb-2">No polls yet</h2>
              <p className="text-muted-foreground mb-6">
                Create your first poll to get started
              </p>
              <Link href="/admin/new">
                <Button>Create Poll</Button>
              </Link>
            </CardContent>
          </Card>
        ) : (
          <Card className="bg-gradient-to-br from-card to-card/50">
            <CardHeader>
              <CardTitle>Your Polls</CardTitle>
              <CardDescription>
                Click on a poll to view detailed results
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Poll Title</TableHead>
                      <TableHead>Access Code</TableHead>
                      <TableHead>Total Votes</TableHead>
                      <TableHead>Created</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {polls.map((poll) => (
                      <TableRow key={poll.id}>
                        <TableCell className="font-medium">{poll.title}</TableCell>
                        <TableCell>
                          <Badge variant="secondary" className="font-mono">
                            {poll.access_code}
                          </Badge>
                        </TableCell>
                        <TableCell>{poll.total_votes}</TableCell>
                        <TableCell>
                          {new Date(poll.created_at).toLocaleDateString()}
                        </TableCell>
                        <TableCell>
                          <div className="flex flex-col sm:flex-row gap-2">
                            <Link href={`/admin/poll/${poll.id}`}>
                              <Button variant="outline" size="sm" className="w-full sm:w-auto">
                                View Results
                              </Button>
                            </Link>
                            <Button
                              variant="destructive"
                              size="sm"
                              onClick={() => handleDeletePoll(poll.id)}
                              className="w-full sm:w-auto"
                            >
                              Delete
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}

