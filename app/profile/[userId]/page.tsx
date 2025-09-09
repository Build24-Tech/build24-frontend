'use client';

import { PrivateProfileMessage } from '@/components/profile/PrivateProfileMessage';
import { ProfileNotFound } from '@/components/profile/ProfileNotFound';
import { PublicProfileView } from '@/components/profile/PublicProfileView';
import { useAuth } from '@/contexts/AuthContext';
import { followService } from '@/lib/follow-service';
import { profileService } from '@/lib/profile-service';
import { PublicProfileView as PublicProfileViewType } from '@/types/user';
import { useEffect, useState } from 'react';

interface ProfilePageProps {
  params: {
    userId: string;
  };
}

export default function ProfilePage({ params }: ProfilePageProps) {
  const { userId } = params;
  const { user } = useAuth();
  const [profile, setProfile] = useState<PublicProfileViewType | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [followLoading, setFollowLoading] = useState(false);

  useEffect(() => {
    const loadProfile = async () => {
      try {
        setLoading(true);
        setError(null);

        const profileData = await profileService.getPublicProfile(userId);

        if (!profileData) {
          setError('PROFILE_NOT_FOUND');
          return;
        }

        // Check if current user is following this profile
        if (user && user.uid !== userId) {
          const isFollowing = await followService.isFollowing(user.uid, userId);
          profileData.isFollowing = isFollowing;
        }

        setProfile(profileData);
      } catch (err) {
        console.error('Error loading profile:', err);
        if (err instanceof Error) {
          if (err.message.includes('PROFILE_NOT_FOUND')) {
            setError('PROFILE_NOT_FOUND');
          } else if (err.message.includes('PROFILE_PRIVATE')) {
            setError('PROFILE_PRIVATE');
          } else {
            setError('UNKNOWN_ERROR');
          }
        } else {
          setError('UNKNOWN_ERROR');
        }
      } finally {
        setLoading(false);
      }
    };

    if (userId) {
      loadProfile();
    }
  }, [userId, user]);

  const handleFollowToggle = async (isFollowing: boolean) => {
    if (!user || !profile) return;

    try {
      setFollowLoading(true);

      if (isFollowing) {
        await followService.followUser(user.uid, userId);
      } else {
        await followService.unfollowUser(user.uid, userId);
      }

      // Update local state
      setProfile(prev => prev ? {
        ...prev,
        isFollowing,
        followerCount: prev.followerCount + (isFollowing ? 1 : -1)
      } : null);
    } catch (err) {
      console.error('Error toggling follow:', err);
      // Revert the optimistic update on error
      setProfile(prev => prev ? {
        ...prev,
        isFollowing: !isFollowing,
        followerCount: prev.followerCount + (isFollowing ? -1 : 1)
      } : null);
    } finally {
      setFollowLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="w-full max-w-2xl mx-auto">
          <div className="animate-pulse">
            <div className="bg-muted rounded-lg p-8">
              <div className="flex flex-col items-center space-y-4">
                <div className="w-24 h-24 bg-muted-foreground/20 rounded-full"></div>
                <div className="w-48 h-6 bg-muted-foreground/20 rounded"></div>
                <div className="w-32 h-4 bg-muted-foreground/20 rounded"></div>
              </div>
              <div className="mt-8 space-y-3">
                <div className="w-full h-4 bg-muted-foreground/20 rounded"></div>
                <div className="w-3/4 h-4 bg-muted-foreground/20 rounded"></div>
                <div className="w-1/2 h-4 bg-muted-foreground/20 rounded"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error === 'PROFILE_NOT_FOUND') {
    return (
      <div className="container mx-auto px-4 py-8">
        <ProfileNotFound
          userId={userId}
          message="The profile you're looking for doesn't exist or has been removed."
        />
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="container mx-auto px-4 py-8">
        <ProfileNotFound
          userId={userId}
          message="Unable to load profile. Please try again later."
        />
      </div>
    );
  }

  // Check if profile is private and user is not the owner
  const isOwnProfile = user?.uid === userId;
  const isProfilePrivate = !profile.bio && !profile.location && !profile.website && !profile.work && !profile.role && !profile.email;

  if (isProfilePrivate && !isOwnProfile) {
    return (
      <div className="container mx-auto px-4 py-8">
        <PrivateProfileMessage
          displayName={profile.displayName}
          photoURL={profile.photoURL}
          currentUserId={user?.uid}
          targetUserId={userId}
          onFollowToggle={handleFollowToggle}
          isFollowing={profile.isFollowing}
          isLoading={followLoading}
        />
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <PublicProfileView
        profile={profile}
        currentUserId={user?.uid}
        onFollowToggle={handleFollowToggle}
        isLoading={followLoading}
      />
    </div>
  );
}
