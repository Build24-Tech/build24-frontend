import { AuthorCard } from '@/components/profile/AuthorCard';
import { render, screen } from '@testing-library/react';

// Mock Next.js Link component
jest.mock('next/link', () => {
  return function MockLink({ children, href }: { children: React.ReactNode; href: string }) {
    return <a href={href}>{children}</a>;
  };
});

describe('AuthorCard', () => {
  const mockProps = {
    authorId: 'user123',
    authorName: 'John Doe',
    authorPhotoURL: 'https://example.com/photo.jpg',
    bio: 'Full-stack developer passionate about building great products',
    location: 'San Francisco, CA',
    work: 'Tech Corp',
    role: 'Senior Developer',
    website: 'https://johndoe.com',
    followerCount: 150,
    followingCount: 75
  };

  it('renders all author information', () => {
    render(<AuthorCard {...mockProps} />);

    expect(screen.getByText('John Doe')).toBeInTheDocument();
    expect(screen.getByText('Senior Developer')).toBeInTheDocument();
    expect(screen.getByText('Full-stack developer passionate about building great products')).toBeInTheDocument();
    expect(screen.getByText('Tech Corp')).toBeInTheDocument();
    expect(screen.getByText('San Francisco, CA')).toBeInTheDocument();
    expect(screen.getByText('johndoe.com')).toBeInTheDocument();
    expect(screen.getByText('150 followers')).toBeInTheDocument();
    expect(screen.getByText('75 following')).toBeInTheDocument();
  });

  it('renders as a clickable link when authorId is provided', () => {
    render(<AuthorCard {...mockProps} />);

    const link = screen.getByRole('link');
    expect(link).toHaveAttribute('href', '/profile/user123');
  });

  it('renders without link when authorId is not provided', () => {
    render(<AuthorCard authorName="Jane Doe" bio="Designer" />);

    expect(screen.getByText('Jane Doe')).toBeInTheDocument();
    expect(screen.queryByRole('link')).not.toBeInTheDocument();
  });

  it('does not render when no author information is provided', () => {
    const { container } = render(<AuthorCard />);
    expect(container.firstChild).toBeNull();
  });

  it('displays fallback initials when no photo is provided', () => {
    render(<AuthorCard authorName="John Doe" />);

    expect(screen.getByText('JD')).toBeInTheDocument();
  });

  it('renders in compact mode', () => {
    render(<AuthorCard {...mockProps} compact />);

    expect(screen.getByText('John Doe')).toBeInTheDocument();
    expect(screen.getByText('Senior Developer')).toBeInTheDocument();
    // Bio should not be shown in compact mode
    expect(screen.queryByText('Full-stack developer passionate about building great products')).not.toBeInTheDocument();
    // Follower counts should not be shown in compact mode
    expect(screen.queryByText('150 followers')).not.toBeInTheDocument();
  });

  it('handles missing optional fields gracefully', () => {
    render(<AuthorCard authorName="Jane Doe" />);

    expect(screen.getByText('Jane Doe')).toBeInTheDocument();
    expect(screen.queryByText('followers')).not.toBeInTheDocument();
    expect(screen.queryByRole('img', { name: /briefcase/i })).not.toBeInTheDocument();
  });

  it('strips protocol from website URL display', () => {
    render(<AuthorCard authorName="John Doe" website="https://example.com" />);

    expect(screen.getByText('example.com')).toBeInTheDocument();
  });

  it('handles website URL without protocol', () => {
    render(<AuthorCard authorName="John Doe" website="example.com" />);

    expect(screen.getByText('example.com')).toBeInTheDocument();
  });

  it('applies custom className', () => {
    render(<AuthorCard authorName="John Doe" className="custom-class" />);

    const card = screen.getByText('John Doe').closest('.custom-class');
    expect(card).toBeInTheDocument();
  });

  it('shows only follower count when following count is not provided', () => {
    render(<AuthorCard authorName="John Doe" followerCount={100} />);

    expect(screen.getByText('100 followers')).toBeInTheDocument();
    expect(screen.queryByText('following')).not.toBeInTheDocument();
  });

  it('shows only following count when follower count is not provided', () => {
    render(<AuthorCard authorName="John Doe" followingCount={50} />);

    expect(screen.getByText('50 following')).toBeInTheDocument();
    expect(screen.queryByText('followers')).not.toBeInTheDocument();
  });

  it('handles zero follower/following counts', () => {
    render(<AuthorCard authorName="John Doe" followerCount={0} followingCount={0} />);

    expect(screen.getByText('0 followers')).toBeInTheDocument();
    expect(screen.getByText('0 following')).toBeInTheDocument();
  });

  it('truncates long text appropriately', () => {
    const longBio = 'This is a very long bio that should be truncated when it exceeds the maximum number of lines allowed in the component display area';
    render(<AuthorCard authorName="John Doe" bio={longBio} />);

    expect(screen.getByText(longBio)).toBeInTheDocument();
    // The component should have line-clamp-2 class for truncation
    const bioElement = screen.getByText(longBio);
    expect(bioElement).toHaveClass('line-clamp-2');
  });

  it('displays "Anonymous" when no authorName is provided but authorId exists', () => {
    render(<AuthorCard authorId="user123" />);

    expect(screen.getByText('Anonymous')).toBeInTheDocument();
  });
});
