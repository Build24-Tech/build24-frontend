import { AuthorProfileLink } from '@/components/profile/AuthorProfileLink';
import { render, screen } from '@testing-library/react';

// Mock Next.js Link component
jest.mock('next/link', () => {
  return function MockLink({ children, href }: { children: React.ReactNode; href: string }) {
    return <a href={href}>{children}</a>;
  };
});

describe('AuthorProfileLink', () => {
  const mockProps = {
    authorId: 'user123',
    authorName: 'John Doe',
    authorPhotoURL: 'https://example.com/photo.jpg'
  };

  it('renders author name and avatar by default', () => {
    render(<AuthorProfileLink {...mockProps} />);

    expect(screen.getByText('John Doe')).toBeInTheDocument();
    // Avatar should be present (either img or fallback)
    expect(screen.getByText('JD')).toBeInTheDocument();
  });

  it('renders as a link when authorId is provided', () => {
    render(<AuthorProfileLink {...mockProps} />);

    const link = screen.getByRole('link');
    expect(link).toHaveAttribute('href', '/profile/user123');
  });

  it('renders without link when authorId is not provided', () => {
    render(<AuthorProfileLink authorName="Jane Doe" />);

    expect(screen.getByText('Jane Doe')).toBeInTheDocument();
    expect(screen.queryByRole('link')).not.toBeInTheDocument();
  });

  it('does not render when no author information is provided', () => {
    const { container } = render(<AuthorProfileLink />);
    expect(container.firstChild).toBeNull();
  });

  it('displays fallback initials when no photo is provided', () => {
    render(<AuthorProfileLink authorId="user123" authorName="John Doe" />);

    expect(screen.getByText('JD')).toBeInTheDocument();
  });

  it('handles single name for initials', () => {
    render(<AuthorProfileLink authorName="Madonna" />);

    expect(screen.getByText('M')).toBeInTheDocument();
  });

  it('limits initials to 2 characters', () => {
    render(<AuthorProfileLink authorName="John Michael Doe Smith" />);

    expect(screen.getByText('JM')).toBeInTheDocument();
  });

  it('renders without avatar when showAvatar is false', () => {
    render(<AuthorProfileLink {...mockProps} showAvatar={false} />);

    expect(screen.getByText('John Doe')).toBeInTheDocument();
    expect(screen.queryByRole('img')).not.toBeInTheDocument();
  });

  it('applies correct size classes for small size', () => {
    render(<AuthorProfileLink {...mockProps} size="sm" />);

    const avatar = screen.getByText('JD').closest('.h-6');
    expect(avatar).toBeInTheDocument();
  });

  it('applies correct size classes for large size', () => {
    render(<AuthorProfileLink {...mockProps} size="lg" />);

    const avatar = screen.getByText('JD').closest('.h-10');
    expect(avatar).toBeInTheDocument();
  });

  it('applies custom className', () => {
    render(<AuthorProfileLink {...mockProps} className="custom-class" />);

    const container = screen.getByText('John Doe').closest('.custom-class');
    expect(container).toBeInTheDocument();
  });

  it('displays "Anonymous" when no authorName is provided but authorId exists', () => {
    render(<AuthorProfileLink authorId="user123" />);

    expect(screen.getByText('Anonymous')).toBeInTheDocument();
  });

  it('handles empty authorName gracefully', () => {
    render(<AuthorProfileLink authorId="user123" authorName="" />);

    expect(screen.getByText('Anonymous')).toBeInTheDocument();
  });
});
