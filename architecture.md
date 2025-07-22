# Architecture Overview

This document outlines the high-level architecture of the Build24 frontend.

## Core Technologies

- **Framework**: Next.js (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **UI Components**: Shadcn UI

## Project Structure

- `app/`: Contains the pages and layouts of the application, following the Next.js App Router paradigm.
- `components/`: Contains reusable React components used across the application.
- `lib/`: Contains helper functions and utility code.
- `public/`: Contains static assets like images and fonts.

## Key Components

- `app/page.tsx`: The main landing page, which includes the Hero, Featured Projects, and Footer sections.
- `components/Header.tsx`: The main navigation header for the site.

## Design Rationale

- The project uses a monolithic structure within the `app` directory for simplicity, which is suitable for a single-page marketing site. 
- Component-based architecture is used to promote reusability and separation of concerns.
