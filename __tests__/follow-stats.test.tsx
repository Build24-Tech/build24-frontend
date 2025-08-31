import { FollowStats } from '@/components/profile/FollowStats';
import { fireEvent, render, screen } from '@testing-library/react';

// Mock the child components
jest.mock('@/components/profile/FollowersList', () => {
  return function MockFollowersList({ userId, showTitle }: { userId: string; showTitle?: boolean }) {
    return <div data-testid="followers-list">Followers List for {userId} (showTitle: {String(showTitle)})</div>;
  };
});

jest.mock('@/components/profile/FollowingList', () => {
  return function MockFollowingList({ userId, showTitle }: { userId: string; showTitle?: boolean }) {
    return <div data-testid="following-list">Following List for {userId} (showTitle: {String(showTitle)})</div>;
  };
});

// Mock the UI components
jest.mock('@/components/ui/tabs', () => ({
  Tabs: ({ children, defaultValue }: { children: React.ReactNode; defaultValue: string }) => (
    <div data-testid="tabs" data-default-value={defaultValue}>{children}</div>
  ),
  TabsList: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="tabs-list">{children}</div>
  ),
  TabsTrigger: ({ children, value }: { children: React.ReactNode; value: string }) => (
    <button role="tab" data-value={value}>{children}</button>
  ),
  TabsContent: ({ children, value }: { children: React.ReactNode; value: string }) => (
    <div data-testid={`tab-content-${value}`}>{children}</div>
  ),
}));

jest.mock('@/components/ui/dialog', () => ({
  Dialog: ({ children }: { children: React.ReactNode }) => <div data-testid="dialog">{children}</div>,
  DialogContent: ({ children }: { children: React.ReactNode }) => <div data-testid="dialog-content">{children}</div>,
  DialogHeader: ({ children }: { children: React.ReactNode }) => <div data-testid="dialog-header">{children}</div>,
  DialogTitle: ({ children }: { children: React.ReactNode }) => <h2 data-testid="dialog-title">{children}</h2>,
  DialogTrigger: ({ children, asChild }: { children: React.ReactNode; asChild?: boolean }) => (
    asChild ? children : <button data-testid="dialog-trigger">{children}</button>
  ),
}));

describe('FollowStats', () => {
  const defaultProps = {
    userId: 'test-user-id',
    followerCount: 150,
    followingCount: 75,
  };

  describe('Default variant', () => {
    it('renders follower and following counts', () => {
      render(<FollowStats {...defaultProps} />);

      expect(screen.getByText('150')).toBeInTheDocument();
      expect(screen.getByText('Followers')).toBeInTheDocument();
      expect(screen.getByText('75')).toBeInTheDocument();
      expect(screen.getByText('Following')).toBeInTheDocument();
    });

    it('opens dialog when clicked', () => {
      render(<FollowStats {...defaultProps} />);

      const button = screen.getByRole('button');
      fireEvent.click(button);

      expect(screen.getByText('Social Connections')).toBeInTheDocument();
      expect(screen.getByTestId('followers-list')).toBeInTheDocument();
      expect(screen.getByTestId('following-list')).toBeInTheDocument();
    });

    it('shows tabs in dialog', () => {
      render(<FollowStats {...defaultProps} />);

      const button = screen.getByRole('button');
      fireEvent.click(button);

      expect(screen.getByRole('tab', { name: /followers \(150\)/i })).toBeInTheDocument();
      expect(screen.getByRole('tab', { name: /following \(75\)/i })).toBeInTheDocument();
    });
  });

  describe('Inline variant', () => {
    it('renders stats inline without dialog', () => {
      render(<FollowStats {...defaultProps} variant="inline" />);

      expect(screen.getByText('150')).toBeInTheDocument();
      expect(screen.getByText('75')).toBeInTheDocument();
      expect(screen.queryByRole('button')).not.toBeInTheDocument();
    });
  });

  describe('Compact variant', () => {
    it('renders stats in a card', () => {
      render(<FollowStats {...defaultProps} variant="compact" />);

      expect(screen.getByText('150')).toBeInTheDocument();
      expect(screen.getByText('75')).toBeInTheDocument();
      // Should be clickable to open dialog (wrapped in a button)
      expect(screen.getByTestId('dialog-trigger')).toBeInTheDocument();
    });
  });

  describe('No dialog variant', () => {
    it('renders stats and lists without dialog', () => {
      render(<FollowStats {...defaultProps} showAsDialog={false} />);

      expect(screen.getByText('150')).toBeInTheDocument();
      expect(screen.getByText('75')).toBeInTheDocument();
      expect(screen.getByTestId('followers-list')).toBeInTheDocument();
      expect(screen.getByTestId('following-list')).toBeInTheDocument();
      expect(screen.queryByText('Social Connections')).not.toBeInTheDocument();
    });
  });

  describe('Count formatting', () => {
    it('formats large numbers correctly', () => {
      render(
        <FollowStats
          userId="test-user"
          followerCount={1500}
          followingCount={2500000}
          variant="inline"
        />
      );

      expect(screen.getByText('1.5K')).toBeInTheDocument();
      expect(screen.getByText('2.5M')).toBeInTheDocument();
    });

    it('shows exact numbers for small counts', () => {
      render(
        <FollowStats
          userId="test-user"
          followerCount={999}
          followingCount={50}
          variant="inline"
        />
      );

      expect(screen.getByText('999')).toBeInTheDocument();
      expect(screen.getByText('50')).toBeInTheDocument();
    });

    it('handles zero counts', () => {
      render(
        <FollowStats
          userId="test-user"
          followerCount={0}
          followingCount={0}
          variant="inline"
        />
      );

      expect(screen.getAllByText('0')).toHaveLength(2); // Both follower and following counts are 0
    });
  });

  describe('Singular/plural labels', () => {
    it('uses singular label for one follower', () => {
      render(
        <FollowStats
          userId="test-user"
          followerCount={1}
          followingCount={5}
          variant="inline"
        />
      );

      expect(screen.getByText('Follower')).toBeInTheDocument();
      expect(screen.getByText('Following')).toBeInTheDocument();
    });

    it('uses plural label for multiple followers', () => {
      render(
        <FollowStats
          userId="test-user"
          followerCount={2}
          followingCount={5}
          variant="inline"
        />
      );

      expect(screen.getByText('Followers')).toBeInTheDocument();
      expect(screen.getByText('Following')).toBeInTheDocument();
    });
  });

  describe('Tab switching', () => {
    it('switches between followers and following tabs', () => {
      render(<FollowStats {...defaultProps} />);

      const button = screen.getByRole('button');
      fireEvent.click(button);

      // Initially followers tab should be active
      expect(screen.getByTestId('followers-list')).toBeInTheDocument();

      // Click following tab
      const followingTab = screen.getByRole('tab', { name: /following \(75\)/i });
      fireEvent.click(followingTab);

      expect(screen.getByTestId('following-list')).toBeInTheDocument();
    });
  });

  describe('Custom className', () => {
    it('applies custom className', () => {
      render(
        <FollowStats
          {...defaultProps}
          variant="inline"
          className="custom-class"
        />
      );

      const container = screen.getByText('150').closest('div')?.parentElement;
      expect(container).toHaveClass('custom-class');
    });
  });

  describe('Child component props', () => {
    it('passes correct props to child components', () => {
      render(<FollowStats {...defaultProps} showAsDialog={false} />);

      expect(screen.getByTestId('followers-list')).toHaveTextContent('showTitle: false');
      expect(screen.getByTestId('following-list')).toHaveTextContent('showTitle: false');
    });
  });
});
