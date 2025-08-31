import { PublicProfileView } from '@/components/profile/PublicProfileView';
import { PublicProfileView as PublicProfileViewType } from '@/types/user';
import '@testing-library/jest-dom';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';

// Mock Next.js Link component
jest.mock('next/link', () => {
  return function MockLink({ children, href, ...props }: any) {
    return <a href={href} {...props}>{children}</a>;
  };
});

describe('PublicProfileView', () => {
  const mockProfile: PublicProfileViewType = {
    uid: 'user123',
    displayName: 'John Doe',
    photoURL: 'https://example.com/avatar.jpg',
    bio: 'Software developer passionate about building great products.',
    location: 'San Francisco, CA',
    website: 'https://johndoe.dev',
    work: 'Tech Corp',
    role: 'Senior Developer',
    email: 'john@example.com',
    followerCount: 150,
    followingCount: 75,
    isFollowing: false
  };

  const mockOnFollowToggle = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders profile information correctly', () => {
    render(
      <PublicProfileView
        profile={mockProfile}
        currentUserId="currentUser123"
        onFollowToggle={mockOnFollowToggle}
      />
    );

    expect(screen.getByText('John Doe')).toBeInTheDocument();
    expect(screen.getByText('Senior Developer')).toBeInTheDocument();
    expect(screen.getByText('Software developer passionate about building great products.')).toBeInTheDocument();
    expect(screen.getByText('San Francisco, CA')).toBeInTheDocument();
    expect(screen.getByText('Tech Corp')).toBeInTheDocument();
    expect(screen.getByText('150')).toBeInTheDocument();
    expect(screen.getByText('75')).toBeInTheDocument();
  });

  it('displays avatar with fallback initials', () => {
    const profileWithoutPhoto = { ...mockProfile, photoURL: undefined };
    render(
      <PublicProfileView
        profile={profileWithoutPhoto}
        currentUserId="currentUser123"
      />
    );

    expect(screen.getByText('JD')).toBeInTheDocument();
  });

  it('shows follow button for other users', () => {
    render(
      <PublicProfileView
        profile={mockProfile}
        currentUserId="currentUser123"
        onFollowToggle={mockOnFollowToggle}
      />
    );

    const followButton = screen.getByRole('button', { name: /follow/i });
    expect(followButton).toBeInTheDocument();
    expect(followButton).not.toBeDisabled();
  });

  it('shows unfollow button when already following', () => {
    const followingProfile = { ...mockProfile, isFollowing: true };
    render(
      <PublicProfileView
        profile={followingProfile}
        currentUserId="currentUser123"
        onFollowToggle={mockOnFollowToggle}
      />
    );

    expect(screen.getByRole('button', { name: /unfollow/i })).toBeInTheDocument();
  });

  it('shows edit profile button for own profile', () => {
    render(
      <PublicProfileView
        profile={mockProfile}
        currentUserId="user123"
      />
    );

    expect(screen.getByRole('link', { name: /edit profile/i })).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /follow/i })).not.toBeInTheDocument();
  });

  it('handles follow button click', async () => {
    render(
      <PublicProfileView
        profile={mockProfile}
        currentUserId="currentUser123"
        onFollowToggle={mockOnFollowToggle}
      />
    );

    const followButton = screen.getByRole('button', { name: /follow/i });
    fireEvent.click(followButton);

    await waitFor(() => {
      expect(mockOnFollowToggle).toHaveBeenCalledWith(true);
    });
  });

  it('handles unfollow button click', async () => {
    const followingProfile = { ...mockProfile, isFollowing: true };
    render(
      <PublicProfileView
        profile={followingProfile}
        currentUserId="currentUser123"
        onFollowToggle={mockOnFollowToggle}
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
      <PublicProfileView
        profile={mockProfile}
        currentUserId="currentUser123"
        onFollowToggle={mockOnFollowToggle}
        isLoading={true}
      />
    );

    const followButton = screen.getByRole('button', { name: /follow/i });
    expect(followButton).toBeDisabled();
  });

  it('formats website URL correctly', () => {
    render(
      <PublicProfileView
        profile={mockProfile}
        currentUserId="currentUser123"
      />
    );

    const websiteLink = screen.getByRole('link', { name: /johndoe\.dev/i });
    expect(websiteLink).toHaveAttribute('href', 'https://johndoe.dev');
    expect(websiteLink).toHaveAttribute('target', '_blank');
    expect(websiteLink).toHaveAttribute('rel', 'noopener noreferrer');
  });

  it('formats website URL without protocol', () => {
    const profileWithoutProtocol = { ...mockProfile, website: 'johndoe.dev' };
    render(
      <PublicProfileView
        profile={profileWithoutProtocol}
        currentUserId="currentUser123"
      />
    );

    const websiteLink = screen.getByRole('link', { name: /johndoe\.dev/i });
    expect(websiteLink).toHaveAttribute('href', 'https://johndoe.dev');
  });

  it('renders email as mailto link', () => {
    render(
      <PublicProfileView
        profile={mockProfile}
        currentUserId="currentUser123"
      />
    );

    const emailLink = screen.getByRole('link', { name: /john@example\.com/i });
    expect(emailLink).toHaveAttribute('href', 'mailto:john@example.com');
  });

  it('handles profile without optional fields', () => {
    const minimalProfile: PublicProfileViewType = {
      uid: 'user123',
      followerCount: 0,
      followingCount: 0
    };

    render(
      <PublicProfileView
        profile={minimalProfile}
        currentUserId="currentUser123"
      />
    );

    expect(screen.getByText('Anonymous User')).toBeInTheDocument();
    expect(screen.getAllByText('0')).toHaveLength(2); // Both follower and following counts
    expect(screen.queryByText('Senior Developer')).not.toBeInTheDocument();
    expect(screen.queryByText('Software developer')).not.toBeInTheDocument();
  });

  it('displays correct follower count formatting', () => {
    const profileWithManyFollowers = {
      ...mockProfile,
      followerCount: 1500,
      followingCount: 2000
    };

    render(
      <PublicProfileView
        profile={profileWithManyFollowers}
        currentUserId="currentUser123"
      />
    );

    expect(screen.getByText('1,500')).toBeInTheDocument();
    expect(screen.getByText('2,000')).toBeInTheDocument();
  });

  it('shows singular follower text for one follower', () => {
    const profileWithOneFollower = { ...mockProfile, followerCount: 1 };
    render(
      <PublicProfileView
        profile={profileWithOneFollower}
        currentUserId="currentUser123"
      />
    );

    expect(screen.getByText('Follower')).toBeInTheDocument();
  });

  it('shows plural followers text for multiple followers', () => {
    render(
      <PublicProfileView
        profile={mockProfile}
        currentUserId="currentUser123"
      />
    );

    expect(screen.getByText('Followers')).toBeInTheDocument();
  });

  it('does not show follow button when not authenticated', () => {
    render(<PublicProfileView profile={mockProfile} />);

    expect(screen.queryByRole('button', { name: /follow/i })).not.toBeInTheDocument();
    expect(screen.queryByRole('link', { name: /edit profile/i })).not.toBeInTheDocument();
  });
});
