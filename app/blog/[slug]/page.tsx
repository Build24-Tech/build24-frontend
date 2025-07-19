import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import Header from '@/components/Header';
import Link from 'next/link';
import { Calendar, Clock, ArrowLeft, ExternalLink, Github } from 'lucide-react';
import { notFound } from 'next/navigation';

export async function generateStaticParams() {
  // For static export, we need to define all possible slug values
  // This would typically fetch from your Notion database
  // For now, returning the mock data slugs
  return [
    { slug: 'hour-1-task-manager' },
    // Add more slugs as you create more blog posts
  ];
}

// This would be replaced with actual Notion API calls
async function getBlogPost(slug: string) {
  // Mock data - replace with Notion API
  const posts: Record<string, any> = {
    'hour-1-task-manager': {
      id: 'hour-1-task-manager',
      title: 'Hour 1: Building an AI-Powered Task Manager',
      content: `
        <h2>The Challenge</h2>
        <p>For the first hour of Build24, I decided to tackle something ambitious: an AI-powered task manager that automatically categorizes and prioritizes tasks using OpenAI's GPT model.</p>
        
        <h2>What I Built</h2>
        <p>The task manager includes:</p>
        <ul>
          <li>AI-powered task categorization</li>
          <li>Automatic priority scoring</li>
          <li>Clean, intuitive interface</li>
          <li>Real-time updates</li>
        </ul>
        
        <h2>Technical Stack</h2>
        <p>I chose Next.js for the frontend, integrated with OpenAI's API for the AI features, and used Tailwind CSS for rapid styling.</p>
        
        <h2>Key Learnings</h2>
        <p>The biggest challenge was designing the AI prompts to consistently categorize tasks. I learned that being specific about the output format is crucial for reliable results.</p>
        
        <h2>Results</h2>
        <p>Successfully completed a working prototype in exactly 60 minutes. The AI categorization works surprisingly well, and the interface is clean and functional.</p>
      `,
      publishedAt: '2024-01-15',
      readTime: '5 min read',
      tags: ['AI', 'Next.js', 'OpenAI'],
      hour: 1,
      status: 'completed',
      demoUrl: '#',
      githubUrl: '#'
    }
  };

  return posts[slug] || null;
}

export default async function BlogPost({ params }: { params: { slug: string } }) {
  const post = await getBlogPost(params.slug);

  if (!post) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-black text-white">
      <Header />
      
      <article className="container mx-auto px-4 py-12">
        {/* Back to Blog */}
        <div className="mb-8">
          <Button asChild variant="ghost" className="text-gray-400 hover:text-white p-0">
            <Link href="/blog" className="flex items-center gap-2">
              <ArrowLeft className="w-4 h-4" />
              Back to Blog
            </Link>
          </Button>
        </div>

        {/* Article Header */}
        <header className="mb-12">
          <div className="flex items-center gap-4 mb-6">
            <Badge className="bg-yellow-400/10 text-yellow-400 border-yellow-400/20">
              Hour {post.hour}
            </Badge>
            <Badge 
              className={
                post.status === 'completed' 
                  ? 'bg-green-500/10 text-green-400 border-green-500/20'
                  : 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20'
              }
            >
              {post.status}
            </Badge>
          </div>
          
          <h1 className="text-4xl sm:text-5xl font-bold mb-6 leading-tight">
            {post.title}
          </h1>
          
          <div className="flex flex-wrap items-center gap-6 text-gray-400 mb-6">
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              {new Date(post.publishedAt).toLocaleDateString()}
            </div>
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4" />
              {post.readTime}
            </div>
          </div>
          
          <div className="flex flex-wrap gap-2 mb-8">
            {post.tags.map((tag: string, index: number) => (
              <Badge 
                key={index} 
                variant="outline" 
                className="border-gray-600 text-gray-300"
              >
                {tag}
              </Badge>
            ))}
          </div>

          {/* Project Links */}
          <div className="flex gap-4">
            <Button asChild className="bg-yellow-400 text-black hover:bg-yellow-500">
              <Link href={post.demoUrl} className="flex items-center gap-2">
                <ExternalLink className="w-4 h-4" />
                View Demo
              </Link>
            </Button>
            <Button asChild variant="outline" className="border-gray-600 text-white hover:bg-gray-800">
              <Link href={post.githubUrl} className="flex items-center gap-2">
                <Github className="w-4 h-4" />
                Source Code
              </Link>
            </Button>
          </div>
        </header>

        {/* Article Content */}
        <div 
          className="prose prose-invert prose-lg max-w-none"
          dangerouslySetInnerHTML={{ __html: post.content }}
        />

        {/* Navigation */}
        <div className="flex justify-between items-center pt-12 mt-12 border-t border-gray-800">
          <Button asChild variant="outline" className="border-gray-600 text-white hover:bg-gray-800">
            <Link href="/blog">← Previous Post</Link>
          </Button>
          <Button asChild variant="outline" className="border-gray-600 text-white hover:bg-gray-800">
            <Link href="/blog">Next Post →</Link>
          </Button>
        </div>
      </article>
    </div>
  );
}