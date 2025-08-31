'use client';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import Link from 'next/link';

interface AuthorBadgeProps {
  authorId?: string;
  authorName?: string;
  authorPhotoURL?: string;
  role?: string;
  variant?: 'default' | 'secondary' | 'outline';
  size?: 'sm' | 'md';
  showRole?: boolean;
  className?: string;
}

const sizeClasses = {
  sm: {
    avatar: 'h-5 w-5',
    text: 'text-xs',
    padding: 'px-2 py-1',
    gap: 'gap-1.5'
  },
  md: {
    avatar: 'h-6 w-6',
    text: 'text-sm',
    padding: 'px-3 py-1.5',
    gap: 'gap-2'
  }
};

export function AuthorBadge({
  authorId,
  authorName,
  authorPhotoURL,
  role,
  variant = 'secondary',
  size = 'sm',
  showRole = false,
  className
}: AuthorBadgeProps) {
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

  const sizeConfig = sizeClasses[size];

  const badgeContent = (
    <div className={cn(
      'flex items-center',
      sizeConfig.gap
    )}>
      <Avatar className={sizeConfig.avatar}>
        <AvatarImage src={authorPhotoURL} alt={displayName} />
        <AvatarFallback className="text-[10px] font-medium">
          {initials}
        </AvatarFallback>
      </Avatar>

      <div className="flex items-center gap-1 min-w-0">
        <span className={cn(
          'font-medium truncate max-w-[100px]',
          sizeConfig.text
        )}>
          {displayName}
        </span>

        {showRole && role && (
          <>
            <span className={cn('text-muted-foreground', sizeConfig.text)}>
              •
            </span>
            <span className={cn(
              'text-muted-foreground truncate max-w-[80px]',
              sizeConfig.text
            )}>
              {role}
            </span>
          </>
        )}
      </div>
    </div>
  );

  const badge = (
    <Badge
      variant={variant}
      className={cn(
        'inline-flex items-center',
        sizeConfig.padding,
        'hover:bg-accent/80 transition-colors',
        className
      )}
    >
      {badgeContent}
    </Badge>
  );

  // If we have an authorId, make it a link to their profile
  if (authorId) {
    return (
      <Link
        href={`/profile/${authorId}`}
        className="inline-flex"
      >
        {badge}
      </Link>
    );
  }

  // Otherwise, just display the badge without a link
  return badge;
}
