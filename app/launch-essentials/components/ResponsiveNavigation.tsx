"use client";

import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { cn } from "@/lib/utils";
import {
  Check,
  ChevronDown,
  Menu,
  X
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

export interface NavigationItem {
  id: string;
  label: string;
  href: string;
  progress?: number;
  isActive?: boolean;
  children?: NavigationItem[];
}

interface ResponsiveNavigationProps {
  items: NavigationItem[];
  title: string;
  className?: string;
}

export function ResponsiveNavigation({
  items,
  title,
  className
}: ResponsiveNavigationProps) {
  const pathname = usePathname();
  const [openGroups, setOpenGroups] = useState<Record<string, boolean>>({});
  const [isOpen, setIsOpen] = useState(false);

  // Mobile optimization
  const deviceInfo = useDeviceInfo();

  // Auto-close mobile menu on route change
  useEffect(() => {
    setIsOpen(false);
  }, [pathname]);

  // Touch gestures for mobile navigation
  const touchGestures = useTouchGestures({
    onSwipeLeft: () => {
      if (deviceInfo.isMobile && isOpen) {
        setIsOpen(false);
      }
    },
  });

  const toggleGroup = (id: string) => {
    setOpenGroups(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  const isActive = (href: string) => pathname === href;

  // Desktop navigation renderer
  const renderDesktopNav = (
    <div className="hidden lg:block">
      <div className={`font-medium ${getResponsiveTextSize(deviceInfo, 'lg')} mb-4`}>{title}</div>
      <nav className="space-y-1">
        {items.map((item) => {
          if (item.children) {
            return (
              <div key={item.id} className="space-y-1">
                <button
                  onClick={() => toggleGroup(item.id)}
                  className={cn(
                    "flex justify-between items-center w-full px-3 py-2 text-left rounded-md",
                    "hover:bg-gray-100 transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-1",
                    isActive(item.href) && "bg-gray-100 text-primary font-medium"
                  )}
                  aria-expanded={openGroups[item.id]}
                  aria-controls={`group-${item.id}`}
                >
                  <span>{item.label}</span>
                  <ChevronDown
                    className={cn(
                      "h-4 w-4 transition-transform",
                      openGroups[item.id] && "transform rotate-180"
                    )}
                    aria-hidden="true"
                  />
                </button>
                {openGroups[item.id] && (
                  <div
                    id={`group-${item.id}`}
                    className="pl-4 ml-2 border-l border-gray-200 space-y-1"
                  >
                    {item.children.map((child) => (
                      <Link
                        key={child.id}
                        href={child.href}
                        className={cn(
                          "flex justify-between items-center px-3 py-2 text-sm rounded-md",
                          "hover:bg-gray-100 transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-1",
                          isActive(child.href) && "bg-gray-100 text-primary font-medium"
                        )}
                      >
                        <span>{child.label}</span>
                        {child.progress !== undefined && child.progress === 100 && (
                          <Check className="h-4 w-4 text-green-500" aria-label="Completed" />
                        )}
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            );
          }

          return (
            <Link
              key={item.id}
              href={item.href}
              className={cn(
                "flex justify-between items-center px-3 py-2 rounded-md",
                "hover:bg-gray-100 transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-1",
                isActive(item.href) && "bg-gray-100 text-primary font-medium"
              )}
            >
              <span>{item.label}</span>
              {item.progress !== undefined && item.progress === 100 && (
                <Check className="h-4 w-4 text-green-500" aria-label="Completed" />
              )}
            </Link>
          );
        })}
      </nav>
    </div>
  );

  // Mobile navigation renderer (using Sheet from the UI components)
  const renderMobileNav = (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetTrigger asChild>
        <Button
          variant="ghost"
          size={deviceInfo.isMobile ? "default" : "sm"}
          className="lg:hidden touch-manipulation"
        >
          <Menu className={deviceInfo.isMobile ? "h-6 w-6" : "h-5 w-5"} />
          <span className="sr-only">Toggle navigation menu</span>
        </Button>
      </SheetTrigger>
      <SheetContent
        side="left"
        className={`${deviceInfo.isMobile ? 'w-[85%]' : 'w-[80%] sm:w-[350px]'} pt-10`}
        {...(deviceInfo.touchSupported ? touchGestures : {})}
      >
        <Button
          variant="ghost"
          size="sm"
          className="absolute top-4 right-4 touch-manipulation"
          onClick={() => setIsOpen(false)}
        >
          <X className="h-5 w-5" />
          <span className="sr-only">Close navigation menu</span>
        </Button>

        <div className={`font-medium ${getResponsiveTextSize(deviceInfo, 'lg')} mb-6`}>{title}</div>
        <nav className="space-y-1 pb-20">
          {items.map((item) => {
            if (item.children) {
              return (
                <div key={item.id} className="space-y-1">
                  <button
                    onClick={() => toggleGroup(item.id)}
                    className={cn(
                      "flex justify-between items-center w-full text-left rounded-md touch-manipulation",
                      getResponsiveSpacing(deviceInfo, 'sm'),
                      "hover:bg-gray-100 active:bg-gray-200 transition-colors",
                      "focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-1",
                      isActive(item.href) && "bg-gray-100 text-primary font-medium"
                    )}
                    aria-expanded={openGroups[item.id]}
                    aria-controls={`mobile-group-${item.id}`}
                  >
                    <span className={getResponsiveTextSize(deviceInfo, 'base')}>{item.label}</span>
                    <ChevronDown
                      className={cn(
                        "h-5 w-5 transition-transform",
                        openGroups[item.id] && "transform rotate-180"
                      )}
                      aria-hidden="true"
                    />
                  </button>
                  {openGroups[item.id] && (
                    <div
                      id={`mobile-group-${item.id}`}
                      className="pl-4 ml-2 border-l border-gray-200 space-y-1"
                    >
                      {item.children.map((child) => (
                        <Link
                          key={child.id}
                          href={child.href}
                          className={cn(
                            "flex justify-between items-center rounded-md touch-manipulation",
                            getResponsiveSpacing(deviceInfo, 'sm'),
                            "hover:bg-gray-100 active:bg-gray-200 transition-colors",
                            "focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-1",
                            isActive(child.href) && "bg-gray-100 text-primary font-medium"
                          )}
                          onClick={() => setIsOpen(false)}
                        >
                          <span className={`${getResponsiveTextSize(deviceInfo, 'sm')} text-gray-700`}>
                            {child.label}
                          </span>
                          {child.progress !== undefined && child.progress === 100 && (
                            <Check className="h-4 w-4 text-green-500" aria-label="Completed" />
                          )}
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              );
            }

            return (
              <Link
                key={item.id}
                href={item.href}
                className={cn(
                  "flex justify-between items-center rounded-md touch-manipulation",
                  getResponsiveSpacing(deviceInfo, 'sm'),
                  "hover:bg-gray-100 active:bg-gray-200 transition-colors",
                  "focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-1",
                  isActive(item.href) && "bg-gray-100 text-primary font-medium"
                )}
                onClick={() => setIsOpen(false)}
              >
                <span className={getResponsiveTextSize(deviceInfo, 'base')}>{item.label}</span>
                {item.progress !== undefined && item.progress === 100 && (
                  <Check className="h-4 w-4 text-green-500" aria-label="Completed" />
                )}
              </Link>
            );
          })}
        </nav>
      </SheetContent>
    </Sheet>
  );

  return (
    <div className={cn("w-full", className)}>
      {renderDesktopNav}
      {renderMobileNav}
    </div>
  );
}
