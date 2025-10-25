'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Navbar } from '@/components/navbar';
import Link from 'next/link';

export default function VoteEntryPage() {
  const router = useRouter();
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // Normalize code: remove spaces, uppercase
      const normalizedCode = code.replace(/\s/g, '').toUpperCase();
      
      const response = await fetch('/api/codes/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: normalizedCode }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Invalid code');
      }

      // Store normalized code in session storage for vote submission
      sessionStorage.setItem(`poll_code_${data.poll_id}`, normalizedCode);
      
      router.push(`/vote/${data.poll_id}`);
    } catch (err: any) {
      setError(err.message || 'Invalid access code');
    } finally {
      setLoading(false);
    }
  };

  const formatCode = (value: string) => {
    // Remove any non-alphanumeric characters
    const cleaned = value.toUpperCase().replace(/[^A-Z0-9]/g, '');
    
    // Format as XX XX-XX
    if (cleaned.length <= 2) return cleaned;
    if (cleaned.length <= 4) return `${cleaned.slice(0, 2)}${cleaned.slice(2)}`;
    return `${cleaned.slice(0, 2)}${cleaned.slice(2, 4)}-${cleaned.slice(4, 6)}`;
  };

  return (
    <div className="min-h-screen">
      <Navbar />
      
      <div className="container mx-auto px-4 py-20">
        <div className="max-w-md mx-auto">
          <Card className="bg-gradient-to-br from-card to-card/50">
            <CardHeader>
              <CardTitle>Enter Access Code</CardTitle>
              <CardDescription>
                Enter the poll access code you received
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="code">Access Code</Label>
                  <Input
                    id="code"
                    type="text"
                    placeholder="AB12-34"
                    value={code}
                    onChange={(e) => setCode(formatCode(e.target.value))}
                    maxLength={7}
                    className="font-mono text-lg text-center tracking-wider"
                    required
                  />
                  <p className="text-xs text-muted-foreground">
                    Format: XX XX-XX (e.g., AB12-34)
                  </p>
                </div>

                {error && (
                  <Alert variant="destructive">
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}

                <Button type="submit" className="w-full" size="lg" disabled={loading}>
                  {loading ? 'Verifying...' : 'Continue to Poll'}
                </Button>

                <div className="text-center text-sm text-muted-foreground">
                  <Link href="/" className="hover:text-primary">
                    ← Back to home
                  </Link>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

