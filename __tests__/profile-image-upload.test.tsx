import { ProfileImageUpload } from '@/components/profile/ProfileImageUpload';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

// Mock the UI components
jest.mock('@/components/ui/avatar', () => ({
  Avatar: ({ children, className }: any) => <div className={className}>{children}</div>,
  AvatarImage: ({ src, alt }: any) => src ? <img src={src} alt={alt} /> : null,
  AvatarFallback: ({ children }: any) => <div data-testid="avatar-fallback">{children}</div>
}));

jest.mock('@/components/ui/button', () => ({
  Button: ({ children, onClick, disabled, variant, ...props }: any) => (
    <button
      onClick={onClick}
      disabled={disabled}
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
  CardTitle: ({ children }: any) => <h2>{children}</h2>,
  CardDescription: ({ children }: any) => <p>{children}</p>
}));

jest.mock('@/components/ui/progress', () => ({
  Progress: ({ value }: any) => <div data-testid="progress" data-value={value} />
}));

// Mock Lucide icons
jest.mock('lucide-react', () => ({
  Camera: () => <div data-testid="camera-icon" />,
  Upload: () => <div data-testid="upload-icon" />,
  X: () => <div data-testid="x-icon" />
}));

// Mock FileReader
const mockFileReader = {
  readAsDataURL: jest.fn(),
  result: 'data:image/jpeg;base64,mockbase64data',
  onload: null as any
};

Object.defineProperty(global, 'FileReader', {
  writable: true,
  value: jest.fn(() => mockFileReader)
});

describe('ProfileImageUpload', () => {
  const mockOnImageUpload = jest.fn();
  const mockOnImageRemove = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    mockFileReader.onload = null;
  });

  it('renders with current image', () => {
    render(
      <ProfileImageUpload
        currentImageUrl="https://example.com/image.jpg"
        displayName="John Doe"
        onImageUpload={mockOnImageUpload}
        onImageRemove={mockOnImageRemove}
      />
    );

    expect(screen.getByText('Profile Picture')).toBeInTheDocument();
    expect(screen.getByAltText('John Doe')).toHaveAttribute('src', 'https://example.com/image.jpg');
    expect(screen.getByText('Remove Picture')).toBeInTheDocument();
  });

  it('renders with fallback initials when no image', () => {
    render(
      <ProfileImageUpload
        displayName="John Doe"
        onImageUpload={mockOnImageUpload}
      />
    );

    expect(screen.getByTestId('avatar-fallback')).toHaveTextContent('JD');
  });

  it('renders single letter initial for single name', () => {
    render(
      <ProfileImageUpload
        displayName="John"
        onImageUpload={mockOnImageUpload}
      />
    );

    expect(screen.getByTestId('avatar-fallback')).toHaveTextContent('J');
  });

  it('renders default initial when no display name', () => {
    render(
      <ProfileImageUpload
        onImageUpload={mockOnImageUpload}
      />
    );

    expect(screen.getByTestId('avatar-fallback')).toHaveTextContent('U');
  });

  it('opens file dialog when choose image button is clicked', async () => {
    const user = userEvent.setup();
    render(
      <ProfileImageUpload
        onImageUpload={mockOnImageUpload}
      />
    );

    const chooseButton = screen.getByText('Choose Image');
    await user.click(chooseButton);

    // File input should be present (even though hidden)
    const fileInput = screen.getByRole('button', { name: /choose image/i }).parentElement?.querySelector('input[type="file"]');
    expect(fileInput).toBeInTheDocument();
  });

  it('validates file type', async () => {
    render(
      <ProfileImageUpload
        onImageUpload={mockOnImageUpload}
      />
    );

    const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
    const invalidFile = new File(['content'], 'test.txt', { type: 'text/plain' });

    // Use fireEvent to trigger the change event directly
    fireEvent.change(fileInput, { target: { files: [invalidFile] } });

    await waitFor(() => {
      expect(screen.getByText('Only JPEG, PNG, and WebP images are allowed')).toBeInTheDocument();
    });
  });

  it('validates file size', async () => {
    render(
      <ProfileImageUpload
        onImageUpload={mockOnImageUpload}
      />
    );

    const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
    // Create a file larger than 5MB
    const largeFile = new File(['x'.repeat(6 * 1024 * 1024)], 'large.jpg', { type: 'image/jpeg' });

    // Use fireEvent to trigger the change event directly
    fireEvent.change(fileInput, { target: { files: [largeFile] } });

    await waitFor(() => {
      expect(screen.getByText('Image must be smaller than 5MB')).toBeInTheDocument();
    });
  });

  it('shows preview when valid file is selected', async () => {
    render(
      <ProfileImageUpload
        onImageUpload={mockOnImageUpload}
      />
    );

    const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
    const validFile = new File(['content'], 'test.jpg', { type: 'image/jpeg' });

    fireEvent.change(fileInput, { target: { files: [validFile] } });

    // Simulate FileReader onload
    if (mockFileReader.onload) {
      mockFileReader.onload({ target: { result: 'data:image/jpeg;base64,mockdata' } } as any);
    }

    await waitFor(() => {
      expect(screen.getByText('Upload Image')).toBeInTheDocument();
      expect(screen.getByText('Cancel')).toBeInTheDocument();
    });
  });

  it('uploads image when upload button is clicked', async () => {
    const user = userEvent.setup();
    mockOnImageUpload.mockResolvedValue('https://example.com/uploaded.jpg');

    render(
      <ProfileImageUpload
        onImageUpload={mockOnImageUpload}
      />
    );

    const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
    const validFile = new File(['content'], 'test.jpg', { type: 'image/jpeg' });

    fireEvent.change(fileInput, { target: { files: [validFile] } });

    // Simulate FileReader onload
    if (mockFileReader.onload) {
      mockFileReader.onload({ target: { result: 'data:image/jpeg;base64,mockdata' } } as any);
    }

    await waitFor(() => {
      expect(screen.getByText('Upload Image')).toBeInTheDocument();
    });

    const uploadButton = screen.getByText('Upload Image');
    await user.click(uploadButton);

    await waitFor(() => {
      expect(mockOnImageUpload).toHaveBeenCalledWith(validFile);
    });
  });

  it('shows upload progress during upload', async () => {
    const user = userEvent.setup();
    let resolveUpload: (value: string) => void;
    const uploadPromise = new Promise<string>((resolve) => {
      resolveUpload = resolve;
    });
    mockOnImageUpload.mockReturnValue(uploadPromise);

    render(
      <ProfileImageUpload
        onImageUpload={mockOnImageUpload}
      />
    );

    const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
    const validFile = new File(['content'], 'test.jpg', { type: 'image/jpeg' });

    fireEvent.change(fileInput, { target: { files: [validFile] } });

    // Simulate FileReader onload
    if (mockFileReader.onload) {
      mockFileReader.onload({ target: { result: 'data:image/jpeg;base64,mockdata' } } as any);
    }

    await waitFor(() => {
      expect(screen.getByText('Upload Image')).toBeInTheDocument();
    });

    const uploadButton = screen.getByText('Upload Image');
    await user.click(uploadButton);

    expect(screen.getByText('Uploading...')).toBeInTheDocument();
    expect(screen.getByTestId('progress')).toBeInTheDocument();

    resolveUpload!('https://example.com/uploaded.jpg');

    await waitFor(() => {
      expect(screen.queryByText('Uploading...')).not.toBeInTheDocument();
    });
  });

  it('handles upload errors', async () => {
    const user = userEvent.setup();
    mockOnImageUpload.mockRejectedValue(new Error('Upload failed'));

    render(
      <ProfileImageUpload
        onImageUpload={mockOnImageUpload}
      />
    );

    const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
    const validFile = new File(['content'], 'test.jpg', { type: 'image/jpeg' });

    fireEvent.change(fileInput, { target: { files: [validFile] } });

    // Simulate FileReader onload
    if (mockFileReader.onload) {
      mockFileReader.onload({ target: { result: 'data:image/jpeg;base64,mockdata' } } as any);
    }

    await waitFor(() => {
      expect(screen.getByText('Upload Image')).toBeInTheDocument();
    });

    const uploadButton = screen.getByText('Upload Image');
    await user.click(uploadButton);

    await waitFor(() => {
      expect(screen.getByText('Upload failed')).toBeInTheDocument();
    });
  });

  it('cancels preview when cancel button is clicked', async () => {
    const user = userEvent.setup();
    render(
      <ProfileImageUpload
        onImageUpload={mockOnImageUpload}
      />
    );

    const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
    const validFile = new File(['content'], 'test.jpg', { type: 'image/jpeg' });

    fireEvent.change(fileInput, { target: { files: [validFile] } });

    // Simulate FileReader onload
    if (mockFileReader.onload) {
      mockFileReader.onload({ target: { result: 'data:image/jpeg;base64,mockdata' } } as any);
    }

    await waitFor(() => {
      expect(screen.getByText('Cancel')).toBeInTheDocument();
    });

    const cancelButton = screen.getByText('Cancel');
    await user.click(cancelButton);

    expect(screen.getByText('Choose Image')).toBeInTheDocument();
    expect(screen.queryByText('Upload Image')).not.toBeInTheDocument();
  });

  it('removes current image when remove button is clicked', async () => {
    const user = userEvent.setup();
    mockOnImageRemove.mockResolvedValue(undefined);

    render(
      <ProfileImageUpload
        currentImageUrl="https://example.com/image.jpg"
        displayName="John Doe"
        onImageUpload={mockOnImageUpload}
        onImageRemove={mockOnImageRemove}
      />
    );

    const removeButton = screen.getByText('Remove Picture');
    await user.click(removeButton);

    await waitFor(() => {
      expect(mockOnImageRemove).toHaveBeenCalled();
    });
  });

  it('handles remove image errors', async () => {
    const user = userEvent.setup();
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => { });
    mockOnImageRemove.mockRejectedValue(new Error('Remove failed'));

    render(
      <ProfileImageUpload
        currentImageUrl="https://example.com/image.jpg"
        displayName="John Doe"
        onImageUpload={mockOnImageUpload}
        onImageRemove={mockOnImageRemove}
      />
    );

    const removeButton = screen.getByText('Remove Picture');
    await user.click(removeButton);

    await waitFor(() => {
      expect(screen.getByText('Failed to remove image')).toBeInTheDocument();
    });

    consoleSpy.mockRestore();
  });

  it('shows upload guidelines', () => {
    render(
      <ProfileImageUpload
        onImageUpload={mockOnImageUpload}
      />
    );

    expect(screen.getByText('• Supported formats: JPEG, PNG, WebP')).toBeInTheDocument();
    expect(screen.getByText('• Maximum file size: 5MB')).toBeInTheDocument();
    expect(screen.getByText('• Recommended: Square images work best')).toBeInTheDocument();
  });

  it('disables buttons during upload', async () => {
    const user = userEvent.setup();
    let resolveRemove: () => void;
    const removePromise = new Promise<void>((resolve) => {
      resolveRemove = resolve;
    });
    mockOnImageRemove.mockReturnValue(removePromise);

    render(
      <ProfileImageUpload
        currentImageUrl="https://example.com/image.jpg"
        onImageUpload={mockOnImageUpload}
        onImageRemove={mockOnImageRemove}
      />
    );

    const removeButton = screen.getByText('Remove Picture');
    await user.click(removeButton);

    expect(removeButton).toBeDisabled();

    resolveRemove!();
    await waitFor(() => {
      expect(removeButton).not.toBeDisabled();
    });
  });

  it('accepts valid file types', async () => {
    render(
      <ProfileImageUpload
        onImageUpload={mockOnImageUpload}
      />
    );

    const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;

    // Test JPEG
    const jpegFile = new File(['content'], 'test.jpg', { type: 'image/jpeg' });
    fireEvent.change(fileInput, { target: { files: [jpegFile] } });
    expect(screen.queryByText('Only JPEG, PNG, and WebP images are allowed')).not.toBeInTheDocument();

    // Test PNG
    const pngFile = new File(['content'], 'test.png', { type: 'image/png' });
    fireEvent.change(fileInput, { target: { files: [pngFile] } });
    expect(screen.queryByText('Only JPEG, PNG, and WebP images are allowed')).not.toBeInTheDocument();

    // Test WebP
    const webpFile = new File(['content'], 'test.webp', { type: 'image/webp' });
    fireEvent.change(fileInput, { target: { files: [webpFile] } });
    expect(screen.queryByText('Only JPEG, PNG, and WebP images are allowed')).not.toBeInTheDocument();
  });
});
