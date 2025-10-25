'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Button } from '@/components/ui/button';

export function Navbar() {
  const pathname = usePathname();
  const isAdminRoute = pathname?.startsWith('/admin');

  return (
    <nav className="border-b border-border">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <Link href="/" className="text-2xl font-bold text-primary">
            PollSync
          </Link>
          
          {isAdminRoute && (
            <div className="flex items-center gap-4">
              <Link href="/admin">
                <Button variant="ghost">Dashboard</Button>
              </Link>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}


