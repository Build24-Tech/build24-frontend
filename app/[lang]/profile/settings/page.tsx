'use client';

import { PrivacySettings } from '@/components/profile/PrivacySettings';
import { ProfileImageUpload } from '@/components/profile/ProfileImageUpload';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { useAuth } from '@/contexts/AuthContext';
import { profileService } from '@/lib/profile-service';
import { UserProfileData } from '@/types/user';
import { ArrowLeft, Settings, User } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

interface ProfileSettingsPageProps {
  params: {
    lang: string;
  };
}

export default function ProfileSettingsPage({ params }: ProfileSettingsPageProps) {
  const { lang } = params;
  const { user, userProfile, updateProfileData, refreshUserProfile } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Redirect to login if not authenticated
    if (!loading && !user) {
      router.push(`/${lang}/login`);
    }
  }, [user, loading, router, lang]);

  const handlePrivacyToggle = async (isPublic: boolean) => {
    if (!user) return;

    try {
      setLoading(true);
      setError(null);

      await profileService.togglePrivacy(user.uid, isPublic);
      await refreshUserProfile();
    } catch (err) {
      console.error('Error updating privacy settings:', err);
      setError('Failed to update privacy settings. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleImageUpload = async (file: File) => {
    if (!user) return;

    try {
      setLoading(true);
      setError(null);

      await profileService.uploadProfileImage(user.uid, file);
      await refreshUserProfile();
    } catch (err) {
      console.error('Error uploading profile image:', err);
      setError('Failed to upload profile image. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleEmailVisibilityToggle = async (showEmail: boolean) => {
    if (!user) return;

    try {
      setLoading(true);
      setError(null);

      const updatedData: Partial<UserProfileData> = { showEmail };
      await updateProfileData(updatedData);
    } catch (err) {
      console.error('Error updating email visibility:', err);
      setError('Failed to update email visibility. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Show loading state while checking authentication
  if (!user || !userProfile) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="w-full max-w-2xl mx-auto">
          <div className="animate-pulse">
            <div className="bg-muted rounded-lg p-8">
              <div className="w-48 h-6 bg-muted-foreground/20 rounded mb-4"></div>
              <div className="space-y-3">
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

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="w-full max-w-2xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Button variant="outline" size="sm" asChild>
            <Link href={`/${lang}/profile/${user.uid}`} className="flex items-center gap-2">
              <ArrowLeft className="w-4 h-4" />
              Back to Profile
            </Link>
          </Button>
          <div className="flex items-center gap-2">
            <Settings className="w-5 h-5" />
            <h1 className="text-2xl font-bold">Profile Settings</h1>
          </div>
        </div>

        {/* Error Display */}
        {error && (
          <div className="p-4 text-sm text-red-600 bg-red-50 border border-red-200 rounded-md">
            {error}
          </div>
        )}

        {/* Profile Image Upload */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="w-5 h-5" />
              Profile Image
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ProfileImageUpload
              currentImageUrl={userProfile.photoURL}
              onImageUpload={handleImageUpload}
              isLoading={loading}
            />
          </CardContent>
        </Card>

        <Separator />

        {/* Privacy Settings */}
        <Card>
          <CardHeader>
            <CardTitle>Privacy Settings</CardTitle>
          </CardHeader>
          <CardContent>
            <PrivacySettings
              isPublic={userProfile.profile.isPublic}
              showEmail={userProfile.profile.showEmail}
              onPrivacyToggle={handlePrivacyToggle}
              onEmailVisibilityToggle={handleEmailVisibilityToggle}
              isLoading={loading}
            />
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button asChild variant="outline" className="w-full justify-start">
              <Link href={`/${lang}/profile/edit`} className="flex items-center gap-2">
                <User className="w-4 h-4" />
                Edit Profile Information
              </Link>
            </Button>

            <Button asChild variant="outline" className="w-full justify-start">
              <Link href={`/${lang}/profile/${user.uid}`} className="flex items-center gap-2">
                <ArrowLeft className="w-4 h-4" />
                View Public Profile
              </Link>
            </Button>
          </CardContent>
        </Card>

        {/* Profile Stats */}
        <Card>
          <CardHeader>
            <CardTitle>Profile Statistics</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4 text-center">
              <div>
                <div className="text-2xl font-bold text-primary">
                  {userProfile.profile.followerCount.toLocaleString()}
                </div>
                <div className="text-sm text-muted-foreground">
                  {userProfile.profile.followerCount === 1 ? 'Follower' : 'Followers'}
                </div>
              </div>
              <div>
                <div className="text-2xl font-bold text-primary">
                  {userProfile.profile.followingCount.toLocaleString()}
                </div>
                <div className="text-sm text-muted-foreground">Following</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
