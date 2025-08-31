'use client';

import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { followUser, unfollowUser } from '@/lib/follow-service';
import { useState, useTransition } from 'react';

interface FollowButtonProps {
  targetUserId: string;
  currentUserId: string;
  initialFollowState: boolean;
  onFollowChange?: (isFollowing: boolean) => void;
  disabled?: boolean;
  size?: 'sm' | 'default' | 'lg';
}

export function FollowButton({
  targetUserId,
  currentUserId,
  initialFollowState,
  onFollowChange,
  disabled = false,
  size = 'default'
}: FollowButtonProps) {
  const [isFollowing, setIsFollowing] = useState(initialFollowState);
  const [isPending, startTransition] = useTransition();
  const [pendingAction, setPendingAction] = useState<'follow' | 'unfollow' | null>(null);
  const { toast } = useToast();

  // Prevent following yourself
  if (currentUserId === targetUserId) {
    return null;
  }

  const handleFollowToggle = () => {
    // Optimistic update
    const newFollowState = !isFollowing;
    setIsFollowing(newFollowState);
    setPendingAction(newFollowState ? 'follow' : 'unfollow');
    onFollowChange?.(newFollowState);

    startTransition(async () => {
      try {
        if (newFollowState) {
          await followUser(currentUserId, targetUserId);
          toast({
            title: 'Success',
            description: 'You are now following this user.',
          });
        } else {
          await unfollowUser(currentUserId, targetUserId);
          toast({
            title: 'Success',
            description: 'You have unfollowed this user.',
          });
        }
      } catch (error) {
        // Revert optimistic update on error
        setIsFollowing(!newFollowState);
        onFollowChange?.(!newFollowState);

        toast({
          title: 'Error',
          description: error instanceof Error ? error.message : 'Failed to update follow status.',
          variant: 'destructive',
        });
      } finally {
        setPendingAction(null);
      }
    });
  };

  return (
    <Button
      onClick={handleFollowToggle}
      disabled={disabled || isPending}
      variant={isFollowing ? 'outline' : 'default'}
      size={size}
      className={isFollowing ? 'hover:bg-destructive hover:text-destructive-foreground' : ''}
    >
      {isPending ? (
        <div className="flex items-center gap-2">
          <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
          {pendingAction === 'follow' ? 'Following...' : 'Unfollowing...'}
        </div>
      ) : (
        isFollowing ? 'Unfollow' : 'Follow'
      )}
    </Button>
  );
}
