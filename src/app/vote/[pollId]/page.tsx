'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Navbar } from '@/components/navbar';
import { supabase } from '@/lib/supabase/client';
import { Poll, PollOption } from '@/lib/types';
import { toast } from 'sonner';

export default function VotePage() {
  const router = useRouter();
  const params = useParams();
  const pollId = params.pollId as string;
  
  const [poll, setPoll] = useState<Poll | null>(null);
  const [options, setOptions] = useState<PollOption[]>([]);
  const [selectedOption, setSelectedOption] = useState('');
  const [voterName, setVoterName] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [voterUuid, setVoterUuid] = useState('');

  useEffect(() => {
    // Get or create voter UUID
    const storageKey = `voter_uuid_${pollId}`;
    let uuid = localStorage.getItem(storageKey);
    
    if (!uuid) {
      uuid = crypto.randomUUID();
      localStorage.setItem(storageKey, uuid);
    }
    
    setVoterUuid(uuid);
    loadPoll();
  }, [pollId]);

  const loadPoll = async () => {
    try {
      const { data: pollData, error: pollError } = await supabase
        .from('polls')
        .select('*')
        .eq('id', pollId)
        .single();

      if (pollError) throw pollError;

      const { data: optionsData, error: optionsError } = await supabase
        .from('poll_options')
        .select('*')
        .eq('poll_id', pollId)
        .order('option_order');

      if (optionsError) throw optionsError;

      setPoll(pollData);
      setOptions(optionsData || []);
    } catch (err: any) {
      setError('Failed to load poll');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedOption) {
      toast.error('Please select an option');
      return;
    }

    if (!voterName.trim()) {
      toast.error('Please enter your name');
      return;
    }

    setSubmitting(true);
    setError('');

    try {
      // Get the access code from session storage (set during code verification)
      const code = sessionStorage.getItem(`poll_code_${pollId}`) || '';

      const response = await fetch(`/api/polls/${pollId}/vote`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          option_id: selectedOption,
          voter_uuid: voterUuid,
          voter_name: voterName.trim(),
          code,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to submit vote');
      }

      toast.success('Vote submitted successfully!');
      router.push(`/poll/${pollId}/results`);
    } catch (err: any) {
      setError(err.message || 'Failed to submit vote');
      toast.error(err.message || 'Failed to submit vote');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen">
        <Navbar />
        <div className="container mx-auto px-4 py-20 text-center">
          <p>Loading poll...</p>
        </div>
      </div>
    );
  }

  if (error && !poll) {
    return (
      <div className="min-h-screen">
        <Navbar />
        <div className="container mx-auto px-4 py-20 text-center">
          <Alert variant="destructive" className="max-w-md mx-auto">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <Navbar />
      
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          <Card>
            <CardHeader>
              <CardTitle className="text-2xl">{poll?.title}</CardTitle>
              {poll?.description && (
                <CardDescription className="text-base">
                  {poll.description}
                </CardDescription>
              )}
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="name">Your Name *</Label>
                  <Input
                    id="name"
                    type="text"
                    placeholder="Enter your name"
                    value={voterName}
                    onChange={(e) => setVoterName(e.target.value)}
                    required
                  />
                </div>

                <div className="space-y-4">
                  <Label>Select your choice *</Label>
                  <RadioGroup value={selectedOption} onValueChange={setSelectedOption}>
                    {options.map((option) => (
                      <div
                        key={option.id}
                        className="flex items-center space-x-3 border border-border rounded-lg p-4 hover:border-primary transition-colors cursor-pointer"
                        onClick={() => setSelectedOption(option.id)}
                      >
                        <RadioGroupItem value={option.id} id={option.id} />
                        <Label htmlFor={option.id} className="flex-1 cursor-pointer">
                          {option.option_text}
                        </Label>
                      </div>
                    ))}
                  </RadioGroup>
                </div>

                {error && (
                  <Alert variant="destructive">
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}

                <Button type="submit" className="w-full" size="lg" disabled={submitting}>
                  {submitting ? 'Submitting...' : 'Submit Vote'}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}


