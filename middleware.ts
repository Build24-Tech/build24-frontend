import { getDefaultLanguage } from '@/lib/language-utils';
import { NextRequest, NextResponse } from 'next/server';

// Middleware runs on every request
export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Ignore Next.js internal paths (/_next) regardless of position, plus API routes and static files
  if (pathname.includes('/_next') || pathname.startsWith('/api') || pathname.startsWith('/favicon') || pathname.includes('.')) {
    return NextResponse.next();
  }

  // If path already contains /en /jp /cn /vn prefix
  const match = pathname.match(/^\/(en|jp|cn|vn)(\/|$)/);
  if (match) {
    return NextResponse.next();
  }

  // Choose language (could inspect cookie or header later)
  const lang = getDefaultLanguage();
  return NextResponse.redirect(new URL(`/${lang}${pathname}`, req.url));
}

export const config = {
  matcher: ['/((?!_next).*)'],
};
