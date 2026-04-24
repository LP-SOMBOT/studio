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
  themeColor: '#F0F9FF',
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
      <body className="font-body antialiased min-h-screen relative overflow-x-hidden">
        {/* Global Deep Light Blue Background & Neon Accents */}
        <div className="fixed inset-0 bg-gradient-to-br from-[#F0F9FF] to-[#E0F2FE] -z-20" />
        <div className="fixed inset-0 pointer-events-none overflow-hidden -z-10">
          <div className="absolute top-[-10%] left-[-5%] w-[60%] h-[60%] bg-[#7DD3FC]/30 blur-[140px] rounded-full" />
          <div className="absolute top-[20%] right-[-10%] w-[50%] h-[50%] bg-[#0EA5E9]/20 blur-[140px] rounded-full" />
          <div className="absolute bottom-[-10%] left-[20%] w-[45%] h-[45%] bg-[#00D1FF]/15 blur-[140px] rounded-full" />
        </div>

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