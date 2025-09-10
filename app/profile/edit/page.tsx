'use client';

import { ProfileEditForm } from '@/components/profile/ProfileEditForm';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { UserProfileData } from '@/types/user';
import { ArrowLeft, Edit } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

export default function ProfileEditPage() {
  const { user, userProfile, updateProfileData } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Redirect to login if not authenticated
    if (!loading && !user) {
      router.push('/login');
    }
  }, [user, loading, router]);

  const handleSave = async (data: UserProfileData) => {
    if (!user) return;

    try {
      setLoading(true);
      setError(null);

      await updateProfileData(data);

      // Redirect to profile page after successful save
      router.push(`/profile/${user.uid}`);
    } catch (err) {
      console.error('Error saving profile:', err);
      setError('Failed to save profile changes. Please try again.');
      throw err; // Re-throw to let the form handle the error state
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    router.push(`/profile/${user?.uid || ''}`);
  };

  // Show loading state while checking authentication
  if (!user || !userProfile) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="w-full max-w-2xl mx-auto">
          <div className="animate-pulse">
            <div className="bg-muted rounded-lg p-8">
              <div className="w-48 h-6 bg-muted-foreground/20 rounded mb-4"></div>
              <div className="space-y-4">
                <div className="w-full h-10 bg-muted-foreground/20 rounded"></div>
                <div className="w-full h-20 bg-muted-foreground/20 rounded"></div>
                <div className="w-full h-10 bg-muted-foreground/20 rounded"></div>
                <div className="w-full h-10 bg-muted-foreground/20 rounded"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="w-full max-w-2xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Button variant="outline" size="sm" asChild>
            <Link href={`/profile/${user.uid}`} className="flex items-center gap-2">
              <ArrowLeft className="w-4 h-4" />
              Back to Profile
            </Link>
          </Button>
          <div className="flex items-center gap-2">
            <Edit className="w-5 h-5" />
            <h1 className="text-2xl font-bold">Edit Profile</h1>
          </div>
        </div>

        {/* Error Display */}
        {error && (
          <div className="p-4 text-sm text-red-600 bg-red-50 border border-red-200 rounded-md">
            {error}
          </div>
        )}

        {/* Profile Edit Form */}
        <ProfileEditForm
          initialData={userProfile.profile}
          onSave={handleSave}
          onCancel={handleCancel}
        />

        {/* Additional Actions */}
        <div className="flex justify-center pt-4">
          <Button variant="outline" asChild>
            <Link href="/profile/settings" className="flex items-center gap-2">
              Profile Settings
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
