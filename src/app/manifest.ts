import { MetadataRoute } from 'next';

/**
 * PWA Manifest Configuration
 * Note: Since manifest generation happens outside the React context, 
 * it uses standard icon paths. Dynamic icon updates are handled 
 * via head injection in DynamicHead.tsx.
 */
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'OskarShop',
    short_name: 'OskarShop',
    description: 'The best gaming top-up service and accounts store.',
    start_url: '/',
    display: 'standalone',
    background_color: '#FFFFFF',
    theme_color: '#7C3AED',
    icons: [
      {
        src: '/icon-192x192.png',
        sizes: '192x192',
        type: 'image/png',
        purpose: 'maskable',
      },
      {
        src: '/icon-512x512.png',
        sizes: '512x512',
        type: 'image/png',
        purpose: 'any',
      },
    ],
  };
}
