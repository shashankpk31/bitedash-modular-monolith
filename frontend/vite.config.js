import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
  define: {
    global: 'globalThis',
  },
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      injectRegister: 'auto',
      includeAssets: ['favicon.svg', 'apple-touch-icon.png', 'masked-icon.svg', 'robots.txt'],
      manifest: {
        name: 'BiteDash Corporate Dining',
        short_name: 'BiteDash',
        description: 'Premium corporate dining experience powered by BiteDash. Order food from your workplace cafeteria with ease.',
        theme_color: '#a73300', // Stitch primary color
        background_color: '#f8f6f5', // Stitch surface color
        display: 'standalone',
        orientation: 'portrait',
        scope: '/',
        start_url: '/',
        categories: ['food', 'business', 'productivity'],
        icons: [
          {
            src: 'pwa-192x192.png',
            sizes: '192x192',
            type: 'image/png'
          },
          {
            src: 'pwa-512x512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any'
          },
          {
            src: 'pwa-512x512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'maskable'
          }
        ],
        shortcuts: [
          {
            name: 'Order Food',
            short_name: 'Order',
            description: 'Browse menu and order food',
            url: '/employee/menu',
            icons: [{ src: 'pwa-192x192.png', sizes: '192x192' }]
          },
          {
            name: 'My Orders',
            short_name: 'Orders',
            description: 'View order history',
            url: '/employee/orders',
            icons: [{ src: 'pwa-192x192.png', sizes: '192x192' }]
          },
          {
            name: 'View Cart',
            short_name: 'Cart',
            description: 'View your shopping cart',
            url: '/employee/cart',
            icons: [{ src: 'pwa-192x192.png', sizes: '192x192' }]
          }
        ]
      },

      workbox: {
        navigateFallback: '/index.html',
        navigateFallbackDenylist: [/^\/api/],
        globPatterns: ['**/*.{js,css,html,ico,png,svg,woff,woff2}'],
        cleanupOutdatedCaches: true,

        runtimeCaching: [
          // API endpoints - Network first with fallback (modular monolith on port 8089)
          {
            urlPattern: /^http:\/\/localhost:8089\/(auth|user|menus|orders|wallet|organisation|organization|revenue|inventory|notifications)\/.*$/,
            handler: 'NetworkFirst',
            options: {
              cacheName: 'api-cache',
              networkTimeoutSeconds: 10,
              expiration: {
                maxEntries: 100,
                maxAgeSeconds: 60 * 60 // 1 hour
              },
              cacheableResponse: {
                statuses: [0, 200]
              },
              backgroundSync: {
                name: 'biteDashModularQueue',
                options: {
                  maxRetentionTime: 60 * 24 // 24 hours
                }
              }
            }
          },
          // Menu data - Cache first for offline browsing
          {
            urlPattern: /^http:\/\/localhost:8089\/menus\/.*$/,
            handler: 'CacheFirst',
            options: {
              cacheName: 'menu-cache',
              expiration: {
                maxEntries: 50,
                maxAgeSeconds: 60 * 60 * 24 // 24 hours
              }
            }
          },
          // Images - Cache first with network fallback
          {
            urlPattern: /\.(?:png|jpg|jpeg|svg|gif|webp)$/,
            handler: 'CacheFirst',
            options: {
              cacheName: 'image-cache',
              expiration: {
                maxEntries: 100,
                maxAgeSeconds: 60 * 60 * 24 * 30 // 30 days
              },
              cacheableResponse: {
                statuses: [0, 200]
              }
            }
          },
          // Fonts - Cache first
          {
            urlPattern: /\.(?:woff|woff2|ttf|otf)$/,
            handler: 'CacheFirst',
            options: {
              cacheName: 'font-cache',
              expiration: {
                maxEntries: 30,
                maxAgeSeconds: 60 * 60 * 24 * 365 // 1 year
              }
            }
          },
          // CSS and JS - Stale while revalidate
          {
            urlPattern: /\.(?:css|js)$/,
            handler: 'StaleWhileRevalidate',
            options: {
              cacheName: 'asset-cache',
              expiration: {
                maxEntries: 60,
                maxAgeSeconds: 60 * 60 * 24 * 7 // 7 days
              }
            }
          }
        ]
      }
    })
  ],
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://localhost:8089',
        changeOrigin: true,
        secure: false,
      }
    }
  }
});