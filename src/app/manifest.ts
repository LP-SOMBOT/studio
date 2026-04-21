
import { MetadataRoute } from 'next';

/**
 * PWA Manifest Configuration
 * Note: For the home screen icon to update to the admin's logo,
 * we provide standard paths here as fallbacks. The 'DynamicHead' component
 * handles the runtime update of the favicon and apple-touch-icon.
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
