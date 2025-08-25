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

  // PWA and mobile optimization
  experimental: {
    webVitalsAttribution: ['CLS', 'LCP'],
    optimizeCss: true,
    optimizePackageImports: ['@/components', '@/lib']
  },

  // Headers for PWA and mobile optimization
  async headers() {
    return [
      {
        source: '/manifest.json',
        headers: [
          {
            key: 'Content-Type',
            value: 'application/manifest+json',
          },
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
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
            value: "default-src 'self'; script-src 'self' 'unsafe-eval' 'unsafe-inline' https://www.googletagmanager.com https://apis.google.com https://www.gstatic.com https://securetoken.googleapis.com; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com; img-src 'self' data: https:; connect-src 'self' https://*.firebase.googleapis.com https://*.firebaseio.com wss://*.firebaseio.com https://build24-knowledge-hub-assets.s3.amazonaws.com https://identitytoolkit.googleapis.com https://securetoken.googleapis.com https://www.googleapis.com https://accounts.google.com; frame-src 'self' https://build24-f185a.firebaseapp.com https://accounts.google.com https://www.google.com;"
          }
        ]
      },
      {
        source: '/sw.js',
        headers: [
          {
            key: 'Content-Type',
            value: 'application/javascript',
          },
          {
            key: 'Cache-Control',
            value: 'public, max-age=0, must-revalidate',
          },
          {
            key: 'Service-Worker-Allowed',
            value: '/'
          }
        ],
      },
      {
        source: '/launch-essentials/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=3600, stale-while-revalidate=86400',
          },
        ],
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

  // Rewrites for PWA offline support and API routes
  async rewrites() {
    return [
      {
        source: '/launch-essentials/offline',
        destination: '/launch-essentials/offline.html',
      },
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

  // Webpack optimizations for mobile
  webpack: (config, { dev, isServer }) => {
    // Optimize bundle size for mobile
    if (!dev && !isServer) {
      config.optimization.splitChunks = {
        chunks: 'all',
        cacheGroups: {
          default: false,
          vendors: false,
          // Vendor chunk
          vendor: {
            name: 'vendor',
            chunks: 'all',
            test: /node_modules/,
            priority: 20,
          },
          // Common chunk
          common: {
            name: 'common',
            minChunks: 2,
            chunks: 'all',
            priority: 10,
            reuseExistingChunk: true,
            enforce: true,
          },
          // Launch essentials specific chunk
          launchEssentials: {
            name: 'launch-essentials',
            chunks: 'all',
            test: /[\\/]app[\\/]launch-essentials[\\/]/,
            priority: 30,
          },
        },
      };
    }

    return config;
  }
};

module.exports = nextConfig;
