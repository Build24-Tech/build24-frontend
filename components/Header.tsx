'use client';

import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { href } from '@/lib/language-utils';
import { UserLanguage } from '@/types/user';
import { Menu, X } from 'lucide-react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useState } from 'react';
import LanguageSelector from './LanguageSelector';
import { ThemeLogo } from './ThemeLogo';
import { ThemeToggle } from './ThemeToggle';

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { user } = useAuth();
  const params = useParams();
  const currentLang = (params?.lang as UserLanguage) || 'en';

  return (
    <header className="sticky top-0 z-50 bg-background/95 backdrop-blur-sm border-b border-border shadow-sm">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <Link href={href(currentLang, '/')} className="text-2xl font-bold text-yellow-400">
            <ThemeLogo
              type="domain"
              alt="Build24"
              width={180}
              height={80}
              className="w-[180px] h-[80px]"
            />
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-8">
            <Link href={href(currentLang, '/blog')} className="text-muted-foreground hover:text-foreground transition-colors">
              Blog
            </Link>
            <Link href={href(currentLang, '/projects')} className="text-muted-foreground hover:text-foreground transition-colors">
              Projects
            </Link>
            {user && (
              <Link href="/dashboard/knowledge-hub" className="text-muted-foreground hover:text-yellow-400 transition-colors flex items-center gap-1">
                <span className="text-sm">🧠</span>
                Knowledge Hub
              </Link>
            )}
            <Link href={href(currentLang, '/about')} className="text-muted-foreground hover:text-foreground transition-colors">
              About
            </Link>
            <LanguageSelector variant="compact" />
            <ThemeToggle />
            <Button asChild variant="outline" className="border-yellow-400 text-black hover:bg-yellow-400 hover:text-black bg-yellow-400">
              <Link
                href={user ? href(currentLang, '/dashboard') : href(currentLang, '/login')}
                className="flex items-center gap-2"
              >
                {user ? "Dashboard" : "Join"}
              </Link>
            </Button>
          </nav>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden text-foreground"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden py-4 border-t border-border">
            <nav className="flex flex-col gap-4">
              <Link
                href={href(currentLang, '/blog')}
                className="text-muted-foreground hover:text-foreground transition-colors py-2"
                onClick={() => setIsMenuOpen(false)}
              >
                Blog
              </Link>
              <Link
                href={href(currentLang, '/projects')}
                className="text-muted-foreground hover:text-foreground transition-colors py-2"
                onClick={() => setIsMenuOpen(false)}
              >
                Projects
              </Link>
              {user && (
                <Link
                  href="/dashboard/knowledge-hub"
                  className="text-muted-foreground hover:text-yellow-400 transition-colors py-2 flex items-center gap-2"
                  onClick={() => setIsMenuOpen(false)}
                >
                  <span className="text-sm">🧠</span>
                  Knowledge Hub
                </Link>
              )}
              <Link
                href={href(currentLang, '/about')}
                className="text-muted-foreground hover:text-foreground transition-colors py-2"
                onClick={() => setIsMenuOpen(false)}
              >
                About
              </Link>
              <div className="flex items-center gap-4 py-2">
                <div className="flex items-center gap-2">
                  <span className="text-muted-foreground">Language:</span>
                  <LanguageSelector />
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-muted-foreground">Theme:</span>
                  <ThemeToggle />
                </div>
              </div>
              <Button asChild variant="default" className="w-fit bg-yellow-400 text-black hover:bg-yellow-500 hover:text-black">
                <Link
                  href={user ? href(currentLang, '/dashboard') : href(currentLang, '/login')}
                  onClick={() => setIsMenuOpen(false)}
                  className="flex items-center gap-2"
                >
                  <ThemeLogo
                    type="domain"
                    alt={user ? "Dashboard" : "Join"}
                    width={16}
                    height={16}
                    className="w-4 h-4"
                  />
                  {user ? "Dashboard" : "Join"}
                </Link>
              </Button>
            </nav>
          </div>
        )}
      </div>
    </header>
  );
}
