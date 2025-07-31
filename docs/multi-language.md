# Multi-Language Support

Build24 now supports multiple languages for blog content and user preferences.

## Supported Languages

- **English (en)** - Default language
- **Chinese (cn)** - 中文
- **Japanese (jp)** - 日本語  
- **Vietnamese (vn)** - Tiếng Việt

## User Language Preferences

### Setting Language Preference

Users can set their language preference through:

1. **Header Language Selector**: Click the globe icon in the header to change language
2. **User Profile**: Language preference is stored in Firestore user document
3. **URL Parameter**: Language can be specified via `?lang=` parameter

### Language Priority

The system follows this priority order for determining user language:

1. URL parameter (`?lang=en`)
2. User profile setting (stored in Firestore)
3. Default language (English)

## Blog Content

### Language-Specific URLs

Blog posts support language-specific URLs:

- English: `/blog/post-slug?lang=en`
- Chinese: `/blog/post-slug?lang=cn`
- Japanese: `/blog/post-slug?lang=jp`
- Vietnamese: `/blog/post-slug?lang=vn`

### Content Filtering

- Blog pages automatically filter content by the selected language
- If no content exists in the selected language, it falls back to English
- Language filter is available in the blog filters section

## Database Structure

### User Document

```typescript
interface UserProfile {
  uid: string;
  email: string;
  displayName?: string;
  photoURL?: string;
  status: UserStatus;
  emailUpdates: boolean;
  language: UserLanguage; // 'en' | 'cn' | 'jp' | 'vn'
  createdAt: number;
  updatedAt: number;
}
```

### Post Document

```typescript
interface Post {
  id: string;
  title: string;
  slug: string;
  coverImage?: string;
  description: string;
  date: string;
  content: string;
  author?: string;
  tags?: string[];
  category?: string;
  language: PostLanguage; // 'en' | 'cn' | 'jp' | 'vn'
}
```

## Notion Database

The Notion database should include a **Language** field with the following options:

- `en` - English
- `jp` - Japanese
- `cn` - Chinese
- `vn` - Vietnamese

## Implementation Details

### Key Files

- `lib/language-utils.ts` - Language utility functions
- `types/user.ts` - User language type definitions
- `lib/notion.ts` - Updated Post interface with language support
- `lib/firestore.ts` - User profile language management
- `contexts/AuthContext.tsx` - Language preference management
- `components/LanguageSelector.tsx` - Language selection UI
- `components/Header.tsx` - Integrated language selector

### Language Detection Flow

1. Check URL parameter for language preference
2. If not found, check user profile in Firestore
3. If not found, use default language (English)
4. Apply language filtering to content
5. Fallback to English if content not available in selected language

## Testing

Run the language utility tests:

```bash
yarn test __tests__/language-utils.test.ts
```

## Usage Examples

### Setting User Language

```typescript
import { useAuth } from '@/contexts/AuthContext';

const { updateLanguage } = useAuth();

// Update user language preference
await updateLanguage('cn');
```

### Creating Language-Specific URLs

```typescript
import { createLanguageUrl } from '@/lib/language-utils';

const url = createLanguageUrl('my-post', 'jp');
// Returns: '/blog/my-post?lang=jp'
```

### Filtering Posts by Language

```typescript
import { filterPostsByLanguage } from '@/lib/language-utils';

const englishPosts = filterPostsByLanguage(allPosts, 'en');
```

### Getting User Language

```typescript
import { getUserLanguage } from '@/lib/language-utils';

const language = getUserLanguage(urlLang, userProfileLanguage);
``` 
