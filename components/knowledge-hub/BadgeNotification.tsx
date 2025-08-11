'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { Badge, BADGE_CATEGORY_LABELS } from '@/types/knowledge-hub';
import { Sparkles, Trophy, X } from 'lucide-react';
import React, { useEffect, useState } from 'react';

interface BadgeNotificationProps {
  badges: Badge[];
  onDismiss: () => void;
  autoHideDuration?: number;
  className?: string;
}

interface SingleBadgeNotificationProps {
  badge: Badge;
  onDismiss: () => void;
  isVisible: boolean;
  className?: string;
}

const SingleBadgeNotification: React.FC<SingleBadgeNotificationProps> = ({
  badge,
  onDismiss,
  isVisible,
  className = ''
}) => {
  return (
    <Card
      className={cn(
        "fixed top-4 right-4 z-50 w-80 shadow-lg border-yellow-200 bg-gradient-to-r from-yellow-50 to-orange-50 dark:from-yellow-900/20 dark:to-orange-900/20 transition-all duration-500 transform",
        isVisible ? "translate-x-0 opacity-100" : "translate-x-full opacity-0",
        className
      )}
    >
      <CardContent className="p-4">
        <div className="flex items-start space-x-3">
          <div className="flex-shrink-0">
            <div className="relative">
              <Trophy className="h-8 w-8 text-yellow-500" />
              <Sparkles className="h-4 w-4 text-yellow-400 absolute -top-1 -right-1 animate-pulse" />
            </div>
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                Achievement Unlocked!
              </h3>
              <Button
                variant="ghost"
                size="sm"
                className="h-6 w-6 p-0 text-gray-400 hover:text-gray-600"
                onClick={onDismiss}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>

            <p className="text-lg font-bold text-yellow-700 dark:text-yellow-300 mt-1">
              {badge.name}
            </p>

            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              {badge.description}
            </p>

            <div className="flex items-center justify-between mt-3">
              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300">
                {BADGE_CATEGORY_LABELS[badge.category]}
              </span>

              <span className="text-xs text-gray-500">
                {badge.earnedAt.toLocaleDateString()}
              </span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

const BadgeNotification: React.FC<BadgeNotificationProps> = ({
  badges,
  onDismiss,
  autoHideDuration = 5000,
  className = ''
}) => {
  const [currentBadgeIndex, setCurrentBadgeIndex] = useState(0);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (badges.length === 0) return;

    // Show the notification
    setIsVisible(true);

    // Auto-hide timer
    const hideTimer = setTimeout(() => {
      setIsVisible(false);

      // After hide animation, move to next badge or dismiss
      setTimeout(() => {
        if (currentBadgeIndex < badges.length - 1) {
          setCurrentBadgeIndex(prev => prev + 1);
        } else {
          onDismiss();
          setCurrentBadgeIndex(0);
        }
      }, 500); // Wait for hide animation
    }, autoHideDuration);

    return () => clearTimeout(hideTimer);
  }, [badges, currentBadgeIndex, autoHideDuration, onDismiss]);

  if (badges.length === 0) return null;

  const currentBadge = badges[currentBadgeIndex];
  if (!currentBadge) return null;

  const handleDismiss = () => {
    setIsVisible(false);
    setTimeout(() => {
      onDismiss();
      setCurrentBadgeIndex(0);
    }, 500);
  };

  return (
    <>
      <SingleBadgeNotification
        badge={currentBadge}
        onDismiss={handleDismiss}
        isVisible={isVisible}
        className={className}
      />

      {/* Multiple badges indicator */}
      {badges.length > 1 && (
        <div className="fixed top-20 right-4 z-40">
          <div className="flex space-x-1">
            {badges.map((_, index) => (
              <div
                key={index}
                className={cn(
                  "w-2 h-2 rounded-full transition-colors duration-300",
                  index === currentBadgeIndex
                    ? "bg-yellow-500"
                    : "bg-gray-300 dark:bg-gray-600"
                )}
              />
            ))}
          </div>
        </div>
      )}
    </>
  );
};

export default BadgeNotification;
