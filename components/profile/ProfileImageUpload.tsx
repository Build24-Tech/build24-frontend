'use client';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Camera, Upload, X } from 'lucide-react';
import { useRef, useState } from 'react';

interface ProfileImageUploadProps {
  currentImageUrl?: string;
  displayName?: string;
  onImageUpload: (file: File) => Promise<string>;
  onImageRemove?: () => Promise<void>;
}

export function ProfileImageUpload({
  currentImageUrl,
  displayName,
  onImageUpload,
  onImageRemove
}: ProfileImageUploadProps) {
  const [uploadProgress, setUploadProgress] = useState(0);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const {
    error,
    isLoading: isUploading,
    hasError,
    canRetry,
    validateImage,
    handleImageUpload,
    retry,
    clearError
  } = useImageUploadErrorHandling();

  // Use the validation from the error handling hook
  const validateFile = (file: File) => {
    return validateImage(file);
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const validationError = validateFile(file);
    if (validationError) {
      // Handle validation error through the error handling system
      const error = new Error(validationError.message);
      clearError(); // Clear any previous errors first
      setTimeout(() => {
        // Use a timeout to ensure the error is handled properly
        throw error;
      }, 0);
      setPreviewUrl(null);
      return;
    }

    clearError();

    // Create preview
    const reader = new FileReader();
    reader.onload = (e) => {
      setPreviewUrl(e.target?.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleUpload = async () => {
    const file = fileInputRef.current?.files?.[0];
    if (!file) return;

    setUploadProgress(0);

    // Simulate upload progress
    const progressInterval = setInterval(() => {
      setUploadProgress(prev => {
        if (prev >= 90) {
          clearInterval(progressInterval);
          return 90;
        }
        return prev + 10;
      });
    }, 100);

    const result = await handleImageUpload(async () => {
      const imageUrl = await onImageUpload(file);
      return imageUrl;
    });

    clearInterval(progressInterval);

    if (result) {
      setUploadProgress(100);

      // Clear preview and reset form
      setPreviewUrl(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }

      setTimeout(() => {
        setUploadProgress(0);
      }, 1000);
    } else {
      setUploadProgress(0);
    }
  };

  const handleRemoveImage = async () => {
    if (!onImageRemove) return;

    await handleImageUpload(async () => {
      await onImageRemove();
    });
  };

  const cancelPreview = () => {
    setPreviewUrl(null);
    clearError();
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const getInitials = (name?: string) => {
    if (!name) return 'U';
    return name
      .split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const handleRetry = async () => {
    const file = fileInputRef.current?.files?.[0];
    if (!file) return;

    await retry(async () => {
      const imageUrl = await onImageUpload(file);
      return imageUrl;
    });
  };

  return (
    <ProfileErrorBoundary context="profile-edit">
      <Card className="w-full max-w-md mx-auto">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Camera className="h-5 w-5" />
            Profile Picture
          </CardTitle>
          <CardDescription>
            Upload a profile picture to help others recognize you
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Display upload errors */}
          {hasError && error && (
            <InlineProfileError
              error={error}
              onRetry={canRetry ? handleRetry : undefined}
            />
          )}
          {/* Current/Preview Image */}
          <div className="flex flex-col items-center space-y-4">
            <Avatar className="h-24 w-24">
              <AvatarImage
                src={previewUrl || currentImageUrl}
                alt={displayName || 'Profile picture'}
              />
              <AvatarFallback className="text-lg">
                {getInitials(displayName)}
              </AvatarFallback>
            </Avatar>

            {currentImageUrl && !previewUrl && (
              <Button
                variant="outline"
                size="sm"
                onClick={handleRemoveImage}
                disabled={isUploading}
                className="text-red-600 hover:text-red-700"
              >
                <X className="h-4 w-4 mr-1" />
                Remove Picture
              </Button>
            )}
          </div>

          {/* Upload Progress */}
          {isUploading && (
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Uploading...</span>
                <span>{uploadProgress}%</span>
              </div>
              <Progress value={uploadProgress} className="w-full" />
            </div>
          )}

          {/* Error Message - now handled by InlineProfileError above */}

          {/* File Input */}
          <div className="space-y-4">
            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp"
              onChange={handleFileSelect}
              className="hidden"
            />

            {!previewUrl ? (
              <Button
                type="button"
                variant="outline"
                onClick={() => fileInputRef.current?.click()}
                disabled={isUploading}
                className="w-full"
              >
                <Upload className="h-4 w-4 mr-2" />
                Choose Image
              </Button>
            ) : (
              <div className="flex gap-2">
                <Button
                  onClick={handleUpload}
                  disabled={isUploading}
                  className="flex-1"
                >
                  <Upload className="h-4 w-4 mr-2" />
                  Upload Image
                </Button>
                <Button
                  variant="outline"
                  onClick={cancelPreview}
                  disabled={isUploading}
                >
                  Cancel
                </Button>
              </div>
            )}
          </div>

          {/* Upload Guidelines */}
          <div className="text-xs text-gray-500 space-y-1">
            <p>• Supported formats: JPEG, PNG, WebP</p>
            <p>• Maximum file size: 5MB</p>
            <p>• Recommended: Square images work best</p>
          </div>
        </CardContent>
      </Card>
    </ProfileErrorBoundary>
  );
}
