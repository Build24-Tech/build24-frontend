/**
 * CDN Configuration for Knowledge Hub Media Assets
 * Handles theory images, diagrams, and interactive content delivery
 */

export interface CDNConfig {
  baseUrl: string;
  regions: string[];
  cacheSettings: {
    images: number;
    videos: number;
    documents: number;
  };
}

export const cdnConfig: CDNConfig = {
  baseUrl: process.env.NEXT_PUBLIC_CDN_BASE_URL || '/content',
  regions: ['us-east-1', 'eu-west-1', 'ap-southeast-1'],
  cacheSettings: {
    images: 31536000, // 1 year
    videos: 2592000,  // 30 days
    documents: 86400  // 1 day
  }
};

/**
 * Generate optimized CDN URL for theory media assets
 */
export function getCDNUrl(
  assetPath: string,
  options: {
    width?: number;
    height?: number;
    quality?: number;
    format?: 'webp' | 'avif' | 'png' | 'jpg';
  } = {}
): string {
  const { width, height, quality = 85, format } = options;
  const baseUrl = cdnConfig.baseUrl;

  // For local development, return direct path
  if (process.env.NODE_ENV === 'development') {
    return `${baseUrl}/${assetPath}`;
  }

  // Build query parameters for image optimization
  const params = new URLSearchParams();
  if (width) params.set('w', width.toString());
  if (height) params.set('h', height.toString());
  if (quality) params.set('q', quality.toString());
  if (format) params.set('f', format);

  const queryString = params.toString();
  const separator = queryString ? '?' : '';

  return `${baseUrl}/${assetPath}${separator}${queryString}`;
}

/**
 * Get cache headers for different asset types
 */
export function getCacheHeaders(assetType: 'image' | 'video' | 'document'): Record<string, string> {
  const maxAge = cdnConfig.cacheSettings[assetType === 'image' ? 'images' :
    assetType === 'video' ? 'videos' : 'documents'];

  return {
    'Cache-Control': `public, max-age=${maxAge}, immutable`,
    'CDN-Cache-Control': `public, max-age=${maxAge}`,
    'Cloudflare-CDN-Cache-Control': `public, max-age=${maxAge}`,
    'Vary': 'Accept-Encoding'
  };
}

/**
 * Preload critical theory assets
 */
export function preloadTheoryAssets(theoryId: string): void {
  if (typeof window === 'undefined') return;

  const criticalAssets = [
    `theories/${theoryId}/diagram.svg`,
    `theories/${theoryId}/preview.webp`
  ];

  criticalAssets.forEach(asset => {
    const link = document.createElement('link');
    link.rel = 'preload';
    link.as = 'image';
    link.href = getCDNUrl(asset, { format: 'webp', quality: 85 });
    document.head.appendChild(link);
  });
}

/**
 * Generate responsive image srcset for theory diagrams
 */
export function generateSrcSet(imagePath: string): string {
  const sizes = [320, 640, 768, 1024, 1280, 1920];

  return sizes
    .map(size => `${getCDNUrl(imagePath, { width: size, format: 'webp' })} ${size}w`)
    .join(', ');
}

/**
 * CDN health check and fallback logic
 */
export async function checkCDNHealth(): Promise<boolean> {
  try {
    const testUrl = getCDNUrl('health-check.txt');
    const response = await fetch(testUrl, {
      method: 'HEAD',
      cache: 'no-cache'
    });
    return response.ok;
  } catch {
    return false;
  }
}

/**
 * Fallback to local assets if CDN is unavailable
 */
export function getAssetUrlWithFallback(assetPath: string, options = {}): string {
  // In production, always try CDN first
  if (process.env.NODE_ENV === 'production') {
    return getCDNUrl(assetPath, options);
  }

  // In development, use local assets
  return `/content/${assetPath}`;
}
