import type {Metadata, Viewport} from 'next';
import './globals.css';
import { Toaster } from "@/components/ui/toaster";
import { AppProvider } from "@/lib/context";
import PWAInstaller from "@/components/layout/PWAInstaller";

export const metadata: Metadata = {
  title: 'Oskar Shop - Game Top-Up & Accounts',
  description: 'The best gaming top-up service and accounts store.',
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'Oskar Shop',
  },
};

export const viewport: Viewport = {
  themeColor: '#8526CC',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Space+Grotesk:wght@500;600;700&display=swap" rel="stylesheet" />
        <link rel="apple-touch-icon" href="https://picsum.photos/seed/oskar-apple/180/180" />
      </head>
      <body className="font-body antialiased">
        <AppProvider>
          <PWAInstaller />
          {children}
          <Toaster />
        </AppProvider>
      </body>
    </html>
  );
}
