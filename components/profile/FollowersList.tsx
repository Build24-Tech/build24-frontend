'use client';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { getFollowers } from '@/lib/follow-service';
import { PublicProfileView } from '@/types/user';
import Link from 'next/link';
import { useEffect, useState } from 'react';

interface FollowersListProps {
  userId: string;
  initialFollowers?: PublicProfileView[];
  pageSize?: number;
  showTitle?: boolean;
}

export function FollowersList({
  userId,
  initialFollowers = [],
  pageSize = 10,
  showTitle = true
}: FollowersListProps) {
  const [followers, setFollowers] = useState<PublicProfileView[]>(initialFollowers);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (initialFollowers.length === 0) {
      loadFollowers();
    }
  }, [userId]);

  const loadFollowers = async (loadMore = false) => {
    if (loading) return;

    setLoading(true);
    setError(null);

    try {
      const newFollowers = await getFollowers(userId, pageSize);

      if (loadMore) {
        setFollowers(prev => [...prev, ...newFollowers]);
      } else {
        setFollowers(newFollowers);
      }

      setHasMore(newFollowers.length === pageSize);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load followers');
    } finally {
      setLoading(false);
    }
  };

  const handleLoadMore = () => {
    loadFollowers(true);
  };

  if (error) {
    return (
      <Card>
        <CardContent className="p-6">
          <p className="text-center text-muted-foreground">
            Failed to load followers: {error}
          </p>
          <Button
            onClick={() => loadFollowers()}
            variant="outline"
            className="mt-4 w-full"
          >
            Try Again
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      {showTitle && (
        <CardHeader>
          <CardTitle>Followers ({followers.length})</CardTitle>
        </CardHeader>
      )}
      <CardContent className="p-6">
        {followers.length === 0 && !loading ? (
          <p className="text-center text-muted-foreground py-8">
            No followers yet.
          </p>
        ) : (
          <div className="space-y-4">
            {followers.map((follower) => (
              <div key={follower.uid} className="flex items-center gap-3">
                <Avatar className="h-10 w-10">
                  <AvatarImage src={follower.photoURL} alt={follower.displayName} />
                  <AvatarFallback>
                    {follower.displayName?.charAt(0).toUpperCase() || 'U'}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <Link
                    href={`/profile/${follower.uid}`}
                    className="font-medium hover:underline truncate block"
                  >
                    {follower.displayName || 'Anonymous User'}
                  </Link>
                  {follower.bio && (
                    <p className="text-sm text-muted-foreground truncate">
                      {follower.bio}
                    </p>
                  )}
                </div>
                <div className="text-sm text-muted-foreground">
                  {follower.followerCount} followers
                </div>
              </div>
            ))}

            {loading && (
              <div className="space-y-4">
                {Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <Skeleton className="h-10 w-10 rounded-full" />
                    <div className="flex-1 space-y-2">
                      <Skeleton className="h-4 w-32" />
                      <Skeleton className="h-3 w-48" />
                    </div>
                    <Skeleton className="h-3 w-16" />
                  </div>
                ))}
              </div>
            )}

            {hasMore && !loading && followers.length > 0 && (
              <Button
                onClick={handleLoadMore}
                variant="outline"
                className="w-full mt-4"
              >
                Load More
              </Button>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
