
import type {Metadata, Viewport} from 'next';
import './globals.css';
import { Toaster } from "@/components/ui/toaster";
import { AppProvider } from "@/lib/context";
import PWAInstaller from "@/components/layout/PWAInstaller";
import { FirebaseClientProvider } from "@/firebase";
import OnboardingGuard from "@/components/layout/OnboardingGuard";
import NotificationGuard from "@/components/layout/NotificationGuard";
import GlobalLoading from "@/components/layout/GlobalLoading";
import SplashScreen from "@/components/layout/SplashScreen";
import DynamicHead from "@/components/layout/DynamicHead";
import SWRegistration from "@/components/layout/SWRegistration";
import MainAppLayout from "@/components/layout/MainAppLayout";

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
  themeColor: '#7C3AED',
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
      </head>
      <body className="font-body antialiased">
        <FirebaseClientProvider>
          <AppProvider>
            <SWRegistration />
            <DynamicHead />
            <SplashScreen />
            <GlobalLoading />
            <PWAInstaller />
            <NotificationGuard>
              <OnboardingGuard>
                <MainAppLayout>
                  {children}
                </MainAppLayout>
              </OnboardingGuard>
            </NotificationGuard>
            <Toaster />
          </AppProvider>
        </FirebaseClientProvider>
      </body>
    </html>
  );
}
