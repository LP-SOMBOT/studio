import { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Oskar Shop - Game Top-Up & Accounts',
    short_name: 'OskarShop',
    description: 'The best gaming top-up service and accounts store.',
    start_url: '/',
    display: 'standalone',
    background_color: '#F3F1F7',
    theme_color: '#8526CC',
    icons: [
      {
        src: 'https://picsum.photos/seed/oskar-pwa-192/192/192',
        sizes: '192x192',
        type: 'image/png',
        purpose: 'maskable',
      },
      {
        src: 'https://picsum.photos/seed/oskar-pwa-512/512/512',
        sizes: '512x512',
        type: 'image/png',
      },
    ],
  };
}
