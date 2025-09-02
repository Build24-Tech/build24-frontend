'use client';

import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { useState } from 'react';

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
  const [pendingAction, setPendingAction] = useState<'follow' | 'unfollow' | null>(null);
  const { toast } = useToast();

  const {
    isLoading,
    handleFollowOperation,
    validateFollow
  } = useFollowErrorHandling();

  // Prevent following yourself
  if (currentUserId === targetUserId) {
    return null;
  }

  const handleFollowToggle = async () => {
    // Validate the follow operation first
    const validationError = validateFollow(currentUserId, targetUserId);
    if (validationError) {
      toast({
        title: 'Error',
        description: validationError.message,
        variant: 'destructive',
      });
      return;
    }

    // Optimistic update
    const newFollowState = !isFollowing;
    setIsFollowing(newFollowState);
    setPendingAction(newFollowState ? 'follow' : 'unfollow');
    onFollowChange?.(newFollowState);

    const result = await handleFollowOperation(async () => {
      if (newFollowState) {
        await followService.followUser(currentUserId, targetUserId);
      } else {
        await followService.unfollowUser(currentUserId, targetUserId);
      }
    }, currentUserId, targetUserId);

    if (result) {
      // Success
      toast({
        title: 'Success',
        description: newFollowState
          ? 'You are now following this user.'
          : 'You have unfollowed this user.',
      });
    } else {
      // Error occurred, revert optimistic update
      setIsFollowing(!newFollowState);
      onFollowChange?.(!newFollowState);
    }

    setPendingAction(null);
  };

  return (
    <Button
      onClick={handleFollowToggle}
      disabled={disabled || isLoading}
      variant={isFollowing ? 'outline' : 'default'}
      size={size}
      className={isFollowing ? 'hover:bg-destructive hover:text-destructive-foreground' : ''}
    >
      {isLoading ? (
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
