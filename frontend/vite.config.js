/* eslint-env node */
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  const targetUrl = env.VITE_API_URL || 'http://localhost:8089';

  return {
    plugins: [
      react(),

      VitePWA({
        registerType: 'autoUpdate',
        injectRegister: 'auto',

        devOptions: {
          enabled: false, // disable PWA in dev (recommended)
        },

        includeAssets: [
          'favicon.svg',
          'apple-touch-icon.png',
          'masked-icon.svg',
          'robots.txt',
        ],

        manifest: {
          name: 'BiteDash Corporate Dining',
          short_name: 'BiteDash',
          description:
            'Premium corporate dining experience powered by BiteDash.',
          theme_color: '#a73300',
          background_color: '#f8f6f5',
          display: 'standalone',
          orientation: 'portrait',
          scope: '/',
          start_url: '/',
          categories: ['food', 'business', 'productivity'],

          icons: [
            {
              src: 'pwa-192x192.png',
              sizes: '192x192',
              type: 'image/png',
            },
            {
              src: 'pwa-512x512.png',
              sizes: '512x512',
              type: 'image/png',
              purpose: 'any',
            },
            {
              src: 'pwa-512x512.png',
              sizes: '512x512',
              type: 'image/png',
              purpose: 'maskable',
            },
          ],

          shortcuts: [
            {
              name: 'Order Food',
              short_name: 'Order',
              description: 'Browse menu and order food',
              url: '/employee/menu',
              icons: [{ src: 'pwa-192x192.png', sizes: '192x192' }],
            },
            {
              name: 'My Orders',
              short_name: 'Orders',
              description: 'View order history',
              url: '/employee/orders',
              icons: [{ src: 'pwa-192x192.png', sizes: '192x192' }],
            },
            {
              name: 'View Cart',
              short_name: 'Cart',
              description: 'View your shopping cart',
              url: '/employee/cart',
              icons: [{ src: 'pwa-192x192.png', sizes: '192x192' }],
            },
          ],
        },

        workbox: {
          navigateFallback: '/index.html',
          navigateFallbackDenylist: [/^\/api/],
          cleanupOutdatedCaches: true,
          globPatterns: ['**/*.{js,css,html,ico,png,svg,woff,woff2}'],

          runtimeCaching: [
            // ✅ API caching (aligned with proxy `/api`)
            {
              urlPattern:
                /^\/api\/(auth|user|menus|orders|wallet|organisation|organization|revenue|inventory|notifications)\/.*/,
              handler: 'NetworkFirst',
              options: {
                cacheName: 'api-cache',
                networkTimeoutSeconds: 10,
                expiration: {
                  maxEntries: 100,
                  maxAgeSeconds: 60 * 60, // 1 hour
                },
                cacheableResponse: {
                  statuses: [0, 200],
                },
                backgroundSync: {
                  name: 'biteDashQueue',
                  options: {
                    maxRetentionTime: 60 * 24, // 24 hours
                  },
                },
              },
            },

            // ✅ Images
            {
              urlPattern: /\.(?:png|jpg|jpeg|svg|gif|webp)$/,
              handler: 'CacheFirst',
              options: {
                cacheName: 'image-cache',
                expiration: {
                  maxEntries: 100,
                  maxAgeSeconds: 60 * 60 * 24 * 30,
                },
                cacheableResponse: {
                  statuses: [0, 200],
                },
              },
            },

            // ✅ Fonts
            {
              urlPattern: /\.(?:woff|woff2|ttf|otf)$/,
              handler: 'CacheFirst',
              options: {
                cacheName: 'font-cache',
                expiration: {
                  maxEntries: 30,
                  maxAgeSeconds: 60 * 60 * 24 * 365,
                },
              },
            },

            // ✅ JS/CSS
            {
              urlPattern: /\.(?:js|css)$/,
              handler: 'StaleWhileRevalidate',
              options: {
                cacheName: 'asset-cache',
                expiration: {
                  maxEntries: 60,
                  maxAgeSeconds: 60 * 60 * 24 * 7,
                },
              },
            },
          ],
        },
      }),
    ],

    server: {
      port: 5173,
      proxy: {
        '/api': {
          target: targetUrl,
          changeOrigin: true,
          secure: false,
        },
      },
    },
  };
});