import withPWA from 'next-pwa';

/** @type {import('next').NextConfig} */
const nextConfig = {
  // REQUIRED for static HTML export
  output: 'export',

  // REQUIRED for export: disables next/image optimization
  images: {
    unoptimized: true,
  },

  reactStrictMode: true,

  eslint: {
    ignoreDuringBuilds: true,
  },

  basePath: '',
  trailingSlash: true,

  transpilePackages: ['@heroicons/react', '@headlessui/react'],

  typescript: {
    ignoreBuildErrors: true,
  },
};

/**
 * IMPORTANT:
 * We add version numbers (v2) so old caches get invalidated!
 * This ensures your users always get the latest build.
 *
 * Critical change: HTML now uses NetworkFirst → app updates instantly.
 */
const pwaConfig = withPWA({
  dest: 'public',
  register: true,       // auto-register updated service worker
  skipWaiting: true,    // activate updated SW immediately
  disable: false,
  sw: 'service-worker.js',

  // Fallbacks for offline
  fallbacks: {
    document: '/ai/',
    image: '/ai/icons/icon-512x512.png',
    font: '/ai/icons/icon-512x512.png',
  },

  runtimeCaching: [
    // Start page
    {
      urlPattern: /^\/ai\/$|\/ai\/index\.html$/,
      handler: 'NetworkFirst',        // <--- changed to update quickly
      options: {
        cacheName: 'start-url-v2',
        expiration: { maxEntries: 10, maxAgeSeconds: 365 * 24 * 60 * 60 },
      },
    },

    // IMPORTANT ROUTES
    {
      urlPattern: /^\/ai\/(tutor|teaching-assistant|settings|profile|classroom|quiz|lesson)\/?$/,
      handler: 'NetworkFirst',        // <--- changed from CacheFirst
      options: {
        cacheName: 'main-routes-v2',
        expiration: { maxEntries: 50, maxAgeSeconds: 365 * 24 * 60 * 60 },
      },
    },

    // GENERAL HTML PAGES (CRITICAL)
    {
      urlPattern: /^\/ai\/(?!api\/).*$/,
      handler: 'NetworkFirst',        // <--- ensures UI updates after publishing
      options: {
        cacheName: 'all-pages-v2',
        expiration: { maxEntries: 200, maxAgeSeconds: 365 * 24 * 60 * 60 },
      },
    },

    // API calls (non-auth)
    {
      urlPattern: /\/ai\/api\/(?!auth).*$/,
      handler: 'StaleWhileRevalidate',
      options: {
        cacheName: 'api-cache-v2',
        expiration: { maxEntries: 100, maxAgeSeconds: 30 * 24 * 60 * 60 },
      },
    },

    // Google Fonts
    {
      urlPattern: /^https:\/\/fonts\.(?:googleapis|gstatic)\.com/,
      handler: 'CacheFirst',
      options: {
        cacheName: 'google-fonts-v2',
        expiration: { maxEntries: 50, maxAgeSeconds: 365 * 24 * 60 * 60 },
      },
    },

    // STATIC FILES (CSS, JS, IMAGES)
    {
      urlPattern: /\.(?:png|jpg|jpeg|svg|gif|css|js|woff2?)$/,
      handler: 'StaleWhileRevalidate',  // good balance
      options: {
        cacheName: 'static-resources-v2',
        expiration: { maxEntries: 500, maxAgeSeconds: 60 * 24 * 60 * 60 },
      },
    },

    // LAST fallback for everything else
    {
      urlPattern: /.*$/,
      handler: 'NetworkFirst',          // <--- CRITICAL FIX
      options: {
        cacheName: 'fallback-cache-v2',
        expiration: { maxEntries: 200, maxAgeSeconds: 30 * 24 * 60 * 60 },
      },
    },
  ],
})(nextConfig);

export default pwaConfig;

