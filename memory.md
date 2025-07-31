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
  - Added language parameter to blog post URLs (?lang=)
  - Auto-detect user language preference from settings
  - Implemented language fallback to English
  - Created language utility functions (`lib/language-utils.ts`)
  - Added LanguageSelector component for user language preference
  - Updated blog pages to filter content by language
  - Added language filter to blog filters
  - Integrated language selector in header navigation
  - Database field mapping: Language: en | jp | cn | vn
