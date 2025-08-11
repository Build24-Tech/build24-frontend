'use client';

import BadgeNotification from '@/components/knowledge-hub/BadgeNotification';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useAuth } from '@/contexts/AuthContext';
import { useProgressTracker } from '@/hooks/use-progress-tracker';
import { href } from '@/lib/language-utils';
import { UserLanguage } from '@/types/user';
import {
  ArrowLeft,
  Bookmark,
  BookOpen,
  Brain,
  Home,
  Search,
  TrendingUp,
  User,
  Users,
  Zap
} from 'lucide-react';
import Link from 'next/link';
import { useParams, usePathname, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

const navigationItems = [
  {
    id: 'overview',
    name: 'Overview',
    href: '/dashboard/knowledge-hub',
    icon: Home
  },
  {
    id: 'cognitive-biases',
    name: 'Cognitive Biases',
    href: '/dashboard/knowledge-hub/category/cognitive-biases',
    icon: Brain
  },
  {
    id: 'persuasion-principles',
    name: 'Persuasion Principles',
    href: '/dashboard/knowledge-hub/category/persuasion-principles',
    icon: Users
  },
  {
    id: 'behavioral-economics',
    name: 'Behavioral Economics',
    href: '/dashboard/knowledge-hub/category/behavioral-economics',
    icon: TrendingUp
  },
  {
    id: 'ux-psychology',
    name: 'UX Psychology',
    href: '/dashboard/knowledge-hub/category/ux-psychology',
    icon: Zap
  },
  {
    id: 'emotional-triggers',
    name: 'Emotional Triggers',
    href: '/dashboard/knowledge-hub/category/emotional-triggers',
    icon: BookOpen
  }
];

export default function KnowledgeHubLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, loading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const params = useParams();
  const currentLang = (params?.lang as UserLanguage) || 'en';
  const [searchQuery, setSearchQuery] = useState('');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Progress tracking
  const {
    userProgress,
    newBadges,
    dismissBadgeNotifications
  } = useProgressTracker();

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!loading && !user) {
      router.push(href(currentLang, '/login'));
    }
  }, [user, loading, router, currentLang]);

  // Show loading state while checking authentication
  if (loading) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-yellow-400 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  // If not authenticated and not loading, the useEffect will redirect
  if (!user) {
    return null;
  }

  const isActive = (href: string) => {
    if (href === '/dashboard/knowledge-hub') {
      return pathname === href;
    }
    return pathname.startsWith(href);
  };

  return (
    <div className="min-h-screen bg-black text-white">
      <div className="container mx-auto px-4 py-4 sm:py-8">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <header className="flex items-center justify-between mb-6 sm:mb-8">
            <div className="flex items-center space-x-2 sm:space-x-4">
              <Button
                variant="ghost"
                size="sm"
                asChild
                className="text-gray-400 hover:text-white"
                aria-label="Back to Dashboard"
              >
                <Link href="/dashboard">
                  <ArrowLeft className="w-4 h-4 sm:mr-2" />
                  <span className="hidden sm:inline">Back to Dashboard</span>
                </Link>
              </Button>
            </div>

            {/* Desktop Header Actions */}
            <div className="hidden lg:flex items-center space-x-4">
              {/* Search Bar */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="Search theories..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 w-64 bg-gray-900 border-gray-800 focus:border-yellow-400"
                  aria-label="Search theories"
                />
              </div>

              {/* User Actions */}
              <Button
                variant="ghost"
                size="sm"
                asChild
                className="text-gray-400 hover:text-yellow-400"
              >
                <Link href="/dashboard/knowledge-hub/bookmarks">
                  <Bookmark className="w-4 h-4 mr-2" />
                  Bookmarks
                </Link>
              </Button>

              <Button
                variant="ghost"
                size="sm"
                asChild
                className="text-gray-400 hover:text-yellow-400"
              >
                <Link href="/dashboard/knowledge-hub/progress">
                  <User className="w-4 h-4 mr-2" />
                  Progress
                </Link>
              </Button>
            </div>

            {/* Mobile Menu Button */}
            <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
              <SheetTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className="lg:hidden text-gray-400 hover:text-white"
                  aria-label="Open navigation menu"
                >
                  <Menu className="w-5 h-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-80 bg-gray-900 border-gray-800">
                <SheetHeader>
                  <SheetTitle className="text-yellow-400">Knowledge Hub</SheetTitle>
                </SheetHeader>

                <div className="mt-6 space-y-6">
                  {/* Mobile Search */}
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <Input
                      placeholder="Search theories..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10 bg-gray-800 border-gray-700 focus:border-yellow-400"
                      aria-label="Search theories"
                    />
                  </div>

                  {/* Mobile Navigation */}
                  <nav className="space-y-2" role="navigation" aria-label="Knowledge Hub categories">
                    {navigationItems.map((item) => {
                      const IconComponent = item.icon;
                      const active = isActive(item.href);

                      return (
                        <Link
                          key={item.id}
                          href={item.href}
                          onClick={() => setIsMobileMenuOpen(false)}
                          className={`flex items-center space-x-3 px-3 py-3 rounded-lg text-sm transition-colors ${active
                            ? 'bg-yellow-400/10 text-yellow-400 border border-yellow-400/20'
                            : 'text-gray-400 hover:text-white hover:bg-gray-800'
                            }`}
                          aria-current={active ? 'page' : undefined}
                        >
                          <IconComponent className="w-5 h-5" />
                          <span>{item.name}</span>
                        </Link>
                      );
                    })}
                  </nav>

                  {/* Mobile User Actions */}
                  <div className="space-y-2 pt-4 border-t border-gray-800">
                    <Button
                      variant="ghost"
                      size="sm"
                      asChild
                      className="w-full justify-start text-gray-400 hover:text-yellow-400"
                    >
                      <Link href="/dashboard/knowledge-hub/bookmarks" onClick={() => setIsMobileMenuOpen(false)}>
                        <Bookmark className="w-4 h-4 mr-3" />
                        Bookmarks
                      </Link>
                    </Button>

                    <Button
                      variant="ghost"
                      size="sm"
                      asChild
                      className="w-full justify-start text-gray-400 hover:text-yellow-400"
                    >
                      <Link href="/dashboard/knowledge-hub/progress" onClick={() => setIsMobileMenuOpen(false)}>
                        <User className="w-4 h-4 mr-3" />
                        Progress
                      </Link>
                    </Button>
                  </div>

                  {/* Mobile Progress Summary */}
                  <div className="pt-4 border-t border-gray-800">
                    <h4 className="font-semibold mb-3 text-sm text-gray-300">Your Progress</h4>
                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-400">Theories Read</span>
                        <Badge variant="secondary" className="bg-gray-800 text-gray-300">
                          {userProgress?.stats.theoriesRead || 0}
                        </Badge>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-400">Bookmarks</span>
                        <Badge variant="secondary" className="bg-gray-800 text-gray-300">
                          {userProgress?.bookmarkedTheories.length || 0}
                        </Badge>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-400">Badges</span>
                        <Badge variant="secondary" className="bg-gray-800 text-gray-300">
                          {userProgress?.badges.length || 0}
                        </Badge>
                      </div>
                    </div>
                  </div>
                </div>
              </SheetContent>
            </Sheet>
          </header>

          <div className="grid lg:grid-cols-4 gap-6 lg:gap-8">
            {/* Desktop Sidebar Navigation */}
            <aside className="hidden lg:block lg:col-span-1" role="complementary" aria-label="Knowledge Hub navigation">
              <div className="bg-gray-900 border border-gray-800 rounded-lg p-6 sticky top-8">
                <h3 className="font-semibold mb-4 text-yellow-400">Categories</h3>
                <nav className="space-y-2" role="navigation" aria-label="Knowledge Hub categories">
                  {navigationItems.map((item) => {
                    const IconComponent = item.icon;
                    const active = isActive(item.href);

                    return (
                      <Link
                        key={item.id}
                        href={item.href}
                        className={`flex items-center space-x-3 px-3 py-2 rounded-lg text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:ring-offset-2 focus:ring-offset-gray-900 ${active
                          ? 'bg-yellow-400/10 text-yellow-400 border border-yellow-400/20'
                          : 'text-gray-400 hover:text-white hover:bg-gray-800'
                          }`}
                        aria-current={active ? 'page' : undefined}
                      >
                        <IconComponent className="w-4 h-4" aria-hidden="true" />
                        <span>{item.name}</span>
                      </Link>
                    );
                  })}
                </nav>

                {/* User Progress Summary */}
                <div className="mt-8 pt-6 border-t border-gray-800">
                  <h4 className="font-semibold mb-3 text-sm text-gray-300">Your Progress</h4>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-400">Theories Read</span>
                      <Badge variant="secondary" className="bg-gray-800 text-gray-300">
                        {userProgress?.stats.theoriesRead || 0}
                      </Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-400">Bookmarks</span>
                      <Badge variant="secondary" className="bg-gray-800 text-gray-300">
                        {userProgress?.bookmarkedTheories.length || 0}
                      </Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-400">Badges</span>
                      <Badge variant="secondary" className="bg-gray-800 text-gray-300">
                        {userProgress?.badges.length || 0}
                      </Badge>
                    </div>
                    {userProgress?.stats.totalReadTime && userProgress.stats.totalReadTime > 0 && (
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-400">Time Spent</span>
                        <Badge variant="secondary" className="bg-gray-800 text-gray-300">
                          {userProgress.stats.totalReadTime < 60
                            ? `${userProgress.stats.totalReadTime}m`
                            : `${Math.floor(userProgress.stats.totalReadTime / 60)}h ${userProgress.stats.totalReadTime % 60}m`
                          }
                        </Badge>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </aside>

            {/* Main Content */}
            <main className="lg:col-span-3" role="main">
              {children}
            </main>
          </div>
        </div>
      </div>

      {/* Badge notifications */}
      <BadgeNotification
        badges={newBadges}
        onDismiss={dismissBadgeNotifications}
      />
    </div>
  );
}
