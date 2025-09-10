import { AuthorBadge } from '@/components/profile/AuthorBadge';
import { render, screen } from '@testing-library/react';

// Mock Next.js Link component
jest.mock('next/link', () => {
  return function MockLink({ children, href }: { children: React.ReactNode; href: string }) {
    return <a href={href}>{children}</a>;
  };
});

describe('AuthorBadge', () => {
  const mockProps = {
    authorId: 'user123',
    authorName: 'John Doe',
    authorPhotoURL: 'https://example.com/photo.jpg',
    role: 'Senior Developer'
  };

  it('renders author name and avatar', () => {
    render(<AuthorBadge {...mockProps} />);

    expect(screen.getByText('John Doe')).toBeInTheDocument();
    // Avatar should be present (either img or fallback)
    expect(screen.getByText('JD')).toBeInTheDocument();
  });

  it('renders as a link when authorId is provided', () => {
    render(<AuthorBadge {...mockProps} />);

    const link = screen.getByRole('link');
    expect(link).toHaveAttribute('href', '/profile/user123');
  });

  it('renders without link when authorId is not provided', () => {
    render(<AuthorBadge authorName="Jane Doe" />);

    expect(screen.getByText('Jane Doe')).toBeInTheDocument();
    expect(screen.queryByRole('link')).not.toBeInTheDocument();
  });

  it('does not render when no author information is provided', () => {
    const { container } = render(<AuthorBadge />);
    expect(container.firstChild).toBeNull();
  });

  it('displays fallback initials when no photo is provided', () => {
    render(<AuthorBadge authorName="John Doe" />);

    expect(screen.getByText('JD')).toBeInTheDocument();
  });

  it('shows role when showRole is true', () => {
    render(<AuthorBadge {...mockProps} showRole />);

    expect(screen.getByText('John Doe')).toBeInTheDocument();
    expect(screen.getByText('Senior Developer')).toBeInTheDocument();
    expect(screen.getByText('•')).toBeInTheDocument();
  });

  it('hides role when showRole is false', () => {
    render(<AuthorBadge {...mockProps} showRole={false} />);

    expect(screen.getByText('John Doe')).toBeInTheDocument();
    expect(screen.queryByText('Senior Developer')).not.toBeInTheDocument();
    expect(screen.queryByText('•')).not.toBeInTheDocument();
  });

  it('does not show role separator when role is not provided', () => {
    render(<AuthorBadge authorName="John Doe" showRole />);

    expect(screen.getByText('John Doe')).toBeInTheDocument();
    expect(screen.queryByText('•')).not.toBeInTheDocument();
  });

  it('applies correct size classes for small size', () => {
    render(<AuthorBadge {...mockProps} size="sm" />);

    const avatar = screen.getByText('JD').closest('.h-5');
    expect(avatar).toBeInTheDocument();
  });

  it('applies correct size classes for medium size', () => {
    render(<AuthorBadge {...mockProps} size="md" />);

    const avatar = screen.getByText('JD').closest('.h-6');
    expect(avatar).toBeInTheDocument();
  });

  it('applies different badge variants', () => {
    const { rerender } = render(<AuthorBadge {...mockProps} variant="default" />);
    expect(screen.getByText('John Doe')).toBeInTheDocument();

    rerender(<AuthorBadge {...mockProps} variant="secondary" />);
    expect(screen.getByText('John Doe')).toBeInTheDocument();

    rerender(<AuthorBadge {...mockProps} variant="outline" />);
    expect(screen.getByText('John Doe')).toBeInTheDocument();
  });

  it('applies custom className', () => {
    render(<AuthorBadge {...mockProps} className="custom-class" />);

    const badge = screen.getByText('John Doe').closest('.custom-class');
    expect(badge).toBeInTheDocument();
  });

  it('handles single name for initials', () => {
    render(<AuthorBadge authorName="Madonna" />);

    expect(screen.getByText('M')).toBeInTheDocument();
  });

  it('limits initials to 2 characters', () => {
    render(<AuthorBadge authorName="John Michael Doe Smith" />);

    expect(screen.getByText('JM')).toBeInTheDocument();
  });

  it('displays "Anonymous" when no authorName is provided but authorId exists', () => {
    render(<AuthorBadge authorId="user123" />);

    expect(screen.getByText('Anonymous')).toBeInTheDocument();
  });

  it('handles empty authorName gracefully', () => {
    render(<AuthorBadge authorId="user123" authorName="" />);

    expect(screen.getByText('Anonymous')).toBeInTheDocument();
  });

  it('truncates long names appropriately', () => {
    const longName = 'This Is A Very Long Name That Should Be Truncated';
    render(<AuthorBadge authorName={longName} />);

    expect(screen.getByText(longName)).toBeInTheDocument();
    // The component should have truncate class
    const nameElement = screen.getByText(longName);
    expect(nameElement).toHaveClass('truncate');
  });

  it('truncates long roles appropriately when shown', () => {
    const longRole = 'Senior Full Stack Software Development Engineer';
    render(<AuthorBadge authorName="John Doe" role={longRole} showRole />);

    expect(screen.getByText(longRole)).toBeInTheDocument();
    // The role element should have truncate class
    const roleElement = screen.getByText(longRole);
    expect(roleElement).toHaveClass('truncate');
  });
});
