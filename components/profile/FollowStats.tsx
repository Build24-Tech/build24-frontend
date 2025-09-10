'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { FollowersList } from './FollowersList';
import { FollowingList } from './FollowingList';

interface FollowStatsProps {
  userId: string;
  followerCount: number;
  followingCount: number;
  showAsDialog?: boolean;
  variant?: 'default' | 'compact' | 'inline';
  className?: string;
}

export function FollowStats({
  userId,
  followerCount,
  followingCount,
  showAsDialog = true,
  variant = 'default',
  className = ''
}: FollowStatsProps) {
  const formatCount = (count: number): string => {
    if (count >= 1000000) {
      return `${(count / 1000000).toFixed(1)}M`;
    }
    if (count >= 1000) {
      return `${(count / 1000).toFixed(1)}K`;
    }
    return count.toString();
  };

  const StatsContent = () => (
    <div className={`flex gap-6 ${variant === 'inline' ? 'items-center' : ''}`}>
      <div className="text-center">
        <div className="text-2xl font-bold">{formatCount(followerCount)}</div>
        <div className="text-sm text-muted-foreground">
          {followerCount === 1 ? 'Follower' : 'Followers'}
        </div>
      </div>
      <div className="text-center">
        <div className="text-2xl font-bold">{formatCount(followingCount)}</div>
        <div className="text-sm text-muted-foreground">Following</div>
      </div>
    </div>
  );

  const ListsContent = () => (
    <Tabs defaultValue="followers" className="w-full">
      <TabsList className="grid w-full grid-cols-2">
        <TabsTrigger value="followers">
          Followers ({formatCount(followerCount)})
        </TabsTrigger>
        <TabsTrigger value="following">
          Following ({formatCount(followingCount)})
        </TabsTrigger>
      </TabsList>
      <TabsContent value="followers" className="mt-4">
        <FollowersList userId={userId} showTitle={false} />
      </TabsContent>
      <TabsContent value="following" className="mt-4">
        <FollowingList userId={userId} showTitle={false} />
      </TabsContent>
    </Tabs>
  );

  if (variant === 'inline') {
    return (
      <div className={className}>
        <StatsContent />
      </div>
    );
  }

  if (variant === 'compact') {
    return (
      <Card className={className}>
        <CardContent className="p-4">
          <StatsContent />
        </CardContent>
      </Card>
    );
  }

  if (!showAsDialog) {
    return (
      <div className={`space-y-6 ${className}`}>
        <Card>
          <CardContent className="p-6">
            <StatsContent />
          </CardContent>
        </Card>
        <ListsContent />
      </div>
    );
  }

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="ghost" className={`p-0 h-auto ${className}`}>
          <StatsContent />
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-hidden">
        <DialogHeader>
          <DialogTitle>Social Connections</DialogTitle>
        </DialogHeader>
        <div className="overflow-y-auto">
          <ListsContent />
        </div>
      </DialogContent>
    </Dialog>
  );
}
