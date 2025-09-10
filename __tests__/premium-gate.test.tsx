import { PremiumGate, useHasPremiumAccess, useUserTier } from '@/components/knowledge-hub/PremiumGate';
import { useAuth } from '@/contexts/AuthContext';
import { UserProfile } from '@/types/user';
import { fireEvent, render, screen } from '@testing-library/react';

// Mock the auth context
jest.mock('@/contexts/AuthContext');
const mockUseAuth = useAuth as jest.MockedFunction<typeof useAuth>;

// Mock window.open
const mockWindowOpen = jest.fn();
Object.defineProperty(window, 'open', {
  value: mockWindowOpen,
  writable: true,
});

const mockUserProfile: UserProfile = {
  uid: 'test-user',
  email: 'test@example.com',
  displayName: 'Test User',
  status: 'active',
  emailUpdates: false,
  language: 'en',
  theme: 'dark',
  subscription: {
    tier: 'free',
    subscriptionStatus: 'active'
  },
  createdAt: Date.now(),
  updatedAt: Date.now()
};

describe('PremiumGate', () => {

  beforeEach(() => {
    jest.clearAllMocks();
    mockWindowOpen.mockClear();
  });

  describe('Free User Access', () => {
    beforeEach(() => {
      mockUseAuth.mockReturnValue({
        user: null,
        userProfile: mockUserProfile,
        loading: false,
        signUp: jest.fn(),
        signIn: jest.fn(),
        signInWithGoogle: jest.fn(),
        signInWithGithub: jest.fn(),
        signInWithApple: jest.fn(),
        logout: jest.fn(),
        resetPassword: jest.fn(),
        updateLanguage: jest.fn(),
        refreshUserProfile: jest.fn(),
      });
    });

    it('should show upgrade prompt for free users', () => {
      render(
        <PremiumGate>
          <div>Premium Content</div>
        </PremiumGate>
      );

      expect(screen.getByText('Premium Content')).toBeInTheDocument();
      expect(screen.getByText('Upgrade to Premium')).toBeInTheDocument();
      expect(screen.getByText('Yearly Plan')).toBeInTheDocument();
    });

    it('should show custom upgrade prompt when provided', () => {
      const customPrompt = {
        title: 'Custom Premium Title',
        description: 'Custom description for premium content',
        features: ['Feature 1', 'Feature 2', 'Feature 3']
      };

      render(
        <PremiumGate upgradePrompt={customPrompt}>
          <div>Premium Content</div>
        </PremiumGate>
      );

      expect(screen.getByText('Custom Premium Title')).toBeInTheDocument();
      expect(screen.getByText('Custom description for premium content')).toBeInTheDocument();
      expect(screen.getByText('Feature 1')).toBeInTheDocument();
      expect(screen.getByText('Feature 2')).toBeInTheDocument();
      expect(screen.getByText('Feature 3')).toBeInTheDocument();
    });

    it('should show preview content when provided', () => {
      render(
        <PremiumGate
          showPreview={true}
          previewContent={<div>Preview Content</div>}
        >
          <div>Premium Content</div>
        </PremiumGate>
      );

      expect(screen.getByText('Preview Content')).toBeInTheDocument();
      // The upgrade prompt will still show "Premium Content" as the title
      expect(screen.getByText('Premium Content')).toBeInTheDocument();
    });

    it('should show fallback content when preview is disabled', () => {
      render(
        <PremiumGate
          showPreview={false}
          fallback={<div>Fallback Content</div>}
        >
          <div>Premium Content</div>
        </PremiumGate>
      );

      expect(screen.getByText('Fallback Content')).toBeInTheDocument();
      expect(screen.queryByText('Premium Content')).not.toBeInTheDocument();
    });

    it('should handle monthly upgrade button click', () => {
      render(
        <PremiumGate>
          <div>Premium Content</div>
        </PremiumGate>
      );

      const upgradeButton = screen.getByText('Upgrade to Premium');
      fireEvent.click(upgradeButton);

      expect(mockWindowOpen).toHaveBeenCalledWith(
        '/subscribe?plan=monthly&source=knowledge-hub',
        '_blank'
      );
    });

    it('should handle yearly upgrade button click', () => {
      render(
        <PremiumGate>
          <div>Premium Content</div>
        </PremiumGate>
      );

      const yearlyButton = screen.getByText('Yearly Plan');
      fireEvent.click(yearlyButton);

      expect(mockWindowOpen).toHaveBeenCalledWith(
        '/subscribe?plan=yearly&source=knowledge-hub',
        '_blank'
      );
    });
  });

  describe('Premium User Access', () => {
    beforeEach(() => {
      const premiumUserProfile = {
        ...mockUserProfile,
        subscription: {
          tier: 'premium' as const,
          subscriptionStatus: 'active' as const,
          subscriptionId: 'sub_123',
          currentPeriodStart: Date.now() - 86400000, // 1 day ago
          currentPeriodEnd: Date.now() + 86400000 * 30, // 30 days from now
          cancelAtPeriodEnd: false
        }
      };

      mockUseAuth.mockReturnValue({
        user: null,
        userProfile: premiumUserProfile,
        loading: false,
        signUp: jest.fn(),
        signIn: jest.fn(),
        signInWithGoogle: jest.fn(),
        signInWithGithub: jest.fn(),
        signInWithApple: jest.fn(),
        logout: jest.fn(),
        resetPassword: jest.fn(),
        updateLanguage: jest.fn(),
        refreshUserProfile: jest.fn(),
      });
    });

    it('should show premium content for premium users', () => {
      render(
        <PremiumGate>
          <div>Premium Content</div>
        </PremiumGate>
      );

      expect(screen.getByText('Premium Content')).toBeInTheDocument();
      expect(screen.queryByText('Upgrade to Premium')).not.toBeInTheDocument();
    });

    it('should not show upgrade prompt for premium users', () => {
      render(
        <PremiumGate>
          <div>Premium Content</div>
        </PremiumGate>
      );

      expect(screen.queryByText('Premium Content')).toBeInTheDocument();
      expect(screen.queryByText('Unlock advanced case studies')).not.toBeInTheDocument();
    });
  });

  describe('No User Profile', () => {
    beforeEach(() => {
      mockUseAuth.mockReturnValue({
        user: null,
        userProfile: null,
        loading: false,
        signUp: jest.fn(),
        signIn: jest.fn(),
        signInWithGoogle: jest.fn(),
        signInWithGithub: jest.fn(),
        signInWithApple: jest.fn(),
        logout: jest.fn(),
        resetPassword: jest.fn(),
        updateLanguage: jest.fn(),
        refreshUserProfile: jest.fn(),
      });
    });

    it('should default to free tier when no user profile', () => {
      render(
        <PremiumGate>
          <div>Premium Content</div>
        </PremiumGate>
      );

      expect(screen.getByText('Upgrade to Premium')).toBeInTheDocument();
      // The upgrade prompt will still show "Premium Content" as the title
      expect(screen.getByText('Premium Content')).toBeInTheDocument();
    });
  });
});

describe('useHasPremiumAccess', () => {
  it('should return true for premium users', () => {
    const premiumUserProfile = {
      ...mockUserProfile,
      subscription: {
        tier: 'premium' as const,
        subscriptionStatus: 'active' as const
      }
    };

    mockUseAuth.mockReturnValue({
      user: null,
      userProfile: premiumUserProfile,
      loading: false,
      signUp: jest.fn(),
      signIn: jest.fn(),
      signInWithGoogle: jest.fn(),
      signInWithGithub: jest.fn(),
      signInWithApple: jest.fn(),
      logout: jest.fn(),
      resetPassword: jest.fn(),
      updateLanguage: jest.fn(),
      refreshUserProfile: jest.fn(),
    });

    const TestComponent = () => {
      const hasPremium = useHasPremiumAccess();
      return <div>{hasPremium ? 'Has Premium' : 'No Premium'}</div>;
    };

    render(<TestComponent />);
    expect(screen.getByText('Has Premium')).toBeInTheDocument();
  });

  it('should return false for free users', () => {
    mockUseAuth.mockReturnValue({
      user: null,
      userProfile: mockUserProfile,
      loading: false,
      signUp: jest.fn(),
      signIn: jest.fn(),
      signInWithGoogle: jest.fn(),
      signInWithGithub: jest.fn(),
      signInWithApple: jest.fn(),
      logout: jest.fn(),
      resetPassword: jest.fn(),
      updateLanguage: jest.fn(),
      refreshUserProfile: jest.fn(),
    });

    const TestComponent = () => {
      const hasPremium = useHasPremiumAccess();
      return <div>{hasPremium ? 'Has Premium' : 'No Premium'}</div>;
    };

    render(<TestComponent />);
    expect(screen.getByText('No Premium')).toBeInTheDocument();
  });
});

describe('useUserTier', () => {
  it('should return premium tier for premium users', () => {
    const premiumUserProfile = {
      ...mockUserProfile,
      subscription: {
        tier: 'premium' as const,
        subscriptionStatus: 'active' as const
      }
    };

    mockUseAuth.mockReturnValue({
      user: null,
      userProfile: premiumUserProfile,
      loading: false,
      signUp: jest.fn(),
      signIn: jest.fn(),
      signInWithGoogle: jest.fn(),
      signInWithGithub: jest.fn(),
      signInWithApple: jest.fn(),
      logout: jest.fn(),
      resetPassword: jest.fn(),
      updateLanguage: jest.fn(),
      refreshUserProfile: jest.fn(),
    });

    const TestComponent = () => {
      const tier = useUserTier();
      return <div>Tier: {tier}</div>;
    };

    render(<TestComponent />);
    expect(screen.getByText('Tier: premium')).toBeInTheDocument();
  });

  it('should return free tier for free users', () => {
    mockUseAuth.mockReturnValue({
      user: null,
      userProfile: mockUserProfile,
      loading: false,
      signUp: jest.fn(),
      signIn: jest.fn(),
      signInWithGoogle: jest.fn(),
      signInWithGithub: jest.fn(),
      signInWithApple: jest.fn(),
      logout: jest.fn(),
      resetPassword: jest.fn(),
      updateLanguage: jest.fn(),
      refreshUserProfile: jest.fn(),
    });

    const TestComponent = () => {
      const tier = useUserTier();
      return <div>Tier: {tier}</div>;
    };

    render(<TestComponent />);
    expect(screen.getByText('Tier: free')).toBeInTheDocument();
  });

  it('should default to free tier when no user profile', () => {
    mockUseAuth.mockReturnValue({
      user: null,
      userProfile: null,
      loading: false,
      signUp: jest.fn(),
      signIn: jest.fn(),
      signInWithGoogle: jest.fn(),
      signInWithGithub: jest.fn(),
      signInWithApple: jest.fn(),
      logout: jest.fn(),
      resetPassword: jest.fn(),
      updateLanguage: jest.fn(),
      refreshUserProfile: jest.fn(),
    });

    const TestComponent = () => {
      const tier = useUserTier();
      return <div>Tier: {tier}</div>;
    };

    render(<TestComponent />);
    expect(screen.getByText('Tier: free')).toBeInTheDocument();
  });
});
