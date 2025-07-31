'use client';

import BlogGrid from '@/components/blog/BlogGrid';
import { Post } from '@/lib/notion';
import { UserLanguage } from '@/types/user';
import { useState } from 'react';
import BlogFilters from './BlogFilters';

interface ClientBlogWrapperProps {
  initialPosts: Post[];
  currentLanguage: UserLanguage;
}

export default function ClientBlogWrapper({ initialPosts, currentLanguage }: ClientBlogWrapperProps) {
  const [filteredPosts, setFilteredPosts] = useState<Post[]>(initialPosts);

  return (
    <>
      <BlogFilters posts={initialPosts} onFilterChange={setFilteredPosts} currentLanguage={currentLanguage} />
      <BlogGrid posts={filteredPosts} currentLanguage={currentLanguage} />
    </>
  );
}
