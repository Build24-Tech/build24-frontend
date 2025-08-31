import { FollowButton } from '@/components/profile/FollowButton';
import { useToast } from '@/hooks/use-toast';
import { followUser, unfollowUser } from '@/lib/follow-service';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';

// Mock the follow service
jest.mock('@/lib/follow-service', () => ({
  followUser: jest.fn(),
  unfollowUser: jest.fn(),
}));

// Mock the toast hook
jest.mock('@/hooks/use-toast', () => ({
  useToast: jest.fn(),
}));

const mockToast = jest.fn();
const mockFollowUser = followUser as jest.MockedFunction<typeof followUser>;
const mockUnfollowUser = unfollowUser as jest.MockedFunction<typeof unfollowUser>;
const mockUseToast = useToast as jest.MockedFunction<typeof useToast>;

describe('FollowButton', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockUseToast.mockReturnValue({ toast: mockToast });
  });

  const defaultProps = {
    targetUserId: 'target-user-id',
    currentUserId: 'current-user-id',
    initialFollowState: false,
  };

  it('renders follow button when not following', () => {
    render(<FollowButton {...defaultProps} />);

    expect(screen.getByRole('button', { name: /follow/i })).toBeInTheDocument();
  });

  it('renders unfollow button when following', () => {
    render(<FollowButton {...defaultProps} initialFollowState={true} />);

    expect(screen.getByRole('button', { name: /unfollow/i })).toBeInTheDocument();
  });

  it('does not render when current user is target user', () => {
    render(
      <FollowButton
        {...defaultProps}
        currentUserId="same-user-id"
        targetUserId="same-user-id"
      />
    );

    expect(screen.queryByRole('button')).not.toBeInTheDocument();
  });

  it('handles follow action successfully', async () => {
    mockFollowUser.mockResolvedValueOnce();
    const onFollowChange = jest.fn();

    render(
      <FollowButton
        {...defaultProps}
        onFollowChange={onFollowChange}
      />
    );

    const followButton = screen.getByRole('button', { name: /follow/i });
    fireEvent.click(followButton);

    // Check optimistic update
    expect(onFollowChange).toHaveBeenCalledWith(true);
    expect(screen.getByText(/following\.\.\./i)).toBeInTheDocument();

    await waitFor(() => {
      expect(mockFollowUser).toHaveBeenCalledWith('current-user-id', 'target-user-id');
      expect(mockToast).toHaveBeenCalledWith({
        title: 'Success',
        description: 'You are now following this user.',
      });
    });
  });

  it('handles unfollow action successfully', async () => {
    mockUnfollowUser.mockResolvedValueOnce();
    const onFollowChange = jest.fn();

    render(
      <FollowButton
        {...defaultProps}
        initialFollowState={true}
        onFollowChange={onFollowChange}
      />
    );

    const unfollowButton = screen.getByRole('button', { name: /unfollow/i });
    fireEvent.click(unfollowButton);

    // Check optimistic update
    expect(onFollowChange).toHaveBeenCalledWith(false);
    expect(screen.getByText(/unfollowing\.\.\./i)).toBeInTheDocument();

    await waitFor(() => {
      expect(mockUnfollowUser).toHaveBeenCalledWith('current-user-id', 'target-user-id');
      expect(mockToast).toHaveBeenCalledWith({
        title: 'Success',
        description: 'You have unfollowed this user.',
      });
    });
  });

  it('reverts optimistic update on follow error', async () => {
    const error = new Error('Follow failed');
    mockFollowUser.mockRejectedValueOnce(error);
    const onFollowChange = jest.fn();

    render(
      <FollowButton
        {...defaultProps}
        onFollowChange={onFollowChange}
      />
    );

    const followButton = screen.getByRole('button', { name: /follow/i });
    fireEvent.click(followButton);

    await waitFor(() => {
      expect(onFollowChange).toHaveBeenCalledWith(true); // Optimistic update
      expect(onFollowChange).toHaveBeenCalledWith(false); // Revert on error
      expect(mockToast).toHaveBeenCalledWith({
        title: 'Error',
        description: 'Follow failed',
        variant: 'destructive',
      });
    });
  });

  it('reverts optimistic update on unfollow error', async () => {
    const error = new Error('Unfollow failed');
    mockUnfollowUser.mockRejectedValueOnce(error);
    const onFollowChange = jest.fn();

    render(
      <FollowButton
        {...defaultProps}
        initialFollowState={true}
        onFollowChange={onFollowChange}
      />
    );

    const unfollowButton = screen.getByRole('button', { name: /unfollow/i });
    fireEvent.click(unfollowButton);

    await waitFor(() => {
      expect(onFollowChange).toHaveBeenCalledWith(false); // Optimistic update
      expect(onFollowChange).toHaveBeenCalledWith(true); // Revert on error
      expect(mockToast).toHaveBeenCalledWith({
        title: 'Error',
        description: 'Unfollow failed',
        variant: 'destructive',
      });
    });
  });

  it('disables button when disabled prop is true', () => {
    render(<FollowButton {...defaultProps} disabled={true} />);

    const button = screen.getByRole('button');
    expect(button).toBeDisabled();
  });

  it('applies correct size classes', () => {
    const { rerender } = render(<FollowButton {...defaultProps} size="sm" />);
    expect(screen.getByRole('button')).toHaveClass('h-9'); // sm size is h-9

    rerender(<FollowButton {...defaultProps} size="lg" />);
    expect(screen.getByRole('button')).toHaveClass('h-11'); // lg size is h-11
  });

  it('applies correct variant styles based on follow state', () => {
    // Test with not following state
    render(<FollowButton {...defaultProps} initialFollowState={false} />);
    expect(screen.getByRole('button')).toHaveClass('bg-primary'); // Default variant
    expect(screen.getByText('Follow')).toBeInTheDocument();
  });

  it('applies outline variant when following', () => {
    // Test with following state
    render(<FollowButton {...defaultProps} initialFollowState={true} />);
    expect(screen.getByRole('button')).toHaveClass('border-gray-600'); // Outline variant
    expect(screen.getByText('Unfollow')).toBeInTheDocument();
  });
});
