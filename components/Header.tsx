'use client';

import { Button } from '@/components/ui/button';
import { Menu, X } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { useState } from 'react';

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 bg-black/90 backdrop-blur-sm border-b border-gray-800">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <Link href="/" className="text-2xl font-bold text-yellow-400">
            <Image
              src="/domain.light.svg"
              alt="Build24"
              width={180}
              height={180}
              className="w-[180px] h-[80px]"
            />
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-8">
            <Link href="/blog" className="text-gray-300 hover:text-white transition-colors">
              Blog
            </Link>
            <Link href="/projects" className="text-gray-300 hover:text-white transition-colors">
              Projects
            </Link>
            <Link href="/about" className="text-gray-300 hover:text-white transition-colors">
              About
            </Link>
            <Button asChild variant="outline" className="border-yellow-400 text-black hover:bg-yellow-400 hover:text-black bg-yellow-400">
              <a
                href="https://forms.gle/gBBDNsvk5RTHE83z8"
                className="flex items-center gap-2"
                target="_blank"
                rel="noopener noreferrer"
              >
                Subscribe
              </a>
            </Button>
          </nav>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden text-white"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden py-4 border-t border-gray-800">
            <nav className="flex flex-col gap-4">
              <Link
                href="/blog"
                className="text-gray-300 hover:text-white transition-colors py-2"
                onClick={() => setIsMenuOpen(false)}
              >
                Blog
              </Link>
              <Link
                href="/projects"
                className="text-gray-300 hover:text-white transition-colors py-2"
                onClick={() => setIsMenuOpen(false)}
              >
                Projects
              </Link>
              <Link
                href="/about"
                className="text-gray-300 hover:text-white transition-colors py-2"
                onClick={() => setIsMenuOpen(false)}
              >
                About
              </Link>
              <Button asChild variant="default" className="w-fit bg-yellow-400 text-black hover:bg-yellow-500 hover:text-black">
                <a
                  href="https://forms.gle/gBBDNsvk5RTHE83z8"
                  onClick={() => setIsMenuOpen(false)}
                  className="flex items-center gap-2"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Image
                    src="/domain.light.svg"
                    alt="Subscribe"
                    width={16}
                    height={16}
                    className="w-4 h-4"
                  />
                  Subscribe
                </a>
              </Button>
            </nav>
          </div>
        )}
      </div>
    </header>
  );
}
