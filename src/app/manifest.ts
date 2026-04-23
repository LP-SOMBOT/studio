
import { MetadataRoute } from 'next';

/**
 * PWA Manifest Configuration
 * We use external placeholder URLs for manifest icons to ensure the browser 
 * validates the PWA as installable even if local icons aren't present.
 * The 'DynamicHead' component updates the UI icons in real-time.
 */
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Oskar Shop',
    short_name: 'OskarShop',
    description: 'The best gaming top-up service and accounts store.',
    start_url: '/',
    display: 'standalone',
    background_color: '#FFFFFF',
    theme_color: '#7C3AED',
    icons: [
      {
        src: 'https://placehold.co/192x192/7C3AED/FFFFFF/png?text=O',
        sizes: '192x192',
        type: 'image/png',
        purpose: 'maskable',
      },
      {
        src: 'https://placehold.co/512x512/7C3AED/FFFFFF/png?text=Oskar',
        sizes: '512x512',
        type: 'image/png',
        purpose: 'any',
      },
    ],
  };
}
