'use client';

import { useTheme } from 'next-themes';
import Image from 'next/image';
import { useEffect, useState } from 'react';

interface ThemeLogoProps {
  type: 'build24' | 'domain';
  width: number;
  height: number;
  className?: string;
  alt: string;
}

export function ThemeLogo({ type, width, height, className, alt }: ThemeLogoProps) {
  const { resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  // Avoid hydration mismatch
  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    // Return light version during hydration
    return (
      <Image
        src={`/${type}_logo_light.svg`}
        alt={alt}
        width={width}
        height={height}
        className={className}
      />
    );
  }

  const logoSrc = resolvedTheme === 'dark'
    ? `/${type}_logo_dark.svg`
    : `/${type}_logo_light.svg`;

  return (
    <Image
      src={logoSrc}
      alt={alt}
      width={width}
      height={height}
      className={className}
    />
  );
}
