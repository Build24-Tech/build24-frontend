'use client';

import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useAuth } from '@/contexts/AuthContext';
import { href, LANGUAGE_NAMES, SUPPORTED_LANGUAGES } from '@/lib/language-utils';
import { UserLanguage } from '@/types/user';
import { ChevronDown, Globe } from 'lucide-react';
import { useParams, usePathname, useRouter } from 'next/navigation';
import { useState } from 'react';

interface LanguageSelectorProps {
  className?: string;
  variant?: 'default' | 'compact';
}

export default function LanguageSelector({ className = '', variant = 'default' }: LanguageSelectorProps) {
  const { user, userProfile, updateLanguage } = useAuth();
  const [isUpdating, setIsUpdating] = useState(false);
  const params = useParams();
  const router = useRouter();
  const pathname = usePathname();

  const currentLanguage = (params?.lang as UserLanguage) || userProfile?.language || 'en';

  const handleLanguageChange = async (language: string) => {
    if (language === currentLanguage) return;

    setIsUpdating(true);
    try {
      // Update user profile if logged in
      if (user) {
        await updateLanguage(language as UserLanguage);
      }

      // Navigate to the same page in the new language
      const currentPath = pathname.replace(/^\/[a-z]{2}/, ''); // Remove current language prefix
      const newPath = href(language as UserLanguage, currentPath);
      router.push(newPath);
    } catch (error) {
      console.error('Error updating language:', error);
    } finally {
      setIsUpdating(false);
    }
  };

  if (variant === 'compact') {
    return (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="sm" className={`p-2 ${className} cursor-pointer`}>
            <Globe className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="bg-gray-900 border-gray-700">
          <DropdownMenuRadioGroup value={currentLanguage} onValueChange={handleLanguageChange}>
            {SUPPORTED_LANGUAGES.map((language) => (
              <DropdownMenuRadioItem
                key={language}
                value={language}
                className="text-white hover:bg-gray-800 cursor-pointer"
                disabled={isUpdating}
              >
                {LANGUAGE_NAMES[language]}
              </DropdownMenuRadioItem>
            ))}
          </DropdownMenuRadioGroup>
        </DropdownMenuContent>
      </DropdownMenu>
    );
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" className={`border-gray-700 bg-gray-900 ${className} cursor-pointer`}>
          <Globe className="mr-2 h-4 w-4" />
          {LANGUAGE_NAMES[currentLanguage]}
          <ChevronDown className="ml-2 h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="bg-gray-900 border-gray-700">
        <DropdownMenuRadioGroup value={currentLanguage} onValueChange={handleLanguageChange}>
          {SUPPORTED_LANGUAGES.map((language) => (
            <DropdownMenuRadioItem
              key={language}
              value={language}
              className="text-white hover:bg-gray-800 cursor-pointer"
              disabled={isUpdating}
            >
              {LANGUAGE_NAMES[language]}
            </DropdownMenuRadioItem>
          ))}
        </DropdownMenuRadioGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
} 
