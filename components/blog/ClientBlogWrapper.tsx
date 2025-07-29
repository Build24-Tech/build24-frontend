'use client';

import { useState } from 'react';
import { Post } from '@/lib/notion';
import BlogFilters from './BlogFilters';
import BlogGrid from '@/components/blog/BlogGrid';

interface ClientBlogWrapperProps {
  initialPosts: Post[];
}

export default function ClientBlogWrapper({ initialPosts }: ClientBlogWrapperProps) {
  const [filteredPosts, setFilteredPosts] = useState<Post[]>(initialPosts);

  return (
    <>
      <BlogFilters posts={initialPosts} onFilterChange={setFilteredPosts} />
      <BlogGrid posts={filteredPosts} />
    </>
  );
}
