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
