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
