'use client';

import { useBookmarkManager } from '@/components/knowledge-hub/BookmarkManager';
import { TheoryDetailView } from '@/components/knowledge-hub/TheoryDetailView';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { loadTheory } from '@/lib/theories';
import { AccessLevel, Theory } from '@/types/knowledge-hub';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useEffect, useState } from 'react';

export default function TheoryPage() {
  const params = useParams();
  const theoryId = params?.theoryId as string;
  const [theory, setTheory] = useState<Theory | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const { user, userProfile } = useAuth();
  const { isBookmarked, toggleBookmark } = useBookmarkManager();

  // Determine user access level based on user profile
  const userAccess = userProfile?.subscription?.tier === 'premium' ? AccessLevel.PREMIUM : AccessLevel.FREE;

  useEffect(() => {
    async function fetchTheory() {
      if (!theoryId) return;

      try {
        setIsLoading(true);
        setError(null);
        const theoryData = await loadTheory(theoryId);
        setTheory(theoryData);
      } catch (err) {
        console.error('Failed to load theory:', err);
        setError(err instanceof Error ? err.message : 'Failed to load theory');
      } finally {
        setIsLoading(false);
      }
    }

    fetchTheory();
  }, [theoryId]);

  const handleBookmarkToggle = async (theoryId: string) => {
    await toggleBookmark(theoryId);
  };

  const handleShare = (theory: Theory) => {
    // In a real implementation, this would handle sharing functionality
    console.log('Sharing theory:', theory.title);
  };

  if (error) {
    return (
      <div className="text-center py-12">
        <h1 className="text-2xl font-bold text-red-400 mb-4">Theory Not Found</h1>
        <p className="text-gray-400 mb-6">{error}</p>
        <Button asChild>
          <Link href="/dashboard/knowledge-hub">
            Back to Knowledge Hub
          </Link>
        </Button>
      </div>
    );
  }

  if (isLoading || !theory) {
    return (
      <TheoryDetailView
        theory={{} as Theory}
        userAccess={userAccess}
        isLoading={true}
      />
    );
  }

  return (
    <TheoryDetailView
      theory={theory}
      userAccess={userAccess}
      isBookmarked={isBookmarked(theoryId)}
      onBookmarkToggle={handleBookmarkToggle}
      onShare={handleShare}
    />
  );
}
