import React, { ReactNode } from "react";
import Link from "next/link";
import { ChevronRight, Home } from "lucide-react";
import { ResponsiveNavigation, NavigationItem } from "./ResponsiveNavigation";
import { AccessibilityProvider } from "./AccessibilityProvider";

// Sample navigation items - would typically come from a data source
const sampleNavItems: NavigationItem[] = [
  {
    id: "validation",
    label: "Product Validation",
    href: "/launch-essentials/validation",
    children: [
      {
        id: "market-research",
        label: "Market Research",
        href: "/launch-essentials/validation/market-research",
        progress: 0
      },
      {
        id: "competitor-analysis",
        label: "Competitor Analysis",
        href: "/launch-essentials/validation/competitor-analysis",
        progress: 0
      }
    ]
  },
  {
    id: "definition",
    label: "Product Definition",
    href: "/launch-essentials/definition",
    children: [
      {
        id: "vision",
        label: "Vision Statement",
        href: "/launch-essentials/definition/vision",
        progress: 0
      },
      {
        id: "value-proposition",
        label: "Value Proposition",
        href: "/launch-essentials/definition/value-proposition",
        progress: 0
      }
    ]
  },
  {
    id: "architecture",
    label: "Technical Architecture",
    href: "/launch-essentials/architecture",
    progress: 0
  }
];

interface LaunchEssentialsLayoutProps {
  children: ReactNode;
  hideNavigation?: boolean;
}

export function LaunchEssentialsLayout({ 
  children, 
  hideNavigation = false 
}: LaunchEssentialsLayoutProps) {
  return (
    <AccessibilityProvider>
      <div className="min-h-screen bg-gray-50">
        {/* Breadcrumb navigation */}
        <div className="bg-white border-b border-gray-200">
          <div className="container mx-auto py-3 px-4 sm:px-6 lg:px-8">
            <nav aria-label="Breadcrumb">
              <ol className="flex items-center space-x-2">
                <li>
                  <Link 
                    href="/" 
                    className="text-gray-500 hover:text-gray-700 text-sm flex items-center"
                    aria-label="Home"
                  >
                    <Home className="h-4 w-4 mr-1" />
                    <span>Home</span>
                  </Link>
                </li>
                <li className="flex items-center">
                  <ChevronRight className="h-4 w-4 text-gray-400" aria-hidden="true" />
                  <span className="ml-2 text-sm font-medium text-gray-900" aria-current="page">
                    Launch Essentials
                  </span>
                </li>
              </ol>
            </nav>
          </div>
        </div>
        
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col lg:flex-row gap-8">
            {/* Side navigation */}
            {!hideNavigation && (
              <aside className="w-full lg:w-64 flex-shrink-0">
                <ResponsiveNavigation 
                  items={sampleNavItems} 
                  title="Launch Essentials" 
                  className="sticky top-4"
                />
              </aside>
            )}
            
            {/* Main content area */}
            <main 
              className="flex-1" 
              id="main-content" 
              tabIndex={-1} 
              role="main"
            >
              <div className="focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-primary">
                {children}
              </div>
            </main>
          </div>
        </div>
        
        {/* Skip to content link (hidden, appears on focus) */}
        <a 
          href="#main-content" 
          className="sr-only focus:not-sr-only focus:absolute focus:top-0 focus:left-0 focus:z-50 focus:p-4 focus:bg-white focus:text-primary"
        >
          Skip to main content
        </a>
      </div>
    </AccessibilityProvider>
  );
}
