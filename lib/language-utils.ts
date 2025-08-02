import { UserLanguage } from '@/types/user';

export const SUPPORTED_LANGUAGES: UserLanguage[] = ['en', 'cn', 'jp', 'vn'];

export const LANGUAGE_NAMES: Record<UserLanguage, string> = {
  en: 'English',
  cn: '中文',
  jp: '日本語',
  vn: 'Tiếng Việt'
};

export const LANGUAGE_CODES: Record<UserLanguage, string> = {
  en: 'en',
  cn: 'zh-CN',
  jp: 'ja',
  vn: 'vi'
};

/**
 * Validates if a language code is supported
 */
export function isValidLanguage(lang: string): lang is UserLanguage {
  return SUPPORTED_LANGUAGES.includes(lang as UserLanguage);
}

/**
 * Gets the default language (English)
 */
export function getDefaultLanguage(): UserLanguage {
  return 'en';
}

/**
 * Gets user language from URL parameter or user profile
 */
export function getUserLanguage(
  urlLang?: string | null,
  userLanguage?: UserLanguage
): UserLanguage {
  // First check URL parameter
  if (urlLang && isValidLanguage(urlLang)) {
    return urlLang;
  }

  // Then check user profile
  if (userLanguage && isValidLanguage(userLanguage)) {
    return userLanguage;
  }

  // Fallback to default
  return getDefaultLanguage();
}

/**
 * Filters posts by language
 */
export function filterPostsByLanguage(
  posts: any[],
  language: UserLanguage
): any[] {
  return posts.filter(post => post.language === language);
}

/**
 * Creates a language-specific URL for blog posts
 */
export function createLanguageUrl(slug: string, language: UserLanguage, customUrl?: string): string {
  const urlPath = customUrl || slug;
  return `/${language}/blog/${urlPath}`;
}

/**
 * Creates a language-specific URL for any path
 */
export function createLangPath(path: string, language: UserLanguage): string {
  // Remove leading slash if present
  const cleanPath = path.startsWith('/') ? path.slice(1) : path;
  return `/${language}/${cleanPath}`;
}

/**
 * Creates a language-specific URL for navigation links
 */
export function href(language: UserLanguage, path: string): string {
  return createLangPath(path, language);
} 
