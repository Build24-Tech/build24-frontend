'use client';

import { Badge as UIBadge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Badge,
  BADGE_CATEGORY_LABELS,
  BadgeCategory,
  THEORY_CATEGORY_LABELS,
  UserProgress
} from '@/types/knowledge-hub';
import {
  Award,
  Bookmark,
  BookOpen,
  Calendar,
  Clock,
  Star,
  Target,
  TrendingUp,
  Trophy
} from 'lucide-react';
import React, { useState } from 'react';

interface ProgressTrackerProps {
  userProgress: UserProgress;
  onBadgeClick?: (badge: Badge) => void;
  showDetailedStats?: boolean;
  className?: string;
}

interface BadgeDialogProps {
  badge: Badge | null;
  isOpen: boolean;
  onClose: () => void;
}

const BadgeDialog: React.FC<BadgeDialogProps> = ({ badge, isOpen, onClose }) => {
  if (!badge) return null;

  const getCategoryIcon = (category: BadgeCategory) => {
    switch (category) {
      case BadgeCategory.READING:
        return <BookOpen className="h-5 w-5" />;
      case BadgeCategory.EXPLORATION:
        return <Target className="h-5 w-5" />;
      case BadgeCategory.ENGAGEMENT:
        return <Star className="h-5 w-5" />;
      case BadgeCategory.MASTERY:
        return <Trophy className="h-5 w-5" />;
      default:
        return <Award className="h-5 w-5" />;
    }
  };

  const getCategoryColor = (category: BadgeCategory) => {
    switch (category) {
      case BadgeCategory.READING:
        return 'text-blue-500';
      case BadgeCategory.EXPLORATION:
        return 'text-green-500';
      case BadgeCategory.ENGAGEMENT:
        return 'text-purple-500';
      case BadgeCategory.MASTERY:
        return 'text-yellow-500';
      default:
        return 'text-gray-500';
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <div className={`p-2 rounded-full bg-gray-100 dark:bg-gray-800 ${getCategoryColor(badge.category)}`}>
              {getCategoryIcon(badge.category)}
            </div>
            {badge.name}
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <p className="text-gray-600 dark:text-gray-400">
            {badge.description}
          </p>
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-500">Category:</span>
            <UIBadge variant="secondary">
              {BADGE_CATEGORY_LABELS[badge.category]}
            </UIBadge>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-500">Earned:</span>
            <span className="font-medium">
              {badge.earnedAt.toLocaleDateString()}
            </span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-500">Requirement:</span>
            <span className="font-medium">
              {badge.requirements.threshold} {badge.requirements.type.replace('_', ' ')}
            </span>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

const ProgressTracker: React.FC<ProgressTrackerProps> = ({
  userProgress,
  onBadgeClick,
  showDetailedStats = false,
  className = ''
}) => {
  const [selectedBadge, setSelectedBadge] = useState<Badge | null>(null);
  const [showBadgeDialog, setShowBadgeDialog] = useState(false);

  const handleBadgeClick = (badge: Badge) => {
    setSelectedBadge(badge);
    setShowBadgeDialog(true);
    onBadgeClick?.(badge);
  };

  const getBadgesByCategory = (category: BadgeCategory) => {
    return userProgress.badges.filter(badge => badge.category === category);
  };

  const getProgressToNextMilestone = () => {
    const theoriesRead = userProgress.stats.theoriesRead;
    const milestones = [1, 5, 15, 50, 100];

    const nextMilestone = milestones.find(milestone => milestone > theoriesRead);
    if (!nextMilestone) return { current: theoriesRead, next: 100, progress: 100 };

    const previousMilestone = milestones[milestones.indexOf(nextMilestone) - 1] || 0;
    const progress = ((theoriesRead - previousMilestone) / (nextMilestone - previousMilestone)) * 100;

    return { current: theoriesRead, next: nextMilestone, progress: Math.min(progress, 100) };
  };

  const formatReadTime = (minutes: number) => {
    if (minutes < 60) return `${minutes}m`;
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    return remainingMinutes > 0 ? `${hours}h ${remainingMinutes}m` : `${hours}h`;
  };

  const milestone = getProgressToNextMilestone();

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Overview Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <BookOpen className="h-5 w-5 text-blue-500" />
              <div>
                <p className="text-2xl font-bold">{userProgress.stats.theoriesRead}</p>
                <p className="text-sm text-gray-600 dark:text-gray-400">Theories Read</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Clock className="h-5 w-5 text-green-500" />
              <div>
                <p className="text-2xl font-bold">{formatReadTime(userProgress.stats.totalReadTime)}</p>
                <p className="text-sm text-gray-600 dark:text-gray-400">Time Spent</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Trophy className="h-5 w-5 text-yellow-500" />
              <div>
                <p className="text-2xl font-bold">{userProgress.badges.length}</p>
                <p className="text-sm text-gray-600 dark:text-gray-400">Badges Earned</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Bookmark className="h-5 w-5 text-purple-500" />
              <div>
                <p className="text-2xl font-bold">{userProgress.bookmarkedTheories.length}</p>
                <p className="text-sm text-gray-600 dark:text-gray-400">Bookmarks</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Progress to Next Milestone */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5" />
            Progress to Next Milestone
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>{milestone.current} theories read</span>
              <span>Goal: {milestone.next} theories</span>
            </div>
            <Progress value={milestone.progress} className="h-2" />
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {milestone.next - milestone.current} more theories to reach your next milestone!
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Categories Explored */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Categories Explored
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {userProgress.stats.categoriesExplored.map(category => (
              <UIBadge key={category} variant="secondary">
                {THEORY_CATEGORY_LABELS[category]}
              </UIBadge>
            ))}
            {userProgress.stats.categoriesExplored.length === 0 && (
              <p className="text-gray-600 dark:text-gray-400">
                Start reading theories to explore different categories!
              </p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Badges Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Award className="h-5 w-5" />
            Achievements
          </CardTitle>
        </CardHeader>
        <CardContent>
          {userProgress.badges.length > 0 ? (
            <Tabs defaultValue="all" className="w-full">
              <TabsList className="grid w-full grid-cols-5">
                <TabsTrigger value="all">All</TabsTrigger>
                <TabsTrigger value="reading">Reading</TabsTrigger>
                <TabsTrigger value="exploration">Exploration</TabsTrigger>
                <TabsTrigger value="engagement">Engagement</TabsTrigger>
                <TabsTrigger value="mastery">Mastery</TabsTrigger>
              </TabsList>

              <TabsContent value="all" className="mt-4">
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                  {userProgress.badges.map(badge => (
                    <Button
                      key={badge.id}
                      variant="outline"
                      className="h-auto p-3 flex flex-col items-center space-y-2"
                      onClick={() => handleBadgeClick(badge)}
                    >
                      <Trophy className="h-6 w-6 text-yellow-500" />
                      <div className="text-center">
                        <p className="font-medium text-sm">{badge.name}</p>
                        <p className="text-xs text-gray-600 dark:text-gray-400">
                          {badge.earnedAt.toLocaleDateString()}
                        </p>
                      </div>
                    </Button>
                  ))}
                </div>
              </TabsContent>

              {Object.values(BadgeCategory).map(category => (
                <TabsContent key={category} value={category} className="mt-4">
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                    {getBadgesByCategory(category).map(badge => (
                      <Button
                        key={badge.id}
                        variant="outline"
                        className="h-auto p-3 flex flex-col items-center space-y-2"
                        onClick={() => handleBadgeClick(badge)}
                      >
                        <Trophy className="h-6 w-6 text-yellow-500" />
                        <div className="text-center">
                          <p className="font-medium text-sm">{badge.name}</p>
                          <p className="text-xs text-gray-600 dark:text-gray-400">
                            {badge.earnedAt.toLocaleDateString()}
                          </p>
                        </div>
                      </Button>
                    ))}
                  </div>
                  {getBadgesByCategory(category).length === 0 && (
                    <p className="text-center text-gray-600 dark:text-gray-400 py-8">
                      No {BADGE_CATEGORY_LABELS[category].toLowerCase()} badges earned yet.
                    </p>
                  )}
                </TabsContent>
              ))}
            </Tabs>
          ) : (
            <div className="text-center py-8">
              <Trophy className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600 dark:text-gray-400">
                Start reading theories to earn your first badge!
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Detailed Stats (if enabled) */}
      {showDetailedStats && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Detailed Statistics
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Average Session Time</p>
                <p className="text-lg font-semibold">{formatReadTime(userProgress.stats.averageSessionTime)}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Current Streak</p>
                <p className="text-lg font-semibold">{userProgress.stats.streakDays} days</p>
              </div>
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Last Active</p>
                <p className="text-lg font-semibold">
                  {userProgress.stats.lastActiveDate.toLocaleDateString()}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Quiz Results</p>
                <p className="text-lg font-semibold">{userProgress.quizResults.length} completed</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Badge Detail Dialog */}
      <BadgeDialog
        badge={selectedBadge}
        isOpen={showBadgeDialog}
        onClose={() => setShowBadgeDialog(false)}
      />
    </div>
  );
};

export default ProgressTracker;
