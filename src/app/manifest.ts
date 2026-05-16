import { MetadataRoute } from 'next';

/**
 * Dynamic PWA Manifest
 * Fetches the admin-uploaded logo from Firebase RTDB to ensure 
 * the PWA icon matches the brand globally.
 */
export default async function manifest(): Promise<MetadataRoute.Manifest> {
  const dbUrl = "https://connectnexus-a9acf-default-rtdb.firebaseio.com";
  let logoUrl = 'https://placehold.co/192x192/0EA5E9/FFFFFF/png?text=O';

  try {
    const res = await fetch(`${dbUrl}/settings.json`, { next: { revalidate: 60 } });
    const settings = await res.json();
    if (settings?.logo) {
      logoUrl = settings.logo;
    }
  } catch (e) {
    console.error("Failed to fetch dynamic manifest logo:", e);
  }

  return {
    name: 'Oskar Shop',
    short_name: 'Oskar',
    description: 'The best gaming top-up service and accounts store in Somalia.',
    start_url: '/',
    display: 'standalone',
    orientation: 'portrait',
    background_color: '#FFFFFF',
    theme_color: '#0EA5E9',
    icons: [
      {
        src: logoUrl,
        sizes: '192x192',
        type: 'image/png',
        purpose: 'maskable',
      },
      {
        src: logoUrl,
        sizes: '512x512',
        type: 'image/png',
        purpose: 'any',
      },
    ],
  };
}