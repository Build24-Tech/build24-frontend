'use client';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { getFollowing } from '@/lib/follow-service';
import { PublicProfileView } from '@/types/user';
import Link from 'next/link';
import { useEffect, useState } from 'react';

interface FollowingListProps {
  userId: string;
  initialFollowing?: PublicProfileView[];
  pageSize?: number;
  showTitle?: boolean;
}

export function FollowingList({
  userId,
  initialFollowing = [],
  pageSize = 10,
  showTitle = true
}: FollowingListProps) {
  const [following, setFollowing] = useState<PublicProfileView[]>(initialFollowing);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (initialFollowing.length === 0) {
      loadFollowing();
    }
  }, [userId]);

  const loadFollowing = async (loadMore = false) => {
    if (loading) return;

    setLoading(true);
    setError(null);

    try {
      const newFollowing = await getFollowing(userId, pageSize);

      if (loadMore) {
        setFollowing(prev => [...prev, ...newFollowing]);
      } else {
        setFollowing(newFollowing);
      }

      setHasMore(newFollowing.length === pageSize);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load following');
    } finally {
      setLoading(false);
    }
  };

  const handleLoadMore = () => {
    loadFollowing(true);
  };

  if (error) {
    return (
      <Card>
        <CardContent className="p-6">
          <p className="text-center text-muted-foreground">
            Failed to load following: {error}
          </p>
          <Button
            onClick={() => loadFollowing()}
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
          <CardTitle>Following ({following.length})</CardTitle>
        </CardHeader>
      )}
      <CardContent className="p-6">
        {following.length === 0 && !loading ? (
          <p className="text-center text-muted-foreground py-8">
            Not following anyone yet.
          </p>
        ) : (
          <div className="space-y-4">
            {following.map((user) => (
              <div key={user.uid} className="flex items-center gap-3">
                <Avatar className="h-10 w-10">
                  <AvatarImage src={user.photoURL} alt={user.displayName} />
                  <AvatarFallback>
                    {user.displayName?.charAt(0).toUpperCase() || 'U'}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <Link
                    href={`/profile/${user.uid}`}
                    className="font-medium hover:underline truncate block"
                  >
                    {user.displayName || 'Anonymous User'}
                  </Link>
                  {user.bio && (
                    <p className="text-sm text-muted-foreground truncate">
                      {user.bio}
                    </p>
                  )}
                </div>
                <div className="text-sm text-muted-foreground">
                  {user.followerCount} followers
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

            {hasMore && !loading && following.length > 0 && (
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
