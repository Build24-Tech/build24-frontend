# Project Memory

This document records important decisions, recurring problems, and key configurations for the Build24 project.

## Project Configuration

- **Package Manager**: pnpm
- **Language**: TypeScript
- **Framework**: Next.js
- **Domain**: https://build24.tech
- **Contact Email**: contact@build24.tech
- **Brand**: Build24

## Key Decisions

- **Positioning (2025-07-22)**: Shifted focus from quantity (24 projects) to intensity (one product built in 24 hours). The project is about radical transparency and rapid creation.

## Recurring Problems & Solutions

- **API Error Handling (2025-07-24)**: Implemented comprehensive error handling for API calls with these principles:
  - Always use try/catch blocks around API calls
  - Handle specific error cases (404, network issues, authentication failures)
  - Provide graceful UI fallbacks and default values for null/missing data
  - Log errors appropriately without exposing sensitive information

## Features Implemented
- **UI Components (2025-07-24)**: Button always has class `cursor-pointer` and `select-none`.
- **SEO (2025-07-24)**: Added `robots.ts` and `sitemap.ts` to the `app` directory to programmatically generate `robots.txt` and `sitemap.xml`. The sitemap is dynamically generated from static pages and published Notion posts.
- **Blog Hero Section (2025-07-24)**: Updated the blog hero section with full-width yellow background and Build24 branding/content.
- **Blog Error Handling (2025-07-24)**: Added proper error handling for blog content, with fallbacks for null data and user-friendly error messages.
- **Firebase Authentication (2025-07-24)**: Implemented complete authentication system with:
  - Firebase configuration and setup (`lib/firebase.ts`)
  - Authentication context provider (`contexts/AuthContext.tsx`)
  - Login page with Google, GitHub, Apple, and Email authentication
  - Signup page with required checkboxes for email updates and policy agreement
  - Forgot password functionality with email reset
  - Updated Subscribe buttons to "Join" redirecting to login page
  - Integrated with app layout for global authentication state

- **User Profile Management (2025-07-25)**: Enhanced authentication with Firestore integration:
  - Added Firestore configuration to `lib/firebase.ts`
  - Created user profile model with status tracking (active | inactive | onboarding)
  - Implemented automatic user profile creation in Firestore after signup
  - Store user email preferences from signup form
  - Added login state handling to redirect authenticated users from auth pages
  - Updated "Join" button to "Dashboard" for logged-in users

- **Footer Updates (2025-07-27)**: Enhanced footer with social links and improved layout:
  - Restructured footer to 3 columns: brand, navigation/connect, CTA
  - Placed CTA section side by side with connect column
  - Added GitHub link (https://github.com/Build24-Tech) and Discord icon to social links
  - Updated "Join Discord" link with placeholder invite URL
  - Removed duplicate header/footer from homepage to use global layout

- **Multi-Language Support (2025-07-27)**: Implemented comprehensive multi-language support:
  - Added language field to user Firestore document with default 'en'
  - Updated Post interface to support multiple languages (en, cn, jp, vn)
  - **MIGRATED TO PATH-BASED ROUTING (2025-01-XX)**: URLs now use /en/blog, /jp/blog, etc. instead of ?lang= parameter
  - Auto-detect user language preference from settings
  - Implemented language fallback to English
  - Created language utility functions (`lib/language-utils.ts`)
  - Added LanguageSelector component for user language preference
  - Updated blog pages to filter content by language
  - Added language filter to blog filters
  - Integrated language selector in header navigation
  - Database field mapping: Language: en | jp | cn | vn
  - **Path-based routing features**:
    - Middleware redirects non-language URLs to default language
    - All internal links updated to use language-prefixed URLs
    - generateStaticParams for all language/slug combinations
    - Updated sitemap for all language variants
    - Static assets properly excluded from middleware
    - Language selector navigates to same page in new language
  - **Custom URL Support (2025-01-XX)**: Added support for custom URLs from Notion:
    - Added `customUrl` field to Post interface
    - Posts with Custom URL field use custom URL instead of generated slug
    - Fallback to generated slug when Custom URL is not available
    - Updated URL generation, routing, and sitemap to handle custom URLs
    - Maintains backward compatibility with existing slug-based URLs
    - **Vietnamese Character Support**: Added proper Vietnamese character normalization:
      - Converts Vietnamese characters to ASCII equivalents (Việt Nam → viet-nam)
      - Handles đ/Đ → d conversion
      - Forward slash conversion (5/100 → 5-100)
      - Maintains URL-friendly formatting

  - **Related Origin Support (2025-01-XX)**: Implemented cross-language post relationships:
    - Added `relatedOrigin` field to Post interface for Notion relation field
    - English posts can link to translations (vn, cn, jp versions)
    - Translation posts link back to English origin
    - **Language Switcher Component**: Added interactive language switching:
      - Shows available language versions for current post
      - Seamlessly navigates between language versions
      - Falls back to English if target language not available
      - Only displays when multiple language versions exist
    - **Utility Functions**:
      - `findRelatedPosts()`: Maps all related posts across languages using bidirectional relationship detection
      - `getBestPostForLanguage()`: Gets best available post for target language
    - **User Experience**: Users can switch languages while reading posts
    - **Relationship Logic**: Handles circular references and bidirectional relationships:
      - Finds all posts connected through any relationship (current → target, target → current, shared origins)
      - Maps related posts to their respective languages
      - Ensures language switcher appears when multiple versions exist
