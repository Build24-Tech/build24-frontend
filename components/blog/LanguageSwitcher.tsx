'use client';

import { Button } from '@/components/ui/button';
import { createLanguageUrl } from '@/lib/language-utils';
import { findRelatedPosts, getBestPostForLanguage, Post } from '@/lib/notion';
import { UserLanguage } from '@/types/user';
import { Globe } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

interface LanguageSwitcherProps {
  currentPost: Post;
  allPosts: Post[];
  currentLanguage: UserLanguage;
}

const LANGUAGE_LABELS: Record<UserLanguage, string> = {
  en: 'English',
  cn: '中文',
  jp: '日本語',
  vn: 'Tiếng Việt',
};

export default function LanguageSwitcher({ currentPost, allPosts, currentLanguage }: LanguageSwitcherProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const relatedPosts = findRelatedPosts(currentPost, allPosts);
  const availableLanguages = Object.entries(relatedPosts)
    .filter(([_, postId]) => postId !== null)
    .map(([lang]) => lang as UserLanguage);



  const handleLanguageChange = async (targetLanguage: UserLanguage) => {
    if (targetLanguage === currentLanguage || isLoading) return;

    setIsLoading(true);
    try {
      const targetPost = getBestPostForLanguage(targetLanguage, relatedPosts, allPosts);

      if (targetPost) {
        const urlPath = targetPost.customUrl || targetPost.slug;
        const newUrl = createLanguageUrl(urlPath, targetLanguage, targetPost.customUrl);
        router.push(newUrl);
      }
    } catch (error) {
      console.error('Error switching language:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (availableLanguages.length <= 1) {
    return null; // Don't show switcher if only one language is available
  }

  return (
    <div className="flex items-center gap-2 bg-black/10 rounded-full p-1">
      <Globe className="w-4 h-4 text-gray-600" />
      {availableLanguages.map((lang) => (
        <Button
          key={lang}
          variant={lang === currentLanguage ? "default" : "ghost"}
          size="sm"
          onClick={() => handleLanguageChange(lang)}
          disabled={isLoading}
          className={`text-xs px-3 py-1 h-auto ${lang === currentLanguage
            ? 'bg-black text-white'
            : 'text-gray-600 hover:text-black hover:bg-black/5'
            }`}
        >
          {LANGUAGE_LABELS[lang]}
        </Button>
      ))}
    </div>
  );
} 
