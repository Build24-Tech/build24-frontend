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
import { LANGUAGE_NAMES, SUPPORTED_LANGUAGES } from '@/lib/language-utils';
import { UserLanguage } from '@/types/user';
import { ChevronDown, Globe } from 'lucide-react';
import { useState } from 'react';

interface LanguageSelectorProps {
  className?: string;
  variant?: 'default' | 'compact';
}

export default function LanguageSelector({ className = '', variant = 'default' }: LanguageSelectorProps) {
  const { user, userProfile, updateLanguage } = useAuth();
  const [isUpdating, setIsUpdating] = useState(false);

  const currentLanguage = userProfile?.language || 'en';

  const handleLanguageChange = async (language: string) => {
    if (!user || language === currentLanguage) return;

    setIsUpdating(true);
    try {
      await updateLanguage(language as UserLanguage);
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
          <Button variant="ghost" size="sm" className={`p-2 ${className}`}>
            <Globe className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="bg-gray-900 border-gray-700">
          <DropdownMenuRadioGroup value={currentLanguage} onValueChange={handleLanguageChange}>
            {SUPPORTED_LANGUAGES.map((language) => (
              <DropdownMenuRadioItem
                key={language}
                value={language}
                className="text-white hover:bg-gray-800"
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
        <Button variant="outline" className={`border-gray-700 bg-gray-900 ${className}`}>
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
              className="text-white hover:bg-gray-800"
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
