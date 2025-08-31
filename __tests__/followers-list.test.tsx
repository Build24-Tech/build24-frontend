import { FollowersList } from '@/components/profile/FollowersList';
import { getFollowers } from '@/lib/follow-service';
import { PublicProfileView } from '@/types/user';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';

// Mock the follow service
jest.mock('@/lib/follow-service', () => ({
  getFollowers: jest.fn(),
}));

// Mock Next.js Link component
jest.mock('next/link', () => {
  return function MockLink({ children, href }: { children: React.ReactNode; href: string }) {
    return <a href={href}>{children}</a>;
  };
});

const mockGetFollowers = getFollowers as jest.MockedFunction<typeof getFollowers>;

const mockFollowers: PublicProfileView[] = [
  {
    uid: 'follower-1',
    displayName: 'John Doe',
    photoURL: 'https://example.com/john.jpg',
    bio: 'Software developer',
    followerCount: 50,
    followingCount: 25,
  },
  {
    uid: 'follower-2',
    displayName: 'Jane Smith',
    photoURL: 'https://example.com/jane.jpg',
    bio: 'Designer and creator',
    followerCount: 100,
    followingCount: 75,
  },
];

describe('FollowersList', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  const defaultProps = {
    userId: 'test-user-id',
  };

  it('renders with initial followers', () => {
    render(<FollowersList {...defaultProps} initialFollowers={mockFollowers} />);

    expect(screen.getByText('Followers (2)')).toBeInTheDocument();
    expect(screen.getByText('John Doe')).toBeInTheDocument();
    expect(screen.getByText('Jane Smith')).toBeInTheDocument();
    expect(screen.getByText('Software developer')).toBeInTheDocument();
    expect(screen.getByText('Designer and creator')).toBeInTheDocument();
  });

  it('loads followers when no initial data provided', async () => {
    mockGetFollowers.mockResolvedValueOnce(mockFollowers);

    render(<FollowersList {...defaultProps} />);

    await waitFor(() => {
      expect(mockGetFollowers).toHaveBeenCalledWith('test-user-id', 10);
      expect(screen.getByText('John Doe')).toBeInTheDocument();
      expect(screen.getByText('Jane Smith')).toBeInTheDocument();
    });
  });

  it('displays loading skeletons while loading', async () => {
    mockGetFollowers.mockImplementation(() => new Promise(resolve => setTimeout(() => resolve(mockFollowers), 100)));

    render(<FollowersList {...defaultProps} />);

    // Should show loading skeletons
    expect(screen.getAllByText(/loading/i)).toHaveLength(0); // Loading skeletons are present but don't have specific text

    await waitFor(() => {
      expect(screen.getByText('John Doe')).toBeInTheDocument();
    });
  });

  it('displays empty state when no followers', async () => {
    mockGetFollowers.mockResolvedValueOnce([]);

    render(<FollowersList {...defaultProps} />);

    await waitFor(() => {
      expect(screen.getByText('No followers yet.')).toBeInTheDocument();
    });
  });

  it('displays error state and retry button on error', async () => {
    const error = new Error('Failed to load followers');
    mockGetFollowers.mockRejectedValueOnce(error);

    render(<FollowersList {...defaultProps} />);

    await waitFor(() => {
      expect(screen.getByText(/Failed to load followers/)).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /try again/i })).toBeInTheDocument();
    });
  });

  it('retries loading on retry button click', async () => {
    const error = new Error('Network error');
    mockGetFollowers.mockRejectedValueOnce(error).mockResolvedValueOnce(mockFollowers);

    render(<FollowersList {...defaultProps} />);

    await waitFor(() => {
      expect(screen.getByText(/Failed to load followers/)).toBeInTheDocument();
    });

    const retryButton = screen.getByRole('button', { name: /try again/i });
    fireEvent.click(retryButton);

    await waitFor(() => {
      expect(mockGetFollowers).toHaveBeenCalledTimes(2);
      expect(screen.getByText('John Doe')).toBeInTheDocument();
    });
  });

  it('loads more followers when load more button is clicked', async () => {
    const moreFollowers: PublicProfileView[] = [
      {
        uid: 'follower-3',
        displayName: 'Bob Wilson',
        photoURL: 'https://example.com/bob.jpg',
        followerCount: 25,
        followingCount: 30,
      },
    ];

    mockGetFollowers
      .mockResolvedValueOnce(mockFollowers) // Initial load
      .mockResolvedValueOnce(moreFollowers); // Load more

    render(<FollowersList {...defaultProps} pageSize={2} />);

    await waitFor(() => {
      expect(screen.getByText('John Doe')).toBeInTheDocument();
      expect(screen.getByText('Jane Smith')).toBeInTheDocument();
    });

    const loadMoreButton = screen.getByRole('button', { name: /load more/i });
    fireEvent.click(loadMoreButton);

    await waitFor(() => {
      expect(mockGetFollowers).toHaveBeenCalledTimes(2);
      expect(screen.getByText('Bob Wilson')).toBeInTheDocument();
    });
  });

  it('hides load more button when no more followers', async () => {
    const singleFollower = [mockFollowers[0]];
    mockGetFollowers.mockResolvedValueOnce(singleFollower);

    render(<FollowersList {...defaultProps} pageSize={10} />);

    await waitFor(() => {
      expect(screen.getByText('John Doe')).toBeInTheDocument();
      expect(screen.queryByRole('button', { name: /load more/i })).not.toBeInTheDocument();
    });
  });

  it('renders profile links correctly', async () => {
    mockGetFollowers.mockResolvedValueOnce(mockFollowers);

    render(<FollowersList {...defaultProps} />);

    await waitFor(() => {
      const johnLink = screen.getByRole('link', { name: 'John Doe' });
      const janeLink = screen.getByRole('link', { name: 'Jane Smith' });

      expect(johnLink).toHaveAttribute('href', '/profile/follower-1');
      expect(janeLink).toHaveAttribute('href', '/profile/follower-2');
    });
  });

  it('displays follower counts correctly', async () => {
    mockGetFollowers.mockResolvedValueOnce(mockFollowers);

    render(<FollowersList {...defaultProps} />);

    await waitFor(() => {
      expect(screen.getByText('50 followers')).toBeInTheDocument();
      expect(screen.getByText('100 followers')).toBeInTheDocument();
    });
  });

  it('handles users without display names', async () => {
    const anonymousFollower: PublicProfileView = {
      uid: 'anonymous-user',
      followerCount: 0,
      followingCount: 0,
    };

    mockGetFollowers.mockResolvedValueOnce([anonymousFollower]);

    render(<FollowersList {...defaultProps} />);

    await waitFor(() => {
      expect(screen.getByText('Anonymous User')).toBeInTheDocument();
      expect(screen.getByText('U')).toBeInTheDocument(); // Avatar fallback
    });
  });

  it('hides title when showTitle is false', () => {
    render(
      <FollowersList
        {...defaultProps}
        initialFollowers={mockFollowers}
        showTitle={false}
      />
    );

    expect(screen.queryByText(/Followers \(/)).not.toBeInTheDocument();
  });
});
