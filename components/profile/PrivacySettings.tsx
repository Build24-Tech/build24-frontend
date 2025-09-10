'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { UserProfileData } from '@/types/user';
import { Eye, EyeOff, Lock, Mail, Users } from 'lucide-react';
import { useState } from 'react';

interface PrivacySettingsProps {
  profileData: UserProfileData;
  onUpdatePrivacy: (updates: Partial<UserProfileData>) => Promise<void>;
}

export function PrivacySettings({ profileData, onUpdatePrivacy }: PrivacySettingsProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [localSettings, setLocalSettings] = useState({
    isPublic: profileData.isPublic,
    showEmail: profileData.showEmail
  });

  const handleToggle = async (setting: 'isPublic' | 'showEmail', value: boolean) => {
    setIsLoading(true);
    try {
      const updates = { [setting]: value };
      await onUpdatePrivacy(updates);
      setLocalSettings(prev => ({ ...prev, [setting]: value }));
    } catch (error) {
      console.error(`Error updating ${setting}:`, error);
      // Revert the local state on error
      setLocalSettings(prev => ({ ...prev, [setting]: !value }));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Lock className="h-5 w-5" />
          Privacy Settings
        </CardTitle>
        <CardDescription>
          Control who can see your profile and personal information
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Profile Visibility */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <Label className="text-base font-medium flex items-center gap-2">
                {localSettings.isPublic ? (
                  <Eye className="h-4 w-4 text-green-600" />
                ) : (
                  <EyeOff className="h-4 w-4 text-gray-500" />
                )}
                Public Profile
              </Label>
              <p className="text-sm text-gray-600">
                {localSettings.isPublic
                  ? 'Your profile is visible to everyone and can be found in search results'
                  : 'Your profile is private and only visible to you'
                }
              </p>
            </div>
            <Switch
              checked={localSettings.isPublic}
              onCheckedChange={(checked) => handleToggle('isPublic', checked)}
              disabled={isLoading}
            />
          </div>

          {/* Profile Visibility Details */}
          <div className="ml-6 p-3 bg-gray-50 rounded-md">
            <h4 className="text-sm font-medium mb-2">What others can see:</h4>
            <ul className="text-sm text-gray-600 space-y-1">
              <li className="flex items-center gap-2">
                <Users className="h-3 w-3" />
                {localSettings.isPublic ? 'Full profile information' : 'Only your name and profile picture'}
              </li>
              <li className="flex items-center gap-2">
                <Users className="h-3 w-3" />
                {localSettings.isPublic ? 'Your bio, location, work, and role' : 'No additional details'}
              </li>
              <li className="flex items-center gap-2">
                <Users className="h-3 w-3" />
                {localSettings.isPublic ? 'Your follower and following counts' : 'No social information'}
              </li>
            </ul>
          </div>
        </div>

        {/* Email Visibility */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <Label className="text-base font-medium flex items-center gap-2">
                <Mail className="h-4 w-4" />
                Show Email Address
              </Label>
              <p className="text-sm text-gray-600">
                {localSettings.showEmail
                  ? 'Your email address is visible on your public profile'
                  : 'Your email address is kept private'
                }
              </p>
            </div>
            <Switch
              checked={localSettings.showEmail}
              onCheckedChange={(checked) => handleToggle('showEmail', checked)}
              disabled={isLoading || !localSettings.isPublic}
            />
          </div>

          {!localSettings.isPublic && (
            <div className="ml-6 p-3 bg-yellow-50 border border-yellow-200 rounded-md">
              <p className="text-sm text-yellow-800">
                Email visibility is only available when your profile is public
              </p>
            </div>
          )}
        </div>

        {/* Privacy Tips */}
        <div className="p-4 bg-blue-50 border border-blue-200 rounded-md">
          <h4 className="text-sm font-medium text-blue-900 mb-2">Privacy Tips</h4>
          <ul className="text-sm text-blue-800 space-y-1">
            <li>• You can change these settings at any time</li>
            <li>• Private profiles won't appear in search results</li>
            <li>• Your content (blog posts, projects) may still show your name as the author</li>
            <li>• Followers can still see your public content even if your profile is private</li>
          </ul>
        </div>

        {/* Current Status Summary */}
        <div className="pt-4 border-t">
          <h4 className="text-sm font-medium mb-2">Current Settings Summary</h4>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div className="flex items-center gap-2">
              {localSettings.isPublic ? (
                <Eye className="h-4 w-4 text-green-600" />
              ) : (
                <EyeOff className="h-4 w-4 text-gray-500" />
              )}
              <span>Profile: {localSettings.isPublic ? 'Public' : 'Private'}</span>
            </div>
            <div className="flex items-center gap-2">
              <Mail className={`h-4 w-4 ${localSettings.showEmail ? 'text-green-600' : 'text-gray-500'}`} />
              <span>Email: {localSettings.showEmail ? 'Visible' : 'Hidden'}</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
