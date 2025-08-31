'use client';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { cn } from '@/lib/utils';
import Link from 'next/link';

interface AuthorProfileLinkProps {
  authorId?: string;
  authorName?: string;
  authorPhotoURL?: string;
  showAvatar?: boolean;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const sizeClasses = {
  sm: {
    avatar: 'h-6 w-6',
    text: 'text-sm',
    gap: 'gap-2'
  },
  md: {
    avatar: 'h-8 w-8',
    text: 'text-base',
    gap: 'gap-2'
  },
  lg: {
    avatar: 'h-10 w-10',
    text: 'text-lg',
    gap: 'gap-3'
  }
};

export function AuthorProfileLink({
  authorId,
  authorName,
  authorPhotoURL,
  showAvatar = true,
  size = 'md',
  className
}: AuthorProfileLinkProps) {
  // If no author information is provided, don't render anything
  if (!authorId && !authorName) {
    return null;
  }

  const sizeConfig = sizeClasses[size];
  const displayName = authorName || 'Anonymous';
  const initials = displayName
    .split(' ')
    .map(name => name.charAt(0))
    .join('')
    .toUpperCase()
    .slice(0, 2);

  const content = (
    <div className={cn(
      'flex items-center',
      sizeConfig.gap,
      className
    )}>
      {showAvatar && (
        <Avatar className={sizeConfig.avatar}>
          <AvatarImage src={authorPhotoURL} alt={displayName} />
          <AvatarFallback className="text-xs font-medium">
            {initials}
          </AvatarFallback>
        </Avatar>
      )}
      <span className={cn(
        'font-medium text-foreground hover:text-primary transition-colors',
        sizeConfig.text
      )}>
        {displayName}
      </span>
    </div>
  );

  // If we have an authorId, make it a link to their profile
  if (authorId) {
    return (
      <Link
        href={`/profile/${authorId}`}
        className="inline-flex items-center hover:opacity-80 transition-opacity"
      >
        {content}
      </Link>
    );
  }

  // Otherwise, just display the author information without a link
  return content;
}
