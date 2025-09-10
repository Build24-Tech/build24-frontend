import { PrivacySettings } from '@/components/profile/PrivacySettings';
import { UserProfileData } from '@/types/user';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

// Mock the UI components
jest.mock('@/components/ui/card', () => ({
  Card: ({ children, className }: any) => <div className={className}>{children}</div>,
  CardContent: ({ children }: any) => <div>{children}</div>,
  CardHeader: ({ children }: any) => <div>{children}</div>,
  CardTitle: ({ children }: any) => <h2>{children}</h2>,
  CardDescription: ({ children }: any) => <p>{children}</p>
}));

jest.mock('@/components/ui/label', () => ({
  Label: ({ children, className }: any) => <label className={className}>{children}</label>
}));

jest.mock('@/components/ui/switch', () => ({
  Switch: ({ checked, onCheckedChange, disabled }: any) => (
    <input
      type="checkbox"
      checked={checked}
      onChange={(e) => onCheckedChange(e.target.checked)}
      disabled={disabled}
      data-testid="switch"
    />
  )
}));

// Mock Lucide icons
jest.mock('lucide-react', () => ({
  Eye: () => <div data-testid="eye-icon" />,
  EyeOff: () => <div data-testid="eye-off-icon" />,
  Lock: () => <div data-testid="lock-icon" />,
  Mail: () => <div data-testid="mail-icon" />,
  Users: () => <div data-testid="users-icon" />
}));

describe('PrivacySettings', () => {
  const mockProfileData: UserProfileData = {
    bio: 'Test bio',
    location: 'Test City',
    website: 'https://test.com',
    work: 'Test Company',
    role: 'Test Role',
    showEmail: true,
    isPublic: true,
    followerCount: 10,
    followingCount: 5
  };

  const mockOnUpdatePrivacy = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders privacy settings with current values', () => {
    render(
      <PrivacySettings
        profileData={mockProfileData}
        onUpdatePrivacy={mockOnUpdatePrivacy}
      />
    );

    expect(screen.getByText('Privacy Settings')).toBeInTheDocument();
    expect(screen.getByText('Public Profile')).toBeInTheDocument();
    expect(screen.getByText('Show Email Address')).toBeInTheDocument();

    const switches = screen.getAllByTestId('switch');
    expect(switches[0]).toBeChecked(); // Public profile switch
    expect(switches[1]).toBeChecked(); // Show email switch
  });

  it('shows correct descriptions for public profile', () => {
    render(
      <PrivacySettings
        profileData={mockProfileData}
        onUpdatePrivacy={mockOnUpdatePrivacy}
      />
    );

    expect(screen.getByText('Your profile is visible to everyone and can be found in search results')).toBeInTheDocument();
    expect(screen.getByText('Your email address is visible on your public profile')).toBeInTheDocument();
  });

  it('shows correct descriptions for private profile', () => {
    const privateProfileData = { ...mockProfileData, isPublic: false, showEmail: false };

    render(
      <PrivacySettings
        profileData={privateProfileData}
        onUpdatePrivacy={mockOnUpdatePrivacy}
      />
    );

    expect(screen.getByText('Your profile is private and only visible to you')).toBeInTheDocument();
    expect(screen.getByText('Your email address is kept private')).toBeInTheDocument();
  });

  it('calls onUpdatePrivacy when public profile toggle is changed', async () => {
    const user = userEvent.setup();
    mockOnUpdatePrivacy.mockResolvedValue(undefined);

    render(
      <PrivacySettings
        profileData={mockProfileData}
        onUpdatePrivacy={mockOnUpdatePrivacy}
      />
    );

    const publicProfileSwitch = screen.getAllByTestId('switch')[0];
    await user.click(publicProfileSwitch);

    await waitFor(() => {
      expect(mockOnUpdatePrivacy).toHaveBeenCalledWith({ isPublic: false });
    });
  });

  it('calls onUpdatePrivacy when email visibility toggle is changed', async () => {
    const user = userEvent.setup();
    mockOnUpdatePrivacy.mockResolvedValue(undefined);

    render(
      <PrivacySettings
        profileData={mockProfileData}
        onUpdatePrivacy={mockOnUpdatePrivacy}
      />
    );

    const emailVisibilitySwitch = screen.getAllByTestId('switch')[1];
    await user.click(emailVisibilitySwitch);

    await waitFor(() => {
      expect(mockOnUpdatePrivacy).toHaveBeenCalledWith({ showEmail: false });
    });
  });

  it('disables email visibility switch when profile is private', () => {
    const privateProfileData = { ...mockProfileData, isPublic: false };

    render(
      <PrivacySettings
        profileData={privateProfileData}
        onUpdatePrivacy={mockOnUpdatePrivacy}
      />
    );

    const emailVisibilitySwitch = screen.getAllByTestId('switch')[1];
    expect(emailVisibilitySwitch).toBeDisabled();
  });

  it('shows warning message when profile is private', () => {
    const privateProfileData = { ...mockProfileData, isPublic: false };

    render(
      <PrivacySettings
        profileData={privateProfileData}
        onUpdatePrivacy={mockOnUpdatePrivacy}
      />
    );

    expect(screen.getByText('Email visibility is only available when your profile is public')).toBeInTheDocument();
  });

  it('shows privacy tips', () => {
    render(
      <PrivacySettings
        profileData={mockProfileData}
        onUpdatePrivacy={mockOnUpdatePrivacy}
      />
    );

    expect(screen.getByText('Privacy Tips')).toBeInTheDocument();
    expect(screen.getByText('• You can change these settings at any time')).toBeInTheDocument();
    expect(screen.getByText('• Private profiles won\'t appear in search results')).toBeInTheDocument();
  });

  it('shows current settings summary', () => {
    render(
      <PrivacySettings
        profileData={mockProfileData}
        onUpdatePrivacy={mockOnUpdatePrivacy}
      />
    );

    expect(screen.getByText('Current Settings Summary')).toBeInTheDocument();
    expect(screen.getByText('Profile: Public')).toBeInTheDocument();
    expect(screen.getByText('Email: Visible')).toBeInTheDocument();
  });

  it('updates local state and reverts on error', async () => {
    const user = userEvent.setup();
    mockOnUpdatePrivacy.mockRejectedValue(new Error('Update failed'));

    render(
      <PrivacySettings
        profileData={mockProfileData}
        onUpdatePrivacy={mockOnUpdatePrivacy}
      />
    );

    const publicProfileSwitch = screen.getAllByTestId('switch')[0];

    // Initially checked (public)
    expect(publicProfileSwitch).toBeChecked();

    // Click to make private
    await user.click(publicProfileSwitch);

    // Should revert back to checked state after error
    await waitFor(() => {
      expect(publicProfileSwitch).toBeChecked();
    });
  });

  it('shows loading state during update', async () => {
    const user = userEvent.setup();
    let resolvePromise: () => void;
    const updatePromise = new Promise<void>((resolve) => {
      resolvePromise = resolve;
    });
    mockOnUpdatePrivacy.mockReturnValue(updatePromise);

    render(
      <PrivacySettings
        profileData={mockProfileData}
        onUpdatePrivacy={mockOnUpdatePrivacy}
      />
    );

    const publicProfileSwitch = screen.getAllByTestId('switch')[0];
    await user.click(publicProfileSwitch);

    // Both switches should be disabled during loading
    const switches = screen.getAllByTestId('switch');
    switches.forEach(switchElement => {
      expect(switchElement).toBeDisabled();
    });

    resolvePromise!();
    await waitFor(() => {
      switches.forEach(switchElement => {
        expect(switchElement).not.toBeDisabled();
      });
    });
  });

  it('displays correct visibility information for public profiles', () => {
    render(
      <PrivacySettings
        profileData={mockProfileData}
        onUpdatePrivacy={mockOnUpdatePrivacy}
      />
    );

    expect(screen.getByText('Full profile information')).toBeInTheDocument();
    expect(screen.getByText('Your bio, location, work, and role')).toBeInTheDocument();
    expect(screen.getByText('Your follower and following counts')).toBeInTheDocument();
  });

  it('displays correct visibility information for private profiles', () => {
    const privateProfileData = { ...mockProfileData, isPublic: false };

    render(
      <PrivacySettings
        profileData={privateProfileData}
        onUpdatePrivacy={mockOnUpdatePrivacy}
      />
    );

    expect(screen.getByText('Only your name and profile picture')).toBeInTheDocument();
    expect(screen.getByText('No additional details')).toBeInTheDocument();
    expect(screen.getByText('No social information')).toBeInTheDocument();
  });

  it('handles console errors gracefully during failed updates', async () => {
    const user = userEvent.setup();
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => { });
    mockOnUpdatePrivacy.mockRejectedValue(new Error('Network error'));

    render(
      <PrivacySettings
        profileData={mockProfileData}
        onUpdatePrivacy={mockOnUpdatePrivacy}
      />
    );

    const publicProfileSwitch = screen.getAllByTestId('switch')[0];
    await user.click(publicProfileSwitch);

    await waitFor(() => {
      expect(consoleSpy).toHaveBeenCalledWith('Error updating isPublic:', expect.any(Error));
    });

    consoleSpy.mockRestore();
  });
});
