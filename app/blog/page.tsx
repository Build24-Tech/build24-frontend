import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import Header from '@/components/Header';
import Link from 'next/link';
import { Calendar, Clock, ArrowRight } from 'lucide-react';

export default function BlogPage() {
  // This would be replaced with actual Notion data
  const blogPosts = [
    {
      id: 'hour-1-task-manager',
      title: 'Hour 1: Building an AI-Powered Task Manager',
      excerpt: 'Starting the Build24 challenge with a smart task management app that uses AI to categorize and prioritize tasks automatically.',
      publishedAt: '2024-01-15',
      readTime: '5 min read',
      tags: ['AI', 'Next.js', 'OpenAI'],
      hour: 1,
      status: 'completed'
    },
    {
      id: 'hour-2-chat-app',
      title: 'Hour 2: Real-time Chat Application',
      excerpt: 'Building a full-featured chat app with WebSocket connections, user presence, and message history in just 60 minutes.',
      publishedAt: '2024-01-15',
      readTime: '4 min read',
      tags: ['React', 'Socket.io', 'Real-time'],
      hour: 2,
      status: 'completed'
    },
    {
      id: 'hour-3-weather-dashboard',
      title: 'Hour 3: Weather Dashboard with Maps',
      excerpt: 'Creating a beautiful weather application with location-based forecasts and interactive maps.',
      publishedAt: '2024-01-15',
      readTime: '6 min read',
      tags: ['Vue.js', 'API', 'Maps'],
      hour: 3,
      status: 'in-progress'
    }
  ];

  return (
    <div className="min-h-screen bg-black text-white">
      <Header />
      
      <div className="container mx-auto px-4 py-12">
        {/* Header */}
        <div className="text-center mb-16">
          <h1 className="text-4xl sm:text-5xl font-bold mb-4">
            The Build24 <span className="text-yellow-400">Journey</span>
          </h1>
          <p className="text-xl text-gray-400 max-w-2xl mx-auto">
            Follow along as I build 24 unique projects in 24 hours. Each post documents 
            the process, challenges, and learnings from every hour.
          </p>
        </div>

        {/* Blog Posts Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {blogPosts.map((post) => (
            <Card key={post.id} className="bg-gray-900 border-gray-700 hover:border-gray-600 transition-all duration-300 group">
              <CardHeader>
                <div className="flex items-start justify-between mb-2">
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
                <CardTitle className="text-white group-hover:text-yellow-400 transition-colors line-clamp-2">
                  {post.title}
                </CardTitle>
                <CardDescription className="text-gray-400 line-clamp-3">
                  {post.excerpt}
                </CardDescription>
              </CardHeader>
              
              <CardContent>
                <div className="flex items-center gap-4 text-sm text-gray-500 mb-4">
                  <div className="flex items-center gap-1">
                    <Calendar className="w-4 h-4" />
                    {new Date(post.publishedAt).toLocaleDateString()}
                  </div>
                  <div className="flex items-center gap-1">
                    <Clock className="w-4 h-4" />
                    {post.readTime}
                  </div>
                </div>
                
                <div className="flex flex-wrap gap-2 mb-4">
                  {post.tags.map((tag, index) => (
                    <Badge 
                      key={index} 
                      variant="outline" 
                      className="border-gray-600 text-gray-300 text-xs"
                    >
                      {tag}
                    </Badge>
                  ))}
                </div>
                
                <Button asChild variant="ghost" className="text-yellow-400 hover:text-yellow-300 p-0 h-auto">
                  <Link href={`/blog/${post.id}`} className="flex items-center gap-2">
                    Read More <ArrowRight className="w-4 h-4" />
                  </Link>
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Load More */}
        <div className="text-center mt-12">
          <Button variant="outline" className="border-gray-600 text-white hover:bg-gray-800">
            Load More Posts
          </Button>
        </div>
      </div>
    </div>
  );
}