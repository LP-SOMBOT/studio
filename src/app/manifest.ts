import { MetadataRoute } from 'next';

/**
 * Updated PWA Manifest
 * Matched with Oskar Shop primary brand colors (Electric Blue #0EA5E9)
 */
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Oskar Shop',
    short_name: 'Oskar',
    description: 'The best gaming top-up service and accounts store in Somalia.',
    start_url: '/',
    display: 'standalone',
    background_color: '#FFFFFF',
    theme_color: '#0EA5E9',
    icons: [
      {
        src: 'https://placehold.co/192x192/0EA5E9/FFFFFF/png?text=O',
        sizes: '192x192',
        type: 'image/png',
        purpose: 'maskable',
      },
      {
        src: 'https://placehold.co/512x512/0EA5E9/FFFFFF/png?text=Oskar',
        sizes: '512x512',
        type: 'image/png',
        purpose: 'any',
      },
    ],
  };
}
