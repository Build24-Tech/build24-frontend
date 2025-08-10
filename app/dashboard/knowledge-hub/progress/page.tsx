'use client';

import BadgeNotification from '@/components/knowledge-hub/BadgeNotification';
import ProgressTracker from '@/components/knowledge-hub/ProgressTracker';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { useProgressTracker } from '@/hooks/use-progress-tracker';
import { AlertCircle } from 'lucide-react';

const ProgressPageSkeleton = () => (
  <div className="container mx-auto px-4 py-8 space-y-6">
    <Skeleton className="h-10 w-64" />

    {/* Stats cards skeleton */}
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {Array.from({ length: 4 }).map((_, i) => (
        <Card key={i}>
          <CardContent className="p-4">
            <Skeleton className="h-16 w-full" />
          </CardContent>
        </Card>
      ))}
    </div>

    {/* Progress card skeleton */}
    <Card>
      <CardContent className="p-6">
        <Skeleton className="h-6 w-48 mb-4" />
        <Skeleton className="h-4 w-full mb-2" />
        <Skeleton className="h-2 w-full" />
      </CardContent>
    </Card>

    {/* Badges section skeleton */}
    <Card>
      <CardContent className="p-6">
        <Skeleton className="h-6 w-32 mb-4" />
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
          {Array.from({ length: 8 }).map((_, i) => (
            <Skeleton key={i} className="h-20 w-full" />
          ))}
        </div>
      </CardContent>
    </Card>
  </div>
);

export default function ProgressPage() {
  const {
    userProgress,
    isLoading,
    error,
    newBadges,
    dismissBadgeNotifications
  } = useProgressTracker();

  if (isLoading) {
    return <ProgressPageSkeleton />;
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8">Your Learning Progress</h1>
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            {error}. Please try refreshing the page.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  if (!userProgress) {
    return (
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8">Your Learning Progress</h1>
        <div className="text-center py-12">
          <p className="text-gray-600 dark:text-gray-400">
            Please log in to view your learning progress.
          </p>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8">Your Learning Progress</h1>

        <ProgressTracker
          userProgress={userProgress}
          showDetailedStats={true}
        />
      </div>

      {/* Badge notifications */}
      <BadgeNotification
        badges={newBadges}
        onDismiss={dismissBadgeNotifications}
      />
    </>
  );
}
