import './globals.css';
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Build24 - 24 Projects in 24 Hours',
  description: 'Follow the journey of building 24 unique projects in 24 hours. A coding marathon exploring creativity, rapid prototyping, and the art of shipping fast.',
  keywords: ['coding challenge', 'rapid prototyping', 'web development', 'projects', 'programming'],
  authors: [{ name: 'Build24' }],
  openGraph: {
    title: 'Build24 - 24 Projects in 24 Hours',
    description: 'Follow the journey of building 24 unique projects in 24 hours.',
    type: 'website',
    locale: 'en_US',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Build24 - 24 Projects in 24 Hours',
    description: 'Follow the journey of building 24 unique projects in 24 hours.',
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
    <html lang="en">
      <body className={inter.className}>
        {children}
      </body>
    </html>
  );
}