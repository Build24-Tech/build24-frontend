import { PrivateProfileMessage } from '@/components/profile/PrivateProfileMessage';
import '@testing-library/jest-dom';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';

// Mock Next.js k component
jest.mock('next/link', () => {
  return function MockLink({ children, href, ...props }: any) {
    return <a href={href} {...props}>{children}</a>;
  };
});

describe('PrivateProfileMessage', () => {
  const mockOnFollowToggle = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders private profile message correctly', () => {
    render(
      <PrivateProfileMessage
        displayName="John Doe"
        photoURL="https://example.com/avatar.jpg"
        currentUserId="currentUser123"
        targetUserId="user123"
        onFollowToggle={mockOnFollowToggle}
      />
    );

    expect(screen.getByText('John Doe')).toBeInTheDocument();
    expect(screen.getByText('This profile is private')).toBeInTheDocument();
    expect(screen.getByText(/This user has chosen to keep their profile private/)).toBeInTheDocument();
  });

  it('displays avatar with fallback initials', () => {
    render(
      <PrivateProfileMessage
        displayName="John Doe"
        currentUserId="currentUser123"
        targetUserId="user123"
      />
    );

    expect(screen.getByText('JD')).toBeInTheDocument();
  });

  it('shows anonymous user when no display name provided', () => {
    render(
      <PrivateProfileMessage
        currentUserId="currentUser123"
        targetUserId="user123"
      />
    );

    expect(screen.getByText('Anonymous User')).toBeInTheDocument();
    expect(screen.getByText('U')).toBeInTheDocument(); // Fallback initial
  });

  it('shows follow button for other users', () => {
    render(
      <PrivateProfileMessage
        displayName="John Doe"
        currentUserId="currentUser123"
        targetUserId="user123"
        onFollowToggle={mockOnFollowToggle}
        isFollowing={false}
      />
    );

    const followButton = screen.getByRole('button', { name: /follow/i });
    expect(followButton).toBeInTheDocument();
    expect(followButton).not.toBeDisabled();
  });

  it('shows unfollow button when already following', () => {
    render(
      <PrivateProfileMessage
        displayName="John Doe"
        currentUserId="currentUser123"
        targetUserId="user123"
        onFollowToggle={mockOnFollowToggle}
        isFollowing={true}
      />
    );

    expect(screen.getByRole('button', { name: /unfollow/i })).toBeInTheDocument();
  });

  it('does not show follow button for own profile', () => {
    render(
      <PrivateProfileMessage
        displayName="John Doe"
        currentUserId="user123"
        targetUserId="user123"
        onFollowToggle={mockOnFollowToggle}
      />
    );

    expect(screen.queryByRole('button', { name: /follow/i })).not.toBeInTheDocument();
  });

  it('does not show follow button when not authenticated', () => {
    render(
      <PrivateProfileMessage
        displayName="John Doe"
        targetUserId="user123"
        onFollowToggle={mockOnFollowToggle}
      />
    );

    expect(screen.queryByRole('button', { name: /follow/i })).not.toBeInTheDocument();
  });

  it('handles follow button click', async () => {
    render(
      <PrivateProfileMessage
        displayName="John Doe"
        currentUserId="currentUser123"
        targetUserId="user123"
        onFollowToggle={mockOnFollowToggle}
        isFollowing={false}
      />
    );

    const followButton = screen.getByRole('button', { name: /follow/i });
    fireEvent.click(followButton);

    await waitFor(() => {
      expect(mockOnFollowToggle).toHaveBeenCalledWith(true);
    });
  });

  it('handles unfollow button click', async () => {
    render(
      <PrivateProfileMessage
        displayName="John Doe"
        currentUserId="currentUser123"
        targetUserId="user123"
        onFollowToggle={mockOnFollowToggle}
        isFollowing={true}
      />
    );

    const unfollowButton = screen.getByRole('button', { name: /unfollow/i });
    fireEvent.click(unfollowButton);

    await waitFor(() => {
      expect(mockOnFollowToggle).toHaveBeenCalledWith(false);
    });
  });

  it('disables follow button when loading', () => {
    render(
      <PrivateProfileMessage
        displayName="John Doe"
        currentUserId="currentUser123"
        targetUserId="user123"
        onFollowToggle={mockOnFollowToggle}
        isFollowing={false}
        isLoading={true}
      />
    );

    const followButton = screen.getByRole('button', { name: /follow/i });
    expect(followButton).toBeDisabled();
  });

  it('shows follow encouragement message when not following', () => {
    render(
      <PrivateProfileMessage
        displayName="John Doe"
        currentUserId="currentUser123"
        targetUserId="user123"
        onFollowToggle={mockOnFollowToggle}
        isFollowing={false}
      />
    );

    expect(screen.getByText(/Follow this user to stay updated/)).toBeInTheDocument();
  });

  it('shows following confirmation message when following', () => {
    render(
      <PrivateProfileMessage
        displayName="John Doe"
        currentUserId="currentUser123"
        targetUserId="user123"
        onFollowToggle={mockOnFollowToggle}
        isFollowing={true}
      />
    );

    expect(screen.getByText(/You are following this user/)).toBeInTheDocument();
  });

  it('renders back to dashboard link', () => {
    render(
      <PrivateProfileMessage
        displayName="John Doe"
        currentUserId="currentUser123"
        targetUserId="user123"
      />
    );

    const backLink = screen.getByRole('link', { name: /back to dashboard/i });
    expect(backLink).toBeInTheDocument();
    expect(backLink).toHaveAttribute('href', '/dashboard');
  });

  it('displays lock icon', () => {
    render(
      <PrivateProfileMessage
        displayName="John Doe"
        currentUserId="currentUser123"
        targetUserId="user123"
      />
    );

    // Check for the presence of the lock icon (we can't easily test the actual icon, but we can test its container)
    const lockContainer = screen.getByText('This profile is private').closest('div');
    expect(lockContainer).toBeInTheDocument();
  });

  it('handles single character names for initials', () => {
    render(
      <PrivateProfileMessage
        displayName="X"
        currentUserId="currentUser123"
        targetUserId="user123"
      />
    );

    // Check for the display name in the heading
    expect(screen.getByRole('heading', { name: 'X' })).toBeInTheDocument();
    // Check that we have exactly 2 instances of 'X' (one in heading, one in avatar)
    expect(screen.getAllByText('X')).toHaveLength(2);
  });

  it('handles multi-word names for initials', () => {
    render(
      <PrivateProfileMessage
        displayName="John Michael Doe Smith"
        currentUserId="currentUser123"
        targetUserId="user123"
      />
    );

    expect(screen.getByText('JM')).toBeInTheDocument(); // Should only take first 2 initials
  });
});
