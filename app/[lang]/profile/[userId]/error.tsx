'use client';

import { ProfileNotFound } from '@/components/profile/ProfileNotFound';
import { Button } from '@/components/ui/button';
import { RefreshCw } from 'lucide-react';
import { useEffect } from 'react';

interface ProfileErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function ProfileError({ error, reset }: ProfileErrorProps) {
  useEffect(() => {
    console.error('Profile page error:', error);
  }, [error]);

  // Handle specific profile errors
  if (error.message.includes('PROFILE_NOT_FOUND')) {
    return (
      <div className="container mx-auto px-4 py-8">
        <ProfileNotFound
          message="The profile you're looking for doesn't exist or has been removed."
        />
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="w-full max-w-2xl mx-auto">
        <div className="text-center space-y-6">
          <div className="space-y-2">
            <h1 className="text-2xl font-bold">Something went wrong</h1>
            <p className="text-muted-foreground">
              We encountered an error while loading this profile.
            </p>
          </div>

          <div className="space-y-4">
            <Button onClick={reset} className="flex items-center gap-2">
              <RefreshCw className="w-4 h-4" />
              Try again
            </Button>

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
