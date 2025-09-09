'use client';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { Briefcase, Globe, MapPin, Users } from 'lucide-react';
import Link from 'next/link';

interface AuthorCardProps {
  authorId?: string;
  authorName?: string;
  authorPhotoURL?: string;
  bio?: string;
  location?: string;
  work?: string;
  role?: string;
  website?: string;
  followerCount?: number;
  followingCount?: number;
  className?: string;
  compact?: boolean;
}

export function AuthorCard({
  authorId,
  authorName,
  authorPhotoURL,
  bio,
  location,
  work,
  role,
  website,
  followerCount,
  followingCount,
  className,
  compact = false
}: AuthorCardProps) {
  // If no author information is provided, don't render anything
  if (!authorId && !authorName) {
    return null;
  }

  const displayName = authorName || 'Anonymous';
  const initials = displayName
    .split(' ')
    .map(name => name.charAt(0))
    .join('')
    .toUpperCase()
    .slice(0, 2);

  const cardContent = (
    <CardContent className={cn('p-4', compact && 'p-3')}>
      <div className="flex items-start gap-3">
        <Avatar className={cn('h-12 w-12', compact && 'h-10 w-10')}>
          <AvatarImage src={authorPhotoURL} alt={displayName} />
          <AvatarFallback className="text-sm font-medium">
            {initials}
          </AvatarFallback>
        </Avatar>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <h3 className={cn(
              'font-semibold text-foreground truncate',
              compact ? 'text-sm' : 'text-base'
            )}>
              {displayName}
            </h3>
            {role && (
              <Badge variant="secondary" className="text-xs">
                {role}
              </Badge>
            )}
          </div>

          {!compact && bio && (
            <p className="text-sm text-muted-foreground mb-2 line-clamp-2">
              {bio}
            </p>
          )}

          <div className="flex flex-wrap gap-2 text-xs text-muted-foreground">
            {work && (
              <div className="flex items-center gap-1">
                <Briefcase className="h-3 w-3" />
                <span className="truncate max-w-[120px]">{work}</span>
              </div>
            )}
            {location && (
              <div className="flex items-center gap-1">
                <MapPin className="h-3 w-3" />
                <span className="truncate max-w-[100px]">{location}</span>
              </div>
            )}
            {website && (
              <div className="flex items-center gap-1">
                <Globe className="h-3 w-3" />
                <span className="truncate max-w-[100px]">
                  {website.replace(/^https?:\/\//, '')}
                </span>
              </div>
            )}
          </div>

          {!compact && (followerCount !== undefined || followingCount !== undefined) && (
            <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
              {followerCount !== undefined && (
                <div className="flex items-center gap-1">
                  <Users className="h-3 w-3" />
                  <span>{followerCount} followers</span>
                </div>
              )}
              {followingCount !== undefined && (
                <div className="flex items-center gap-1">
                  <span>{followingCount} following</span>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </CardContent>
  );

  return (
    <Card className={cn('w-full max-w-sm', className)}>
      {authorId ? (
        <Link
          href={`/profile/${authorId}`}
          className="block hover:bg-accent/50 transition-colors rounded-lg"
        >
          {cardContent}
        </Link>
      ) : (
        cardContent
      )}
    </Card>
  );
}
