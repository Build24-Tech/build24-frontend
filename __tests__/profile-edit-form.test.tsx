import { ProfileEditForm } from '@/components/profile/ProfileEditForm';
import { UserProfileData } from '@/types/user';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

// Mock the UI components
jest.mock('@/components/ui/button', () => ({
  Button: ({ children, onClick, disabled, type, variant, ...props }: any) => (
    <button
      onClick={onClick}
      disabled={disabled}
      type={type}
      data-variant={variant}
      {...props}
    >
      {children}
    </button>
  )
}));

jest.mock('@/components/ui/card', () => ({
  Card: ({ children, className }: any) => <div className={className}>{children}</div>,
  CardContent: ({ children }: any) => <div>{children}</div>,
  CardHeader: ({ children }: any) => <div>{children}</div>,
  CardTitle: ({ children }: any) => <h2>{children}</h2>
}));

jest.mock('@/components/ui/input', () => ({
  Input: ({ onChange, value, className, ...props }: any) => (
    <input
      onChange={onChange}
      value={value}
      className={className}
      {...props}
    />
  )
}));

jest.mock('@/components/ui/textarea', () => ({
  Textarea: ({ onChange, value, className, ...props }: any) => (
    <textarea
      onChange={onChange}
      value={value}
      className={className}
      {...props}
    />
  )
}));

jest.mock('@/components/ui/label', () => ({
  Label: ({ children, htmlFor }: any) => <label htmlFor={htmlFor}>{children}</label>
}));

describe('ProfileEditForm', () => {
  const mockInitialData: UserProfileData = {
    bio: 'Test bio',
    location: 'Test City',
    website: 'https://test.com',
    work: 'Test Company',
    role: 'Test Role',
    showEmail: true,
    isPublic: true,
    followerCount: 0,
    followingCount: 0
  };

  const mockOnSave = jest.fn();
  const mockOnCancel = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders form with initial data', () => {
    render(
      <ProfileEditForm
        initialData={mockInitialData}
        onSave={mockOnSave}
        onCancel={mockOnCancel}
      />
    );

    expect(screen.getByDisplayValue('Test bio')).toBeInTheDocument();
    expect(screen.getByDisplayValue('Test City')).toBeInTheDocument();
    expect(screen.getByDisplayValue('https://test.com')).toBeInTheDocument();
    expect(screen.getByDisplayValue('Test Company')).toBeInTheDocument();
    expect(screen.getByDisplayValue('Test Role')).toBeInTheDocument();
  });

  it('updates form data when inputs change', async () => {
    const user = userEvent.setup();
    render(
      <ProfileEditForm
        initialData={mockInitialData}
        onSave={mockOnSave}
        onCancel={mockOnCancel}
      />
    );

    const bioInput = screen.getByDisplayValue('Test bio');
    await user.clear(bioInput);
    await user.type(bioInput, 'Updated bio');

    expect(screen.getByDisplayValue('Updated bio')).toBeInTheDocument();
  });

  it('validates bio length', async () => {
    const user = userEvent.setup();
    render(
      <ProfileEditForm
        initialData={mockInitialData}
        onSave={mockOnSave}
        onCancel={mockOnCancel}
      />
    );

    const bioInput = screen.getByDisplayValue('Test bio');
    const longBio = 'a'.repeat(501);

    await user.clear(bioInput);
    await user.type(bioInput, longBio);

    const submitButton = screen.getByText('Save Changes');
    await user.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText('Bio must be 500 characters or less')).toBeInTheDocument();
    });

    expect(mockOnSave).not.toHaveBeenCalled();
  });

  it('validates website URL format', async () => {
    const user = userEvent.setup();
    render(
      <ProfileEditForm
        initialData={mockInitialData}
        onSave={mockOnSave}
        onCancel={mockOnCancel}
      />
    );

    const websiteInput = screen.getByDisplayValue('https://test.com');
    await user.clear(websiteInput);
    await user.type(websiteInput, 'invalid-url');

    // Verify the input value has changed
    expect(websiteInput).toHaveValue('invalid-url');

    const submitButton = screen.getByText('Save Changes');
    await user.click(submitButton);

    // Check if onSave was called (it shouldn't be if validation fails)
    expect(mockOnSave).not.toHaveBeenCalled();

    // Check for validation error
    await waitFor(() => {
      // Debug: log all text content to see what's actually rendered
      const allText = document.body.textContent;
      console.log('All text content:', allText);

      // Try to find any error-related text
      const errorElement = screen.queryByText(/Website must be a valid URL/i);
      expect(errorElement).toBeInTheDocument();
    }, { timeout: 3000 });
  });

  it('validates field lengths', async () => {
    const user = userEvent.setup();
    render(
      <ProfileEditForm
        initialData={mockInitialData}
        onSave={mockOnSave}
        onCancel={mockOnCancel}
      />
    );

    const locationInput = screen.getByDisplayValue('Test City');
    const longLocation = 'a'.repeat(101);

    await user.clear(locationInput);
    await user.type(locationInput, longLocation);

    const submitButton = screen.getByText('Save Changes');
    await user.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText('Location must be 100 characters or less')).toBeInTheDocument();
    });

    expect(mockOnSave).not.toHaveBeenCalled();
  });

  it('shows character count for bio', () => {
    render(
      <ProfileEditForm
        initialData={mockInitialData}
        onSave={mockOnSave}
        onCancel={mockOnCancel}
      />
    );

    expect(screen.getByText('8/500')).toBeInTheDocument(); // "Test bio" is 8 characters
  });

  it('clears field errors when user starts typing', async () => {
    const user = userEvent.setup();
    render(
      <ProfileEditForm
        initialData={mockInitialData}
        onSave={mockOnSave}
        onCancel={mockOnCancel}
      />
    );

    // First, create an error
    const websiteInput = screen.getByDisplayValue('https://test.com');
    await user.clear(websiteInput);
    await user.type(websiteInput, 'invalid-url');

    const submitButton = screen.getByText('Save Changes');
    await user.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText('Website must be a valid URL starting with http:// or https://')).toBeInTheDocument();
    }, { timeout: 3000 });

    // Now fix the error
    await user.clear(websiteInput);
    await user.type(websiteInput, 'https://valid.com');

    await waitFor(() => {
      expect(screen.queryByText('Website must be a valid URL starting with http:// or https://')).not.toBeInTheDocument();
    });
  });

  it('calls onSave with form data when form is valid', async () => {
    const user = userEvent.setup();
    mockOnSave.mockResolvedValue(undefined);

    render(
      <ProfileEditForm
        initialData={mockInitialData}
        onSave={mockOnSave}
        onCancel={mockOnCancel}
      />
    );

    const bioInput = screen.getByDisplayValue('Test bio');
    await user.clear(bioInput);
    await user.type(bioInput, 'Updated bio');

    const submitButton = screen.getByText('Save Changes');
    await user.click(submitButton);

    await waitFor(() => {
      expect(mockOnSave).toHaveBeenCalledWith({
        ...mockInitialData,
        bio: 'Updated bio'
      });
    });
  });

  it('shows loading state during save', async () => {
    const user = userEvent.setup();
    let resolvePromise: () => void;
    const savePromise = new Promise<void>((resolve) => {
      resolvePromise = resolve;
    });
    mockOnSave.mockReturnValue(savePromise);

    render(
      <ProfileEditForm
        initialData={mockInitialData}
        onSave={mockOnSave}
        onCancel={mockOnCancel}
      />
    );

    const submitButton = screen.getByText('Save Changes');
    await user.click(submitButton);

    expect(screen.getByText('Saving...')).toBeInTheDocument();
    expect(submitButton).toBeDisabled();

    resolvePromise!();
    await waitFor(() => {
      expect(screen.getByText('Save Changes')).toBeInTheDocument();
    });
  });

  it('handles save errors', async () => {
    const user = userEvent.setup();
    mockOnSave.mockRejectedValue(new Error('Save failed'));

    render(
      <ProfileEditForm
        initialData={mockInitialData}
        onSave={mockOnSave}
        onCancel={mockOnCancel}
      />
    );

    const submitButton = screen.getByText('Save Changes');
    await user.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText('Failed to save profile. Please try again.')).toBeInTheDocument();
    });
  });

  it('calls onCancel when cancel button is clicked', async () => {
    const user = userEvent.setup();
    render(
      <ProfileEditForm
        initialData={mockInitialData}
        onSave={mockOnSave}
        onCancel={mockOnCancel}
      />
    );

    const cancelButton = screen.getByText('Cancel');
    await user.click(cancelButton);

    expect(mockOnCancel).toHaveBeenCalled();
  });

  it('accepts empty optional fields', async () => {
    const user = userEvent.setup();
    mockOnSave.mockResolvedValue(undefined);

    const emptyData: UserProfileData = {
      showEmail: false,
      isPublic: false,
      followerCount: 0,
      followingCount: 0
    };

    render(
      <ProfileEditForm
        initialData={emptyData}
        onSave={mockOnSave}
        onCancel={mockOnCancel}
      />
    );

    const submitButton = screen.getByText('Save Changes');
    await user.click(submitButton);

    await waitFor(() => {
      expect(mockOnSave).toHaveBeenCalledWith(emptyData);
    });
  });

  it('accepts valid website URLs', async () => {
    const user = userEvent.setup();
    mockOnSave.mockResolvedValue(undefined);

    render(
      <ProfileEditForm
        initialData={mockInitialData}
        onSave={mockOnSave}
        onCancel={mockOnCancel}
      />
    );

    const websiteInput = screen.getByDisplayValue('https://test.com');
    await user.clear(websiteInput);
    await user.type(websiteInput, 'http://example.com');

    const submitButton = screen.getByText('Save Changes');
    await user.click(submitButton);

    await waitFor(() => {
      expect(mockOnSave).toHaveBeenCalledWith({
        ...mockInitialData,
        website: 'http://example.com'
      });
    });
  });
});
