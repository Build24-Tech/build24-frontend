'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { ProfileEditFormProps, UserProfileData } from '@/types/user';
import { useState } from 'react';

export function ProfileEditForm({ initialData, onSave, onCancel }: ProfileEditFormProps) {
  const [formData, setFormData] = useState<UserProfileData>(initialData);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  const {
    error,
    isLoading,
    hasError,
    canRetry,
    validateProfile,
    handleProfileUpdate,
    retry,
    clearError
  } = useProfileUpdateErrorHandling();

  const validateForm = (): boolean => {
    // Use the profile validation from the error handling hook
    const validationErrors = validateProfile(formData);

    const newErrors: Record<string, string> = {};
    validationErrors.forEach(error => {
      newErrors[error.field] = error.message;
    });

    setFieldErrors(newErrors);
    return validationErrors.length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    // Clear any previous errors
    clearError();

    const result = await handleProfileUpdate(async () => {
      await onSave(formData);
    });

    // If successful, the form will be handled by the parent component
    // If there's an error, it will be displayed by the error handling system
  };

  const handleInputChange = (field: keyof UserProfileData, value: string | boolean) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));

    // Clear field error when user starts typing
    if (fieldErrors[field]) {
      setFieldErrors(prev => ({
        ...prev,
        [field]: ''
      }));
    }

    // Clear general error when user makes changes
    if (hasError) {
      clearError();
    }
  };

  const handleRetry = async () => {
    const result = await retry(async () => {
      await onSave(formData);
    });
  };

  return (
    <ProfileErrorBoundary context="profile-edit">
      <Card className="w-full max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle>Edit Profile</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Display profile operation errors */}
            {hasError && error && (
              <InlineProfileError
                error={error}
                onRetry={canRetry ? handleRetry : undefined}
              />
            )}

            {/* Bio */}
            <div className="space-y-2">
              <Label htmlFor="bio">Bio</Label>
              <Textarea
                id="bio"
                placeholder="Tell us about yourself..."
                value={formData.bio || ''}
                onChange={(e) => handleInputChange('bio', e.target.value)}
                className={fieldErrors.bio ? 'border-red-500' : ''}
                rows={4}
              />
              <div className="flex justify-between text-sm text-gray-500">
                <span>{fieldErrors.bio && <span className="text-red-500">{fieldErrors.bio}</span>}</span>
                <span>{formData.bio?.length || 0}/500</span>
              </div>
            </div>

            {/* Location */}
            <div className="space-y-2">
              <Label htmlFor="location">Location</Label>
              <Input
                id="location"
                placeholder="e.g. San Francisco, CA"
                value={formData.location || ''}
                onChange={(e) => handleInputChange('location', e.target.value)}
                className={fieldErrors.location ? 'border-red-500' : ''}
              />
              {fieldErrors.location && (
                <p className="text-sm text-red-500">{fieldErrors.location}</p>
              )}
            </div>

            {/* Website */}
            <div className="space-y-2">
              <Label htmlFor="website">Website</Label>
              <Input
                id="website"
                type="url"
                placeholder="https://yourwebsite.com"
                value={formData.website || ''}
                onChange={(e) => handleInputChange('website', e.target.value)}
                className={fieldErrors.website ? 'border-red-500' : ''}
              />
              {fieldErrors.website && (
                <p className="text-sm text-red-500">{fieldErrors.website}</p>
              )}
            </div>

            {/* Work */}
            <div className="space-y-2">
              <Label htmlFor="work">Company/Organization</Label>
              <Input
                id="work"
                placeholder="e.g. Acme Corp"
                value={formData.work || ''}
                onChange={(e) => handleInputChange('work', e.target.value)}
                className={fieldErrors.work ? 'border-red-500' : ''}
              />
              {fieldErrors.work && (
                <p className="text-sm text-red-500">{fieldErrors.work}</p>
              )}
            </div>

            {/* Role */}
            <div className="space-y-2">
              <Label htmlFor="role">Role/Title</Label>
              <Input
                id="role"
                placeholder="e.g. Software Engineer"
                value={formData.role || ''}
                onChange={(e) => handleInputChange('role', e.target.value)}
                className={fieldErrors.role ? 'border-red-500' : ''}
              />
              {fieldErrors.role && (
                <p className="text-sm text-red-500">{fieldErrors.role}</p>
              )}
            </div>

            {/* Form Actions */}
            <div className="flex gap-3 pt-4">
              <Button
                type="submit"
                disabled={isLoading}
                className="flex-1"
              >
                {isLoading ? 'Saving...' : 'Save Changes'}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={onCancel}
                disabled={isLoading}
              >
                Cancel
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </ProfileErrorBoundary>
  );
}
