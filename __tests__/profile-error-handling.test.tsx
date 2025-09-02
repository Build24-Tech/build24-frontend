/**
 * @jest-environment jsdom
 */

import { ProfileErrorBoundary } from '@/components/profile/ProfileErrorBoundary';
import { InlineProfileError, ProfileErrorDisplay } from '@/components/profile/ProfileErrorDisplay';
import { useProfileErrorHandling } from '@/hooks/use-profile-error-handling';
import {
  FollowError,
  ProfileError,
  ProfileErrorType,
  ProfileUploadError,
  ProfileValidationError,
  validateFollowOperation,
  validateProfileData,
  validateProfileImage
} from '@/lib/profile-error-handling';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';

// Mock the toast hook
jest.mock('@/hooks/use-toast', () => ({
  useToast: () => ({
    toast: jest.fn()
  })
}));

// Mock Next.js router
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: jest.fn(),
    back: jest.fn()
  })
}));

// Test component that throws an error
function ErrorThrowingComponent({ shouldThrow }: { shouldThrow: boolean }) {
  if (shouldThrow) {
    throw new Error('Test error');
  }
  return <div>No error</div>;
}

// Test component using the error handling hook
function TestComponentWithHook() {
  const {
    error,
    isLoading,
    hasError,
    executeWithErrorHandling,
    retry,
    clearError,
    validateProfile
  } = useProfileErrorHandling();

  const handleOperation = async () => {
    await executeWithErrorHandling(async () => {
      throw new Error('Test operation error');
    }, 'test_operation');
  };

  const handleValidation = () => {
    const errors = validateProfile({
      bio: 'a'.repeat(501), // Too long
      website: 'invalid-url',
      location: 'b'.repeat(101) // Too long
    });
    return errors;
  };

  return (
    <div>
      <div data-testid="error-state">{hasError ? 'Has Error' : 'No Error'}</div>
      <div data-testid="loading-state">{isLoading ? 'Loading' : 'Not Loading'}</div>
      {error && <div data-testid="error-message">{error.message}</div>}
      <button onClick={handleOperation} data-testid="trigger-error">
        Trigger Error
      </button>
      <button onClick={clearError} data-testid="clear-error">
        Clear Error
      </button>
      <button onClick={handleValidation} data-testid="validate">
        Validate
      </button>
    </div>
  );
}

describe('Profile Error Handling', () => {
  describe('ProfileErrorBoundary', () => {
    it('should catch and display errors', () => {
      const onError = jest.fn();

      render(
        <ProfileErrorBoundary onError={onError} context="profile-view">
          <ErrorThrowingComponent shouldThrow={true} />
        </ProfileErrorBoundary>
      );

      expect(screen.getByText('Profile Error')).toBeInTheDocument();
      expect(screen.getByText('We encountered an unexpected error while loading the profile.')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /try again/i })).toBeInTheDocument();
    });

    it('should render children when no error occurs', () => {
      render(
        <ProfileErrorBoundary context="profile-view">
          <ErrorThrowingComponent shouldThrow={false} />
        </ProfileErrorBoundary>
      );

      expect(screen.getByText('No error')).toBeInTheDocument();
    });

    it('should show context-specific error messages', () => {
      render(
        <ProfileErrorBoundary context="profile-edit">
          <ErrorThrowingComponent shouldThrow={true} />
        </ProfileErrorBoundary>
      );

      expect(screen.getByText('Profile Edit Error')).toBeInTheDocument();
    });
  });

  describe('ProfileErrorDisplay', () => {
    it('should display profile not found error', () => {
      const error = new ProfileError(
        ProfileErrorType.PROFILE_NOT_FOUND,
        'Profile not found',
        undefined,
        { userId: 'test-user' },
        false
      );

      render(<ProfileErrorDisplay error={error} />);

      expect(screen.getByText('Profile Not Found')).toBeInTheDocument();
      expect(screen.getByText('The profile you\'re looking for doesn\'t exist or has been removed.')).toBeInTheDocument();
    });

    it('should display validation error with retry button', () => {
      const error = new ProfileError(
        ProfileErrorType.VALIDATION_ERROR,
        'Invalid data',
        undefined,
        {},
        true
      );

      const onRetry = jest.fn();
      render(<ProfileErrorDisplay error={error} onRetry={onRetry} />);

      expect(screen.getByText('Invalid Information')).toBeInTheDocument();

      const retryButton = screen.getByRole('button', { name: /try again/i });
      expect(retryButton).toBeInTheDocument();

      fireEvent.click(retryButton);
      expect(onRetry).toHaveBeenCalled();
    });

    it('should not show retry button for non-retryable errors', () => {
      const error = new ProfileError(
        ProfileErrorType.PROFILE_NOT_FOUND,
        'Profile not found',
        undefined,
        {},
        false
      );

      render(<ProfileErrorDisplay error={error} />);

      expect(screen.queryByRole('button', { name: /try again/i })).not.toBeInTheDocument();
    });
  });

  describe('InlineProfileError', () => {
    it('should display compact error message', () => {
      const error = new ProfileError(
        ProfileErrorType.UPLOAD_FAILED,
        'Upload failed',
        undefined,
        {},
        true
      );

      render(<InlineProfileError error={error} />);

      expect(screen.getByText('Upload Failed')).toBeInTheDocument();
      expect(screen.getByText('Failed to upload the profile image.')).toBeInTheDocument();
    });
  });

  describe('Profile Validation', () => {
    it('should validate bio length', () => {
      const errors = validateProfileData({
        bio: 'a'.repeat(501)
      });

      expect(errors).toHaveLength(1);
      expect(errors[0]).toBeInstanceOf(ProfileValidationError);
      expect(errors[0].field).toBe('bio');
      expect(errors[0].message).toContain('500 characters or less');
    });

    it('should validate website URL format', () => {
      const errors = validateProfileData({
        website: 'invalid-url'
      });

      expect(errors).toHaveLength(1);
      expect(errors[0]).toBeInstanceOf(ProfileValidationError);
      expect(errors[0].field).toBe('website');
      expect(errors[0].message).toContain('valid URL');
    });

    it('should validate field lengths', () => {
      const errors = validateProfileData({
        location: 'a'.repeat(101),
        work: 'b'.repeat(101),
        role: 'c'.repeat(101)
      });

      expect(errors).toHaveLength(3);
      expect(errors.map(e => e.field)).toEqual(['location', 'work', 'role']);
    });

    it('should pass valid data', () => {
      const errors = validateProfileData({
        bio: 'Valid bio',
        website: 'https://example.com',
        location: 'San Francisco',
        work: 'Acme Corp',
        role: 'Developer'
      });

      expect(errors).toHaveLength(0);
    });
  });

  describe('Image Validation', () => {
    it('should validate file type', () => {
      const file = new File([''], 'test.txt', { type: 'text/plain' });
      const error = validateProfileImage(file);

      expect(error).toBeInstanceOf(ProfileUploadError);
      expect(error?.message).toContain('JPEG, PNG, and WebP');
    });

    it('should validate file size', () => {
      const largeFile = new File(['a'.repeat(6 * 1024 * 1024)], 'test.jpg', {
        type: 'image/jpeg'
      });
      const error = validateProfileImage(largeFile);

      expect(error).toBeInstanceOf(ProfileUploadError);
      expect(error?.message).toContain('5MB');
    });

    it('should pass valid image', () => {
      const file = new File([''], 'test.jpg', { type: 'image/jpeg' });
      const error = validateProfileImage(file);

      expect(error).toBeNull();
    });
  });

  describe('Follow Validation', () => {
    it('should prevent self-follow', () => {
      const error = validateFollowOperation('user1', 'user1');

      expect(error).toBeInstanceOf(FollowError);
      expect(error?.message).toContain('Cannot follow yourself');
    });

    it('should validate user IDs', () => {
      const error = validateFollowOperation('', 'user2');

      expect(error).toBeInstanceOf(FollowError);
      expect(error?.message).toContain('Invalid user IDs');
    });

    it('should pass valid follow operation', () => {
      const error = validateFollowOperation('user1', 'user2');

      expect(error).toBeNull();
    });
  });

  describe('useProfileErrorHandling hook', () => {
    it('should handle errors from operations', async () => {
      render(<TestComponentWithHook />);

      expect(screen.getByTestId('error-state')).toHaveTextContent('No Error');

      fireEvent.click(screen.getByTestId('trigger-error'));

      await waitFor(() => {
        expect(screen.getByTestId('error-state')).toHaveTextContent('Has Error');
      });
    });

    it('should clear errors', async () => {
      render(<TestComponentWithHook />);

      // Trigger error
      fireEvent.click(screen.getByTestId('trigger-error'));

      await waitFor(() => {
        expect(screen.getByTestId('error-state')).toHaveTextContent('Has Error');
      });

      // Clear error
      fireEvent.click(screen.getByTestId('clear-error'));

      expect(screen.getByTestId('error-state')).toHaveTextContent('No Error');
    });
  });

  describe('Error Recovery Suggestions', () => {
    it('should provide appropriate suggestions for different error types', () => {
      const networkError = new ProfileError(
        ProfileErrorType.NETWORK_ERROR,
        'Network error',
        undefined,
        {},
        true
      );

      render(<ProfileErrorDisplay error={networkError} />);

      expect(screen.getByText(/check your internet connection/i)).toBeInTheDocument();
      expect(screen.getByText(/try refreshing the page/i)).toBeInTheDocument();
    });
  });
});
