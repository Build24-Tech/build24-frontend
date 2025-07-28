# Tech Stack & Development Guide

## Core Technologies

- **Framework**: Next.js 15.4.4 with App Router
- **Language**: TypeScript 5.8.3
- **Styling**: Tailwind CSS 4.1.11 with shadcn/ui components
- **Authentication**: Firebase Auth (Google, GitHub, Apple providers)
- **Database**: Firestore
- **Content**: Notion API integration
- **Deployment**: Configured for static export (Vercel/Netlify ready)

## Key Dependencies

- **UI Components**: Radix UI primitives with shadcn/ui
- **Forms**: React Hook Form with Zod validation
- **Icons**: Lucide React
- **Fonts**: Space Grotesk (Google Fonts)
- **State Management**: React Context (AuthContext)
- **Styling**: class-variance-authority for component variants

## Development Commands

```bash
# Development
npm run dev          # Start development server on localhost:3000

# Production
npm run build        # Build for production
npm run start        # Start production server

# Code Quality
npm run lint         # Run ESLint
```

## Environment Setup

Copy `.env.example` to `.env.local` and configure:
- Notion API credentials for blog content
- Firebase configuration for authentication
- Base URL for metadata

## Architecture Patterns

- **App Router**: Use Next.js 13+ app directory structure
- **Server Components**: Default to server components, use 'use client' only when needed
- **Component Organization**: UI components in `/components/ui`, feature components in `/components`
- **Styling**: Tailwind utility classes with CSS variables for theming
- **Type Safety**: Strict TypeScript configuration with proper typing
