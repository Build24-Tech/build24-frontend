# Project Structure & Organization

## Directory Structure

```
├── app/                    # Next.js App Router pages and layouts
│   ├── about/             # About page
│   ├── blog/              # Blog pages with dynamic routing
│   │   └── [slug]/        # Individual blog post pages
│   ├── dashboard/         # User dashboard
│   ├── login/             # Authentication pages
│   ├── signup/
│   ├── forgot-password/
│   ├── projects/          # Project showcase
│   ├── privacy/           # Legal pages
│   ├── terms/
│   ├── subscribe/         # Newsletter subscription
│   ├── layout.tsx         # Root layout with providers
│   ├── page.tsx           # Homepage
│   ├── globals.css        # Global styles
│   ├── robots.ts          # SEO robots configuration
│   └── sitemap.ts         # SEO sitemap generation
├── components/            # Reusable React components
│   ├── ui/               # shadcn/ui components (auto-generated)
│   ├── blog/             # Blog-specific components
│   ├── testimonials/     # Testimonial components
│   ├── Header.tsx        # Site navigation
│   ├── Footer.tsx        # Site footer
│   ├── Newsletter.tsx    # Newsletter signup
│   └── ProjectCard*.tsx  # Project display components
├── contexts/             # React Context providers
│   └── AuthContext.tsx   # Authentication state management
├── lib/                  # Utility functions and configurations
│   ├── firebase.ts       # Firebase setup and providers
│   ├── firestore.ts      # Firestore database operations
│   ├── notion.ts         # Notion API integration
│   └── utils.ts          # General utilities (cn function, etc.)
├── hooks/                # Custom React hooks
│   └── use-toast.ts      # Toast notification hook
├── types/                # TypeScript type definitions
│   └── user.ts           # User-related types
└── public/               # Static assets
    ├── favicon.png
    ├── og-image.png
    └── *.svg             # Logo and icon files
```

## File Naming Conventions

- **Pages**: Use lowercase with hyphens for routes (`forgot-password/`)
- **Components**: PascalCase for React components (`ProjectCard.tsx`)
- **Utilities**: camelCase for functions and utilities (`firebase.ts`)
- **Types**: camelCase for type files (`user.ts`)

## Component Organization

- **UI Components**: Auto-generated shadcn/ui components in `/components/ui`
- **Feature Components**: Domain-specific components in `/components`
- **Layout Components**: Header, Footer, and layout-related components
- **Page Components**: Components specific to individual pages

## Import Patterns

- Use `@/` alias for absolute imports from project root
- Import UI components from `@/components/ui`
- Import utilities from `@/lib/utils`
- Group imports: external libraries, then internal modules

## Configuration Files

- `components.json`: shadcn/ui configuration
- `tailwind.config.ts`: Tailwind CSS configuration with custom theme
- `tsconfig.json`: TypeScript configuration with path aliases
- `next.config.js`: Next.js configuration with environment variables
