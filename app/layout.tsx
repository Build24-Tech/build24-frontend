import './globals.css';

import Footer from '@/components/Footer';
import Header from '@/components/Header';
import { Toaster } from '@/components/ui/toaster';
import { AuthProvider } from '@/contexts/AuthContext';
import type { Metadata } from 'next';
import { ThemeProvider } from 'next-themes';
import localFont from 'next/font/local';

const spaceGrotesk = localFont({
  src: '../public/font/spacegrotesk/SpaceGrotesk-VariableFont_wght.ttf',
  variable: '--font-space-grotesk',
  display: 'swap',
});

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_BASE_URL || 'https://build24.tech'),
  alternates: {
    canonical: '/',
  },
  title: 'Build24 - One product idea. Built in 24 hours. Documented in public.',
  description: 'Follow the journey of building 24 unique projects. A coding marathon exploring creativity, rapid prototyping, and the art of shipping fast.',
  keywords: ['coding challenge', 'rapid prototyping', 'web development', 'projects', 'programming'],
  icons: {
    icon: '/favicon.png',
    shortcut: '/favicon.png',
    apple: '/favicon.png',
  },
  authors: [{ name: 'Build24' }],
  openGraph: {
    title: 'Build24 - One product idea. Built in 24 hours. Documented in public.',
    description: 'Follow the journey of building 24 unique projects.',
    type: 'website',
    locale: 'en_US',
    images: [
      '/og-image.png'
    ]
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Build24 - One product idea. Built in 24 hours. Documented in public.',
    description: 'Follow the journey of building 24 unique projects.',
    images: [
      '/og-image.png'
    ]
  },
  robots: {
    index: true,
    follow: true,
  }
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${spaceGrotesk.className} scroll-smooth`} suppressHydrationWarning>
      <body className={`${spaceGrotesk.variable} font-space-grotesk`}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          themes={['light', 'dark', 'system']}
          storageKey="build24-theme"
          disableTransitionOnChange={false}
        >
          <AuthProvider>
            <Header />
            <main>{children}</main>
            <Footer />
            <Toaster />
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
