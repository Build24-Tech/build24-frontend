# Todo List

- [x] Verify Space Grotesk font implementation and blog styling.

- [x] Create a big hero section for the blog page.

This file tracks the development tasks for the Build24 project. Work on the first open item exclusively.

## Open Tasks

### Theme Switching System Implementation ✅ COMPLETED
- [x] **Set up ThemeProvider in app layout**
  - ✅ Configure next-themes ThemeProvider with light/dark/auto modes
  - ✅ Add proper theme attribute and storage key configuration
  - ✅ Ensure theme persistence across page reloads

- [x] **Create theme switching UI component**
  - ✅ Build a theme toggle component with three options: Light, Dark, Auto
  - ✅ Add proper icons for each theme mode (Sun, Moon, Monitor)
  - ✅ Include visual feedback for current active theme
  - ✅ Position component in header for both desktop and mobile

- [x] **Implement theme storage in user settings**
  - ✅ Add theme preference field to user Firestore document
  - ✅ Create useThemePreference hook for reading/writing theme preference
  - ✅ Sync theme preference with next-themes local storage
  - ✅ Handle theme preference for authenticated vs anonymous users

- [x] **Configure Tailwind CSS for dark mode**
  - ✅ Ensure dark mode classes are properly configured in tailwind.config.ts
  - ✅ Dark mode CSS variables already configured in globals.css
  - ✅ All UI components use theme-aware CSS custom properties
  - ✅ Proper contrast ratios maintained in both themes

- [x] **Implement auto theme detection**
  - ✅ Configure system theme detection using next-themes enableSystem
  - ✅ Add proper handling for prefers-color-scheme media query
  - ✅ Smooth transitions between theme changes (disableTransitionOnChange: false)
  - ✅ Auto mode switching when system theme changes

- [x] **Update existing components for theme support**
  - ✅ All UI components already use theme-aware CSS variables
  - ✅ Proper contrast ratios maintained in both themes
  - ✅ No hardcoded colors found - all use CSS custom properties
  - ✅ Theme switching works across all pages and components

- [ ] **Add theme switching tests**
  - Write unit tests for theme switching functionality
  - Test theme persistence and user preference storage
  - Verify auto mode system theme detection
  - Test theme switching UI component interactions

- [x] **Enhance theme component** ✅ COMPLETED
  - ✅ Menu Theme Switcher should have background color
  - ✅ Inverse color for light mode. All page should have background color in light mode: #F9FAFB, text color: #111827
  - ✅ Banner / hero section should have background color in light mode: #F9FAFB, text color: #111827
  - ✅ Footer should have background color in light mode: #F9FAFB, text color: #111827

- [x] **Fix UI theme switching bugs** ✅ COMPLETED
  - ✅ Button in header should have background color in light mode, button should have pointer cursor, dropdown should have background color in light mode, dropdown should always on top
  - ✅ Logo for light mode and dark mode has been updated, use the right one (build24_logo_dark.svg and build24_logo_light.svg, domain.dark.svg and domain.light.svg)
  - ✅ Header should have background color in light mode and dark mode. (Now it's transparent so don't see and text)
  - ✅ All pages text and background color should be inverse in light mode and dark mode
  
## Completed Tasks

- [x] Create robots.txt and sitemap.xml
- [x] Implement Testimonials Section
- [x] Update hero section content (multiple iterations)
- [x] Update footer content and logo size
- [x] Refine project positioning in footer
- [x] Add missing project documentation files (`memory.md`, `todo.md`, `architecture.md`)
- [x] Implement Firebase Authentication system with Login, Signup, and Forgot Password pages
- [x] Update Subscribe buttons to "Join" and redirect to login page
- [x] Implement login state handling for authenticated users
- [x] Store user profiles in Firestore with status tracking
- [x] Implement multi-language support for website:
  - Add language field to user Firestore document (default: 'en')
  - Update Post interface to support multiple languages (en, cn, jp, vn)
  - **MIGRATED TO PATH-BASED ROUTING**: URLs now use /en/blog, /jp/blog, etc.
  - Auto-detect user language preference from settings
  - Implement language fallback to English
  - Middleware redirects non-language URLs to default language
  - All internal links updated to use language-prefixed URLs
  - generateStaticParams for all language/slug combinations
  - Updated sitemap for all language variants
- [x] Create a big hero section for the blog page:
  - Enhanced with gradient background and animated elements
  - Added stats section with key metrics
  - Improved typography with larger, more impactful headings
  - Added interactive CTA buttons with hover effects
  - Included scroll indicator and floating decorative elements
