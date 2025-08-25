/** @type {import('next').NextConfig} */

// Load environment variables from .env files
require('dotenv').config();

const nextConfig = {
  // Enable static export for production deployment
  output: process.env.NODE_ENV === 'production' ? 'export' : undefined,

  eslint: {
    ignoreDuringBuilds: true,
  },

  images: {
    unoptimized: true,
    domains: [
      'build24-knowledge-hub-assets.s3.amazonaws.com',
      'build24-knowledge-hub-assets.s3-website-us-east-1.amazonaws.com'
    ]
  },

  // Optimize for production
  swcMinify: true,
  compress: true,

  // Security headers
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Frame-Options',
            value: 'DENY'
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff'
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin'
          },
          {
            key: 'Content-Security-Policy',
            value: "default-src 'self'; script-src 'self' 'unsafe-eval' 'unsafe-inline' https://www.googletagmanager.com; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com; img-src 'self' data: https:; connect-src 'self' https://*.firebase.googleapis.com https://*.firebaseio.com wss://*.firebaseio.com https://build24-knowledge-hub-assets.s3.amazonaws.com;"
          }
        ]
      },
      {
        source: '/sw.js',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=0, must-revalidate'
          },
          {
            key: 'Service-Worker-Allowed',
            value: '/'
          }
        ]
      },
      {
        source: '/content/theories/(.*)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable'
          }
        ]
      }
    ];
  },

  // Rewrites for API routes
  async rewrites() {
    return [
      {
        source: '/api/metrics',
        destination: '/api/monitoring/metrics'
      }
    ];
  },

  // Make environment variables available to the client-side
  env: {
    FIREBASE_API_KEY: process.env.FIREBASE_API_KEY,
    FIREBASE_AUTH_DOMAIN: process.env.FIREBASE_AUTH_DOMAIN,
    FIREBASE_PROJECT_ID: process.env.FIREBASE_PROJECT_ID,
    FIREBASE_STORAGE_BUCKET: process.env.FIREBASE_STORAGE_BUCKET,
    FIREBASE_MESSAGING_SENDER_ID: process.env.FIREBASE_MESSAGING_SENDER_ID,
    FIREBASE_APP_ID: process.env.FIREBASE_APP_ID,
    FIREBASE_MEASUREMENT_ID: process.env.FIREBASE_MEASUREMENT_ID,
  },

  // Production optimizations
  experimental: {
    optimizeCss: true,
    optimizePackageImports: ['@/components', '@/lib']
  }
};

module.exports = nextConfig;
