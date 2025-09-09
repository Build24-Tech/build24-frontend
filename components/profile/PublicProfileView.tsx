'use client';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { PublicProfileView as PublicProfileViewType } from '@/types/user';
import {
  Briefcase,
  Calendar,
  Globe,
  Mail,
  MapPin,
  UserPlus,
  Users
} from 'lucide-react';
import Link from 'next/link';

interface PublicProfileViewProps {
  profile: PublicProfileViewType;
  currentUserId?: string;
  onFollowToggle?: (isFollowing: boolean) => void;
  isLoading?: boolean;
}

export function PublicProfileView({
  profile,
  currentUserId,
  onFollowToggle,
  isLoading = false
}: PublicProfileViewProps) {
  const isOwnProfile = currentUserId === profile.uid;
  const canFollow = currentUserId && !isOwnProfile;

  const handleFollowClick = () => {
    if (onFollowToggle) {
      onFollowToggle(!profile.isFollowing);
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

  const formatWebsiteUrl = (url?: string) => {
    if (!url) return '';
    return url.startsWith('http') ? url : `https://${url}`;
  };

  const formatWebsiteDisplay = (url?: string) => {
    if (!url) return '';
    return url.replace(/^https?:\/\//, '').replace(/\/$/, '');
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader className="text-center pb-4">
        <div className="flex flex-col items-center space-y-4">
          <Avatar className="w-24 h-24">
            <AvatarImage
              src={profile.photoURL}
              alt={profile.displayName || 'User avatar'}
            />
            <AvatarFallback className="text-lg">
              {getInitials(profile.displayName)}
            </AvatarFallback>
          </Avatar>

          <div className="space-y-2">
            <h1 className="text-2xl font-bold">
              {profile.displayName || 'Anonymous User'}
            </h1>

            {profile.role && (
              <Badge variant="secondary" className="text-sm">
                {profile.role}
              </Badge>
            )}
          </div>

          {canFollow && (
            <Button
              onClick={handleFollowClick}
              disabled={isLoading}
              variant={profile.isFollowing ? "outline" : "default"}
              className="flex items-center gap-2"
            >
              <UserPlus className="w-4 h-4" />
              {profile.isFollowing ? 'Unfollow' : 'Follow'}
            </Button>
          )}

          {isOwnProfile && (
            <Button asChild variant="outline">
              <Link href="/profile/edit">
                Edit Profile
              </Link>
            </Button>
          )}
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Bio Section */}
        {profile.bio && (
          <div>
            <p className="text-muted-foreground leading-relaxed">
              {profile.bio}
            </p>
          </div>
        )}

        {/* Profile Details */}
        <div className="space-y-3">
          {profile.work && (
            <div className="flex items-center gap-3 text-sm">
              <Briefcase className="w-4 h-4 text-muted-foreground flex-shrink-0" />
              <span>{profile.work}</span>
            </div>
          )}

          {profile.location && (
            <div className="flex items-center gap-3 text-sm">
              <MapPin className="w-4 h-4 text-muted-foreground flex-shrink-0" />
              <span>{profile.location}</span>
            </div>
          )}

          {profile.website && (
            <div className="flex items-center gap-3 text-sm">
              <Globe className="w-4 h-4 text-muted-foreground flex-shrink-0" />
              <Link
                href={formatWebsiteUrl(profile.website)}
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary hover:underline"
              >
                {formatWebsiteDisplay(profile.website)}
              </Link>
            </div>
          )}

          {profile.email && (
            <div className="flex items-center gap-3 text-sm">
              <Mail className="w-4 h-4 text-muted-foreground flex-shrink-0" />
              <Link
                href={`mailto:${profile.email}`}
                className="text-primary hover:underline"
              >
                {profile.email}
              </Link>
            </div>
          )}
        </div>

        <Separator />

        {/* Social Stats */}
        <div className="flex justify-center gap-8">
          <div className="text-center">
            <div className="flex items-center justify-center gap-1">
              <Users className="w-4 h-4 text-muted-foreground" />
              <span className="font-semibold text-lg">
                {profile.followerCount.toLocaleString()}
              </span>
            </div>
            <p className="text-sm text-muted-foreground">
              {profile.followerCount === 1 ? 'Follower' : 'Followers'}
            </p>
          </div>

          <div className="text-center">
            <div className="flex items-center justify-center gap-1">
              <UserPlus className="w-4 h-4 text-muted-foreground" />
              <span className="font-semibold text-lg">
                {profile.followingCount.toLocaleString()}
              </span>
            </div>
            <p className="text-sm text-muted-foreground">Following</p>
          </div>
        </div>

        {/* Member Since */}
        <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
          <Calendar className="w-4 h-4" />
          <span>Member since {new Date().getFullYear()}</span>
        </div>
      </CardContent>
    </Card>
  );
}
