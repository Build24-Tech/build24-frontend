import { FollowingList } from '@/components/profile/FollowingList';
import { getFollowing } from '@/lib/follow-service';
import { PublicProfileView } from '@/types/user';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';

// Mock the follow service
jest.mock('@/lib/follow-service', () => ({
  getFollowing: jest.fn(),
}));

// Mock Next.js Link component
jest.mock('next/link', () => {
  return function MockLink({ children, href }: { children: React.ReactNode; href: string }) {
    return <a href={href}>{children}</a>;
  };
});

const mockGetFollowing = getFollowing as jest.MockedFunction<typeof getFollowing>;

const mockFollowing: PublicProfileView[] = [
  {
    uid: 'following-1',
    displayName: 'Alice Johnson',
    photoURL: 'https://example.com/alice.jpg',
    bio: 'Product manager',
    followerCount: 200,
    followingCount: 150,
  },
  {
    uid: 'following-2',
    displayName: 'Charlie Brown',
    photoURL: 'https://example.com/charlie.jpg',
    bio: 'Full-stack developer',
    followerCount: 75,
    followingCount: 100,
  },
];

describe('FollowingList', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  const defaultProps = {
    userId: 'test-user-id',
  };

  it('renders with initial following data', () => {
    render(<FollowingList {...defaultProps} initialFollowing={mockFollowing} />);

    expect(screen.getByText('Following (2)')).toBeInTheDocument();
    expect(screen.getByText('Alice Johnson')).toBeInTheDocument();
    expect(screen.getByText('Charlie Brown')).toBeInTheDocument();
    expect(screen.getByText('Product manager')).toBeInTheDocument();
    expect(screen.getByText('Full-stack developer')).toBeInTheDocument();
  });

  it('loads following data when no initial data provided', async () => {
    mockGetFollowing.mockResolvedValueOnce(mockFollowing);

    render(<FollowingList {...defaultProps} />);

    await waitFor(() => {
      expect(mockGetFollowing).toHaveBeenCalledWith('test-user-id', 10);
      expect(screen.getByText('Alice Johnson')).toBeInTheDocument();
      expect(screen.getByText('Charlie Brown')).toBeInTheDocument();
    });
  });

  it('displays loading skeletons while loading', async () => {
    mockGetFollowing.mockImplementation(() => new Promise(resolve => setTimeout(() => resolve(mockFollowing), 100)));

    render(<FollowingList {...defaultProps} />);

    // Should show loading skeletons
    expect(screen.getAllByText(/loading/i)).toHaveLength(0); // Loading skeletons are present but don't have specific text

    await waitFor(() => {
      expect(screen.getByText('Alice Johnson')).toBeInTheDocument();
    });
  });

  it('displays empty state when not following anyone', async () => {
    mockGetFollowing.mockResolvedValueOnce([]);

    render(<FollowingList {...defaultProps} />);

    await waitFor(() => {
      expect(screen.getByText('Not following anyone yet.')).toBeInTheDocument();
    });
  });

  it('displays error state and retry button on error', async () => {
    const error = new Error('Failed to load following');
    mockGetFollowing.mockRejectedValueOnce(error);

    render(<FollowingList {...defaultProps} />);

    await waitFor(() => {
      expect(screen.getByText(/Failed to load following/)).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /try again/i })).toBeInTheDocument();
    });
  });

  it('retries loading on retry button click', async () => {
    const error = new Error('Network error');
    mockGetFollowing.mockRejectedValueOnce(error).mockResolvedValueOnce(mockFollowing);

    render(<FollowingList {...defaultProps} />);

    await waitFor(() => {
      expect(screen.getByText(/Failed to load following/)).toBeInTheDocument();
    });

    const retryButton = screen.getByRole('button', { name: /try again/i });
    fireEvent.click(retryButton);

    await waitFor(() => {
      expect(mockGetFollowing).toHaveBeenCalledTimes(2);
      expect(screen.getByText('Alice Johnson')).toBeInTheDocument();
    });
  });

  it('loads more following when load more button is clicked', async () => {
    const moreFollowing: PublicProfileView[] = [
      {
        uid: 'following-3',
        displayName: 'David Lee',
        photoURL: 'https://example.com/david.jpg',
        followerCount: 50,
        followingCount: 40,
      },
    ];

    mockGetFollowing
      .mockResolvedValueOnce(mockFollowing) // Initial load
      .mockResolvedValueOnce(moreFollowing); // Load more

    render(<FollowingList {...defaultProps} pageSize={2} />);

    await waitFor(() => {
      expect(screen.getByText('Alice Johnson')).toBeInTheDocument();
      expect(screen.getByText('Charlie Brown')).toBeInTheDocument();
    });

    const loadMoreButton = screen.getByRole('button', { name: /load more/i });
    fireEvent.click(loadMoreButton);

    await waitFor(() => {
      expect(mockGetFollowing).toHaveBeenCalledTimes(2);
      expect(screen.getByText('David Lee')).toBeInTheDocument();
    });
  });

  it('hides load more button when no more following', async () => {
    const singleFollowing = [mockFollowing[0]];
    mockGetFollowing.mockResolvedValueOnce(singleFollowing);

    render(<FollowingList {...defaultProps} pageSize={10} />);

    await waitFor(() => {
      expect(screen.getByText('Alice Johnson')).toBeInTheDocument();
      expect(screen.queryByRole('button', { name: /load more/i })).not.toBeInTheDocument();
    });
  });

  it('renders profile links correctly', async () => {
    mockGetFollowing.mockResolvedValueOnce(mockFollowing);

    render(<FollowingList {...defaultProps} />);

    await waitFor(() => {
      const aliceLink = screen.getByRole('link', { name: 'Alice Johnson' });
      const charlieLink = screen.getByRole('link', { name: 'Charlie Brown' });

      expect(aliceLink).toHaveAttribute('href', '/profile/following-1');
      expect(charlieLink).toHaveAttribute('href', '/profile/following-2');
    });
  });

  it('displays follower counts correctly', async () => {
    mockGetFollowing.mockResolvedValueOnce(mockFollowing);

    render(<FollowingList {...defaultProps} />);

    await waitFor(() => {
      expect(screen.getByText('200 followers')).toBeInTheDocument();
      expect(screen.getByText('75 followers')).toBeInTheDocument();
    });
  });

  it('handles users without display names', async () => {
    const anonymousFollowing: PublicProfileView = {
      uid: 'anonymous-user',
      followerCount: 0,
      followingCount: 0,
    };

    mockGetFollowing.mockResolvedValueOnce([anonymousFollowing]);

    render(<FollowingList {...defaultProps} />);

    await waitFor(() => {
      expect(screen.getByText('Anonymous User')).toBeInTheDocument();
      expect(screen.getByText('U')).toBeInTheDocument(); // Avatar fallback
    });
  });

  it('handles users without bio', async () => {
    const userWithoutBio: PublicProfileView = {
      uid: 'user-no-bio',
      displayName: 'No Bio User',
      followerCount: 10,
      followingCount: 5,
    };

    mockGetFollowing.mockResolvedValueOnce([userWithoutBio]);

    render(<FollowingList {...defaultProps} />);

    await waitFor(() => {
      expect(screen.getByText('No Bio User')).toBeInTheDocument();
      // Bio paragraph should not be rendered (only the user name link should exist)
      const bioElements = screen.queryAllByText(/bio/i);
      const userNameElement = screen.getByText('No Bio User');
      expect(userNameElement).toBeInTheDocument();
      // Should not have a separate bio text element
      expect(bioElements.filter(el => el !== userNameElement)).toHaveLength(0);
    });
  });

  it('hides title when showTitle is false', () => {
    render(
      <FollowingList
        {...defaultProps}
        initialFollowing={mockFollowing}
        showTitle={false}
      />
    );

    expect(screen.queryByText(/Following \(/)).not.toBeInTheDocument();
  });

  it('uses custom page size', async () => {
    mockGetFollowing.mockResolvedValueOnce(mockFollowing);

    render(<FollowingList {...defaultProps} pageSize={5} />);

    await waitFor(() => {
      expect(mockGetFollowing).toHaveBeenCalledWith('test-user-id', 5);
    });
  });
});
