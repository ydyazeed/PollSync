'use client';

import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import Link from 'next/link';
import { Navbar } from '@/components/navbar';

export default function Home() {
  return (
    <div className="min-h-screen">
      <Navbar />
      
      <main className="container mx-auto px-4 py-20">
        <div className="max-w-4xl mx-auto text-center space-y-8">
          <h1 className="text-5xl md:text-6xl font-bold tracking-tight">
            Real-time Opinion Polling
          </h1>
          
          <p className="text-xl text-white max-w-2xl mx-auto">
            Create polls, share codes, and watch results update live.
            No registration required for voters.
          </p>
          
          <div className="grid md:grid-cols-2 gap-6 mt-12 max-w-3xl mx-auto">
            <Card className="p-8 hover:border-primary transition-colors bg-gradient-to-br from-card to-card/50">
              <div className="space-y-4">
                <h2 className="text-2xl font-semibold">Create a Poll</h2>
                <p className="text-muted-foreground">
                  Set up your poll with custom options and get instant access codes
                </p>
                <Link href="/admin/login">
                  <Button className="w-full" size="lg">
                    Get Started
                  </Button>
                </Link>
              </div>
            </Card>
            
            <Card className="p-8 hover:border-primary transition-colors bg-gradient-to-br from-card to-card/50">
              <div className="space-y-4">
                <h2 className="text-2xl font-semibold">I Have a Code</h2>
                <p className="text-muted-foreground">
                  Enter your access code to participate in a poll
                </p>
                <Link href="/vote">
                  <Button variant="outline" className="w-full" size="lg">
                    Enter Code
                  </Button>
                </Link>
              </div>
            </Card>
          </div>
          
          <div className="mt-20 pt-20 border-t border-border">
            <h3 className="text-2xl font-semibold mb-8">How it works</h3>
            <div className="grid md:grid-cols-3 gap-8 text-left">
              <div className="space-y-2">
                <div className="text-3xl font-bold text-primary">1</div>
                <h4 className="font-semibold">Create Your Poll</h4>
                <p className="text-sm text-muted-foreground">
                  Sign up as an admin and create a poll with your questions and options
                </p>
              </div>
              <div className="space-y-2">
                <div className="text-3xl font-bold text-primary">2</div>
                <h4 className="font-semibold">Share the Code</h4>
                <p className="text-sm text-muted-foreground">
                  Get a unique access code and share it with your audience
                </p>
              </div>
              <div className="space-y-2">
                <div className="text-3xl font-bold text-primary">3</div>
                <h4 className="font-semibold">Watch Results Live</h4>
                <p className="text-sm text-muted-foreground">
                  See votes come in real-time with beautiful visualizations
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
