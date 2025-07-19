// Notion API integration for blog content
// This would be replaced with actual Notion API calls

export interface NotionPage {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  publishedAt: string;
  tags: string[];
  hour?: number;
  status: 'completed' | 'in-progress' | 'planned';
  readTime: string;
}

export interface NotionProject {
  id: string;
  title: string;
  description: string;
  tech: string[];
  duration: string;
  status: 'completed' | 'in-progress' | 'planned';
  demoUrl?: string;
  githubUrl?: string;
  hour: number;
}

// Mock functions - replace with actual Notion API calls
export async function getPublishedPosts(): Promise<NotionPage[]> {
  // This would make actual calls to Notion API
  return [
    {
      id: 'hour-1-task-manager',
      title: 'Hour 1: Building an AI-Powered Task Manager',
      slug: 'hour-1-task-manager',
      excerpt: 'Starting the Build24 challenge with a smart task management app that uses AI to categorize and prioritize tasks automatically.',
      content: '<p>Full blog content here...</p>',
      publishedAt: '2024-01-15',
      readTime: '5 min read',
      tags: ['AI', 'Next.js', 'OpenAI'],
      hour: 1,
      status: 'completed'
    }
  ];
}

export async function getPostBySlug(slug: string): Promise<NotionPage | null> {
  const posts = await getPublishedPosts();
  return posts.find(post => post.slug === slug) || null;
}

export async function getAllProjects(): Promise<NotionProject[]> {
  // This would make actual calls to Notion API
  return [
    {
      id: '1',
      title: 'AI-Powered Task Manager',
      description: 'Smart task management app with AI categorization and priority scoring.',
      tech: ['Next.js', 'OpenAI', 'Tailwind'],
      duration: '1 hour',
      status: 'completed',
      hour: 1,
      demoUrl: '#',
      githubUrl: '#'
    }
  ];
}

// Utility functions for Notion content processing
export function processNotionContent(blocks: any[]): string {
  // Process Notion blocks and convert to HTML
  // This would include proper handling of rich text, images, code blocks, etc.
  return blocks.map(block => {
    switch (block.type) {
      case 'paragraph':
        return `<p>${block.paragraph.rich_text.map((text: any) => text.plain_text).join('')}</p>`;
      case 'heading_2':
        return `<h2>${block.heading_2.rich_text.map((text: any) => text.plain_text).join('')}</h2>`;
      case 'code':
        return `<pre><code>${block.code.rich_text.map((text: any) => text.plain_text).join('')}</code></pre>`;
      default:
        return '';
    }
  }).join('');
}

export function calculateReadTime(content: string): string {
  const wordsPerMinute = 200;
  const words = content.split(/\s+/).length;
  const minutes = Math.ceil(words / wordsPerMinute);
  return `${minutes} min read`;
}