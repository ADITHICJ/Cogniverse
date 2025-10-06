import "./globals.css";
import type { Metadata, Viewport } from 'next';
import PWAInstaller from '@/components/PWAInstaller';
import LiveblocksClientProvider from '@/components/LiveblocksClientProvider';

export const metadata: Metadata = {
  title: "PrepSmart",
  description: "AI-Powered Collaborative Lesson Plan Generator",
  keywords: ["education", "AI", "lesson plans", "collaboration", "teaching"],
  authors: [{ name: "Hacker-Ring" }],
  creator: "Hacker-Ring",
  publisher: "PrepSmart",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "any" },
    ],
    apple: [
      { url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" },
    ],
  },
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "PrepSmart",
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#ffffff' },
    { media: '(prefers-color-scheme: dark)', color: '#0a0a0a' }
  ],
  colorScheme: 'light dark',
  viewportFit: 'cover', // For devices with notches
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
      </head>
      <body className="bg-gray-50 text-gray-900 safe-area-top safe-area-bottom">
        <PWAInstaller />
        <LiveblocksClientProvider>
          {children}
        </LiveblocksClientProvider>
      </body>
    </html>
  );
}
