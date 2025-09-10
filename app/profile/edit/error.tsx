'use client';

import { Button } from '@/components/ui/button';
import { ArrowLeft, RefreshCw } from 'lucide-react';
import Link from 'next/link';
import { useEffect } from 'react';

interface ProfileEditErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function ProfileEditError({ error, reset }: ProfileEditErrorProps) {
  useEffect(() => {
    console.error('Profile edit page error:', error);
  }, [error]);

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="w-full max-w-2xl mx-auto">
        <div className="text-center space-y-6">
          <div className="space-y-2">
            <h1 className="text-2xl font-bold">Unable to load profile editor</h1>
            <p className="text-muted-foreground">
              We encountered an error while loading the profile editing form.
            </p>
          </div>

          <div className="space-y-4">
            <div className="flex gap-3 justify-center">
              <Button onClick={reset} className="flex items-center gap-2">
                <RefreshCw className="w-4 h-4" />
                Try again
              </Button>

              <Button variant="outline" asChild>
                <Link href="/dashboard" className="flex items-center gap-2">
                  <ArrowLeft className="w-4 h-4" />
                  Back to Dashboard
                </Link>
              </Button>
            </div>

            <div className="text-sm text-muted-foreground">
              <p>Error details: {error.message}</p>
              {error.digest && (
                <p className="mt-1">Error ID: {error.digest}</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
