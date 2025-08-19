'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { getCrossLinkingService } from '@/lib/cross-linking-service';
import { Theory } from '@/types/knowledge-hub';
import { ExternalLink, FileText, Github, Globe } from 'lucide-react';
import Link from 'next/link';
import { useEffect, useState } from 'react';

interface Build24IntegrationProps {
  theory: Theory;
  className?: string;
}

interface RelatedContent {
  id: string;
  title: string;
  type: 'theory' | 'blog-post' | 'project';
  url: string;
  description: string;
}

export function Build24Integration({ theory, className = '' }: Build24IntegrationProps) {
  const [relatedContent, setRelatedContent] = useState<RelatedContent[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadRelatedContent = async () => {
      try {
        const crossLinkingService = getCrossLinkingService();
        const content = await crossLinkingService.getCrossLinksForTheory(theory, undefined, {
          maxRelatedTheories: 2,
          maxBlogPosts: 3,
          maxProjects: 3
        });

        setRelatedContent(content);
      } catch (error) {
        console.error('Error loading related content:', error);
      } finally {
        setLoading(false);
      }
    };

    loadRelatedContent();
  }, [theory]);

  if (loading) {
    return (
      <div className={`space-y-4 ${className}`}>
        <div className="animate-pulse">
          <div className="h-6 bg-gray-800 rounded mb-4"></div>
          <div className="space-y-3">
            <div className="h-20 bg-gray-800 rounded"></div>
            <div className="h-20 bg-gray-800 rounded"></div>
            <div className="h-20 bg-gray-800 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  const blogPosts = relatedContent.filter(content => content.type === 'blog-post');
  const projects = relatedContent.filter(content => content.type === 'project');
  const theories = relatedContent.filter(content => content.type === 'theory');

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Related Blog Posts */}
      {blogPosts.length > 0 && (
        <Card className="bg-gray-900 border-gray-800">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <FileText className="w-5 h-5 text-blue-400" />
              Related Build24 Blog Posts
            </CardTitle>
            <CardDescription>
              Learn more about applying this theory in real-world scenarios
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {blogPosts.map((post) => (
              <div
                key={post.id}
                className="flex items-start justify-between p-3 bg-gray-800 rounded-lg hover:bg-gray-750 transition-colors"
              >
                <div className="flex-1">
                  <h4 className="font-medium text-white mb-1">{post.title}</h4>
                  <p className="text-sm text-gray-400 mb-2">{post.description}</p>
                  <Badge variant="secondary" className="text-xs bg-blue-500/10 text-blue-400">
                    Blog Post
                  </Badge>
                </div>
                <Button
                  asChild
                  variant="ghost"
                  size="sm"
                  className="ml-3 text-gray-400 hover:text-blue-400"
                >
                  <Link href={post.url} target="_blank" rel="noopener noreferrer">
                    <ExternalLink className="w-4 h-4" />
                  </Link>
                </Button>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Related Projects */}
      {projects.length > 0 && (
        <Card className="bg-gray-900 border-gray-800">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Globe className="w-5 h-5 text-green-400" />
              Related Build24 Projects
            </CardTitle>
            <CardDescription>
              See this theory implemented in 24-hour builds
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {projects.map((project) => (
              <div
                key={project.id}
                className="flex items-start justify-between p-3 bg-gray-800 rounded-lg hover:bg-gray-750 transition-colors"
              >
                <div className="flex-1">
                  <h4 className="font-medium text-white mb-1">{project.title}</h4>
                  <p className="text-sm text-gray-400 mb-2">{project.description}</p>
                  <div className="flex gap-2">
                    <Badge variant="secondary" className="text-xs bg-green-500/10 text-green-400">
                      24h Build
                    </Badge>
                    <Badge variant="secondary" className="text-xs bg-gray-700 text-gray-300">
                      Project
                    </Badge>
                  </div>
                </div>
                <div className="flex gap-1 ml-3">
                  <Button
                    asChild
                    variant="ghost"
                    size="sm"
                    className="text-gray-400 hover:text-green-400"
                  >
                    <Link href={project.url} target="_blank" rel="noopener noreferrer">
                      <Globe className="w-4 h-4" />
                    </Link>
                  </Button>
                  <Button
                    asChild
                    variant="ghost"
                    size="sm"
                    className="text-gray-400 hover:text-green-400"
                  >
                    <Link href={`${project.url}#github`} target="_blank" rel="noopener noreferrer">
                      <Github className="w-4 h-4" />
                    </Link>
                  </Button>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Related Theories */}
      {theories.length > 0 && (
        <Card className="bg-gray-900 border-gray-800">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <span className="text-yellow-400">🧠</span>
              Related Theories
            </CardTitle>
            <CardDescription>
              Explore complementary psychological concepts
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {theories.map((relatedTheory) => (
              <div
                key={relatedTheory.id}
                className="flex items-start justify-between p-3 bg-gray-800 rounded-lg hover:bg-gray-750 transition-colors"
              >
                <div className="flex-1">
                  <h4 className="font-medium text-white mb-1">{relatedTheory.title}</h4>
                  <p className="text-sm text-gray-400 mb-2">{relatedTheory.description}</p>
                  <Badge variant="secondary" className="text-xs bg-yellow-500/10 text-yellow-400">
                    Theory
                  </Badge>
                </div>
                <Button
                  asChild
                  variant="ghost"
                  size="sm"
                  className="ml-3 text-gray-400 hover:text-yellow-400"
                >
                  <Link href={relatedTheory.url}>
                    <ExternalLink className="w-4 h-4" />
                  </Link>
                </Button>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Build24 Context */}
      <Card className="bg-gradient-to-r from-yellow-500/10 to-yellow-600/10 border-yellow-500/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg text-yellow-400">
            <span>⚡</span>
            Apply in Your 24-Hour Build
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <p className="text-sm text-gray-300">
            This theory can be particularly powerful when building products under time constraints.
            Consider how {theory.title.toLowerCase()} might influence your user&apos;s first impression,
            conversion decisions, or overall product experience.
          </p>
          <div className="flex flex-wrap gap-2">
            <Badge variant="outline" className="text-xs border-yellow-500/30 text-yellow-400">
              Rapid Prototyping
            </Badge>
            <Badge variant="outline" className="text-xs border-yellow-500/30 text-yellow-400">
              User Psychology
            </Badge>
            <Badge variant="outline" className="text-xs border-yellow-500/30 text-yellow-400">
              Product Strategy
            </Badge>
          </div>
          <div className="pt-2">
            <Button asChild variant="outline" size="sm" className="border-yellow-500/30 text-yellow-400 hover:bg-yellow-500/10">
              <Link href="/projects">
                View All Build24 Projects
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
