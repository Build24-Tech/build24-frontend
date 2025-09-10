'use client';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { ArrowLeft, Lock, UserPlus } from 'lucide-react';
import Link from 'next/link';

interface PrivateProfileMessageProps {
  displayName?: string;
  photoURL?: string;
  currentUserId?: string;
  targetUserId: string;
  onFollowToggle?: (isFollowing: boolean) => void;
  isFollowing?: boolean;
  isLoading?: boolean;
}

export function PrivateProfileMessage({
  displayName,
  photoURL,
  currentUserId,
  targetUserId,
  onFollowToggle,
  isFollowing = false,
  isLoading = false
}: PrivateProfileMessageProps) {
  const canFollow = currentUserId && currentUserId !== targetUserId;

  const handleFollowClick = () => {
    if (onFollowToggle) {
      onFollowToggle(!isFollowing);
    }
  };

  const getInitials = (name?: string) => {
    if (!name) return 'U';
    return name
      .split(' ')
      .map(word => word.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <div className="w-full max-w-2xl mx-auto">
      <Card>
        <CardHeader className="text-center pb-4">
          <div className="flex flex-col items-center space-y-4">
            <Avatar className="w-24 h-24">
              <AvatarImage
                src={photoURL}
                alt={displayName || 'User avatar'}
              />
              <AvatarFallback className="text-lg">
                {getInitials(displayName)}
              </AvatarFallback>
            </Avatar>

            <div className="space-y-2">
              <h1 className="text-2xl font-bold">
                {displayName || 'Anonymous User'}
              </h1>
            </div>

            {canFollow && (
              <Button
                onClick={handleFollowClick}
                disabled={isLoading}
                variant={isFollowing ? "outline" : "default"}
                className="flex items-center gap-2"
              >
                <UserPlus className="w-4 h-4" />
                {isFollowing ? 'Unfollow' : 'Follow'}
              </Button>
            )}
          </div>
        </CardHeader>

        <CardContent className="text-center space-y-6">
          <div className="flex flex-col items-center space-y-4">
            <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center">
              <Lock className="w-8 h-8 text-muted-foreground" />
            </div>

            <div className="space-y-2">
              <h2 className="text-xl font-semibold">This profile is private</h2>
              <p className="text-muted-foreground max-w-md">
                This user has chosen to keep their profile private.
                Only basic information is visible to other users.
              </p>
            </div>
          </div>

          {canFollow && !isFollowing && (
            <div className="bg-muted/50 rounded-lg p-4 space-y-3">
              <p className="text-sm text-muted-foreground">
                Follow this user to stay updated with their activity on Build24.
              </p>
            </div>
          )}

          {canFollow && isFollowing && (
            <div className="bg-primary/10 rounded-lg p-4 space-y-3">
              <p className="text-sm text-muted-foreground">
                You are following this user. You'll see their public activity in your feed.
              </p>
            </div>
          )}

          <div className="pt-4">
            <Button variant="outline" asChild>
              <Link href="/dashboard" className="flex items-center gap-2">
                <ArrowLeft className="w-4 h-4" />
                Back to Dashboard
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
