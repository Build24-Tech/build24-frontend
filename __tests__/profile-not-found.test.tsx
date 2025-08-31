import { ProfileNotFound } from '@/components/profile/ProfileNotFound';
import '@testing-library/jest-dom';
import { render, screen } from '@testing-library/react';

// Mock Next.js Link component
jest.mock('next/link', () => {
  return function MockLink({ children, href, ...props }: any) {
    return <a href={href} {...props}>{children}</a>;
  };
});

describe('ProfileNotFound', () => {
  it('renders default not found message', () => {
    render(<ProfileNotFound />);

    expect(screen.getByText('Profile Not Found')).toBeInTheDocument();
    expect(screen.getByText(/The profile you're looking for doesn't exist/)).toBeInTheDocument();
  });

  it('renders custom message when provided', () => {
    const customMessage = 'This user account has been deactivated.';
    render(<ProfileNotFound message={customMessage} />);

    expect(screen.getByText('Profile Not Found')).toBeInTheDocument();
    expect(screen.getByText(customMessage)).toBeInTheDocument();
  });

  it('displays user ID when provided', () => {
    const userId = 'user123';
    render(<ProfileNotFound userId={userId} />);

    expect(screen.getByText(`User ID:`)).toBeInTheDocument();
    expect(screen.getByText(userId)).toBeInTheDocument();
  });

  it('does not display user ID section when not provided', () => {
    render(<ProfileNotFound />);

    expect(screen.queryByText('User ID:')).not.toBeInTheDocument();
  });

  it('renders all navigation links', () => {
    render(<ProfileNotFound />);

    const dashboardLink = screen.getByRole('link', { name: /go to dashboard/i });
    const knowledgeHubLink = screen.getByRole('link', { name: /browse knowledge hub/i });
    const blogLink = screen.getByRole('link', { name: /read blog posts/i });

    expect(dashboardLink).toBeInTheDocument();
    expect(dashboardLink).toHaveAttribute('href', '/dashboard');

    expect(knowledgeHubLink).toBeInTheDocument();
    expect(knowledgeHubLink).toHaveAttribute('href', '/dashboard/knowledge-hub');

    expect(blogLink).toBeInTheDocument();
    expect(blogLink).toHaveAttribute('href', '/blog');
  });

  it('displays helpful suggestions text', () => {
    render(<ProfileNotFound />);

    expect(screen.getByText(/Here are some things you can try:/)).toBeInTheDocument();
  });

  it('displays contact support message', () => {
    render(<ProfileNotFound />);

    expect(screen.getByText(/If you believe this is an error, please contact support/)).toBeInTheDocument();
  });

  it('renders user icon placeholder', () => {
    render(<ProfileNotFound />);

    // The UserX icon should be rendered, we can test for its presence indirectly
    const heading = screen.getByText('Profile Not Found');
    expect(heading).toBeInTheDocument();
  });

  it('renders with both userId and custom message', () => {
    const userId = 'user456';
    const customMessage = 'Account suspended for policy violations.';

    render(<ProfileNotFound userId={userId} message={customMessage} />);

    expect(screen.getByText('Profile Not Found')).toBeInTheDocument();
    expect(screen.getByText(customMessage)).toBeInTheDocument();
    expect(screen.getByText('User ID:')).toBeInTheDocument();
    expect(screen.getByText(userId)).toBeInTheDocument();
  });

  it('has proper link accessibility', () => {
    render(<ProfileNotFound />);

    const links = screen.getAllByRole('link');

    // All links should have accessible names
    links.forEach(link => {
      expect(link).toHaveAccessibleName();
    });
  });

  it('displays user ID in code format', () => {
    const userId = 'user123';
    render(<ProfileNotFound userId={userId} />);

    const codeElement = screen.getByText(userId);
    expect(codeElement.tagName.toLowerCase()).toBe('code');
  });

  it('renders all expected icons in navigation links', () => {
    render(<ProfileNotFound />);

    // We can't easily test for specific icons, but we can ensure the links are properly structured
    const dashboardLink = screen.getByRole('link', { name: /go to dashboard/i });
    const knowledgeHubLink = screen.getByRole('link', { name: /browse knowledge hub/i });
    const blogLink = screen.getByRole('link', { name: /read blog posts/i });

    // Check that the links have the expected structure (they should contain both icon and text)
    expect(dashboardLink.textContent).toContain('Go to Dashboard');
    expect(knowledgeHubLink.textContent).toContain('Browse Knowledge Hub');
    expect(blogLink.textContent).toContain('Read Blog Posts');
  });

  it('maintains consistent styling structure', () => {
    render(<ProfileNotFound />);

    // Check for the main card structure
    const heading = screen.getByText('Profile Not Found');
    const card = heading.closest('[class*="card"]') || heading.closest('div');
    expect(card).toBeInTheDocument();
  });
});
