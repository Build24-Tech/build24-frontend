'use client';

import { cn } from '@/lib/utils';
import { Image as ImageIcon, Play } from 'lucide-react';
import { useMemo, useState } from 'react';
import ReactMarkdown from 'react-markdown';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/cjs/styles/prism';
import rehypeRaw from 'rehype-raw';
import remarkGfm from 'remark-gfm';

interface MarkdownRendererProps {
  content: string;
  className?: string;
}

export function MarkdownRenderer({ content, className }: MarkdownRendererProps) {
  return (
    <div className={cn('prose prose-invert max-w-none', className)}>
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        rehypePlugins={[rehypeRaw]}
        components={{
          code({ node, inline, className, children, ...props }: any) {
            const match = /language-(\w+)/.exec(className || '');
            return !inline && match ? (
              <SyntaxHighlighter
                style={vscDarkPlus}
                language={match[1]}
                PreTag="div"
                {...props}
              >
                {String(children).replace(/\n$/, '')}
              </SyntaxHighlighter>
            ) : (
              <code className={className} {...props}>
                {children}
              </code>
            );
          },
          // YouTube video embed
          a: ({ node, href, children, ...props }) => {
            const youtubeId = useMemo(() => {
              if (!href) return null;
              
              // Handle YouTube URLs
              const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
              const match = href.match(regExp);
              
              return (match && match[2].length === 11) ? match[2] : null;
            }, [href]);

            if (youtubeId) {
              return (
                <div className="relative aspect-video my-6 rounded-lg overflow-hidden">
                  <iframe
                    className="w-full h-full"
                    src={`https://www.youtube.com/embed/${youtubeId}`}
                    title="YouTube video player"
                    frameBorder="0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  />
                </div>
              );
            }

            // Default link behavior
            return (
              <a
                href={href}
                className="text-blue-400 hover:text-blue-300 underline underline-offset-4"
                target="_blank"
                rel="noopener noreferrer"
                {...props}
              >
                {children}
              </a>
            );
          },
          // Image with error handling
          img: ({ node, src, alt, ...props }) => {
            const [error, setError] = useState(false);
            const [loaded, setLoaded] = useState(false);

            // Check if the image is a YouTube thumbnail
            const isYoutubeThumbnail = useMemo(() => {
              return typeof src === 'string' && src.includes('img.youtube.com');
            }, [src]);

            if (error) {
              return (
                <div className="flex flex-col items-center justify-center p-6 bg-gray-800 rounded-lg border border-gray-700 text-center">
                  <ImageIcon className="w-12 h-12 text-gray-500 mb-2" />
                  <p className="text-sm text-gray-400">Couldn't load image</p>
                  {alt && <p className="text-xs text-gray-500 mt-1">{alt}</p>}
                </div>
              );
            }

            return (
              <div className="relative flex items-center justify-center">
                <div className="relative w-full">
                  <img
                    src={src}
                    alt={alt || ''}
                    onError={() => setError(true)}
                    onLoad={() => setLoaded(true)}
                    className={cn(
                      'w-full h-auto max-h-[430px] object-contain rounded-lg transition-all duration-300',
                      loaded ? 'opacity-100' : 'opacity-0',
                      isYoutubeThumbnail ? 'cursor-pointer hover:opacity-80' : ''
                    )}
                    {...props}
                  />
                  {isYoutubeThumbnail && (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="bg-red-600 text-white rounded-full p-4 transform hover:scale-110 transition-transform">
                        <Play className="w-6 h-6 fill-current" />
                      </div>
                    </div>
                  )}
                </div>
                {!loaded && !error && (
                  <div className="absolute inset-0 flex items-center justify-center bg-gray-800 rounded-lg">
                    <div className="animate-pulse w-full h-full bg-gray-700 rounded-lg"></div>
                  </div>
                )}
              </div>
            );
          },
          // Customize other elements as needed
          h1: ({ node, ...props }) => (
            <h1 className="text-5xl font-bold text-yellow-400 mt-12 mb-6" {...props} />
          ),
          h2: ({ node, ...props }) => (
            <h2 className="text-4xl font-bold text-yellow-400 mt-10 mb-5" {...props} />
          ),
          h3: ({ node, ...props }) => (
            <h3 className="text-3xl font-bold text-yellow-400 mt-8 mb-4" {...props} />
          ),
          p: ({ node, ...props }) => <p className="mb-4 leading-relaxed" {...props} />,
          ul: ({ node, ...props }) => (
            <ul className="list-disc pl-6 mb-4 space-y-2" {...props} />
          ),
          ol: ({ node, ...props }) => (
            <ol className="list-decimal pl-6 mb-4 space-y-2" {...props} />
          ),
          blockquote: ({ node, ...props }) => (
            <blockquote
              className="border-l-4 border-gray-600 pl-4 italic text-gray-300 my-4"
              {...props}
            />
          ),
          // Add more custom components as needed
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}
