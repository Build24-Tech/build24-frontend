'use client';

import { cn } from '@/lib/utils';
import { Image as ImageIcon } from 'lucide-react';
import { useState } from 'react';
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
          // Image with error handling
          img: ({ node, src, alt, ...props }) => {
            const [error, setError] = useState(false);
            const [loaded, setLoaded] = useState(false);

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
                <img
                  src={src}
                  alt={alt || ''}
                  onError={() => setError(true)}
                  onLoad={() => setLoaded(true)}
                  className={cn(
                    'max-w-full h-auto rounded-lg transition-opacity duration-300',
                    loaded ? 'opacity-100' : 'opacity-0'
                  )}
                  {...props}
                />
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
            <h1 className="text-3xl font-bold mt-10 mb-4" {...props} />
          ),
          h2: ({ node, ...props }) => (
            <h2 className="text-2xl font-bold mt-8 mb-3" {...props} />
          ),
          h3: ({ node, ...props }) => (
            <h3 className="text-xl font-semibold mt-6 mb-2" {...props} />
          ),
          p: ({ node, ...props }) => <p className="mb-4 leading-relaxed" {...props} />,
          ul: ({ node, ...props }) => (
            <ul className="list-disc pl-6 mb-4 space-y-2" {...props} />
          ),
          ol: ({ node, ...props }) => (
            <ol className="list-decimal pl-6 mb-4 space-y-2" {...props} />
          ),
          a: ({ node, ...props }) => (
            <a
              className="text-blue-400 hover:text-blue-300 underline underline-offset-4"
              target="_blank"
              rel="noopener noreferrer"
              {...props}
            />
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
