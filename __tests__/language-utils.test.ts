import {
  createLanguageUrl,
  filterPostsByLanguage,
  getDefaultLanguage,
  getUserLanguage,
  isValidLanguage,
  LANGUAGE_NAMES,
  SUPPORTED_LANGUAGES
} from '@/lib/language-utils';
import { UserLanguage } from '@/types/user';

describe('Language Utils', () => {
  describe('isValidLanguage', () => {
    it('should return true for valid language codes', () => {
      expect(isValidLanguage('en')).toBe(true);
      expect(isValidLanguage('cn')).toBe(true);
      expect(isValidLanguage('jp')).toBe(true);
      expect(isValidLanguage('vn')).toBe(true);
    });

    it('should return false for invalid language codes', () => {
      expect(isValidLanguage('fr')).toBe(false);
      expect(isValidLanguage('de')).toBe(false);
      expect(isValidLanguage('')).toBe(false);
      expect(isValidLanguage('invalid')).toBe(false);
    });
  });

  describe('getDefaultLanguage', () => {
    it('should return English as default language', () => {
      expect(getDefaultLanguage()).toBe('en');
    });
  });

  describe('getUserLanguage', () => {
    it('should prioritize URL parameter over user profile', () => {
      const result = getUserLanguage('jp', 'en');
      expect(result).toBe('jp');
    });

    it('should use user profile when URL parameter is invalid', () => {
      const result = getUserLanguage('invalid', 'cn');
      expect(result).toBe('cn');
    });

    it('should fallback to default when both are invalid', () => {
      const result = getUserLanguage('invalid', 'invalid' as UserLanguage);
      expect(result).toBe('en');
    });

    it('should use URL parameter when user profile is undefined', () => {
      const result = getUserLanguage('vn', undefined);
      expect(result).toBe('vn');
    });

    it('should fallback to default when both are undefined', () => {
      const result = getUserLanguage(undefined, undefined);
      expect(result).toBe('en');
    });
  });

  describe('filterPostsByLanguage', () => {
    it('should filter posts by language', () => {
      const posts = [
        { id: '1', language: 'en', title: 'English Post' },
        { id: '2', language: 'cn', title: 'Chinese Post' },
        { id: '3', language: 'en', title: 'Another English Post' },
        { id: '4', language: 'jp', title: 'Japanese Post' },
      ];

      const filtered = filterPostsByLanguage(posts, 'en');
      expect(filtered).toHaveLength(2);
      expect(filtered[0].title).toBe('English Post');
      expect(filtered[1].title).toBe('Another English Post');
    });

    it('should return empty array when no posts match language', () => {
      const posts = [
        { id: '1', language: 'en', title: 'English Post' },
        { id: '2', language: 'cn', title: 'Chinese Post' },
      ];

      const filtered = filterPostsByLanguage(posts, 'jp');
      expect(filtered).toHaveLength(0);
    });
  });

  describe('createLanguageUrl', () => {
    it('should create correct language URL', () => {
      const url = createLanguageUrl('test-post', 'cn');
      expect(url).toBe('/blog/test-post?lang=cn');
    });

    it('should handle different languages', () => {
      expect(createLanguageUrl('post-1', 'en')).toBe('/blog/post-1?lang=en');
      expect(createLanguageUrl('post-2', 'jp')).toBe('/blog/post-2?lang=jp');
      expect(createLanguageUrl('post-3', 'vn')).toBe('/blog/post-3?lang=vn');
    });
  });

  describe('Constants', () => {
    it('should have correct supported languages', () => {
      expect(SUPPORTED_LANGUAGES).toEqual(['en', 'cn', 'jp', 'vn']);
    });

    it('should have correct language names', () => {
      expect(LANGUAGE_NAMES.en).toBe('English');
      expect(LANGUAGE_NAMES.cn).toBe('中文');
      expect(LANGUAGE_NAMES.jp).toBe('日本語');
      expect(LANGUAGE_NAMES.vn).toBe('Tiếng Việt');
    });
  });
}); 
