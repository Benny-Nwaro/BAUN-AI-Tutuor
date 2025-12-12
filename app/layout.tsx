import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Providers from "./providers";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const viewport: Viewport = {
  themeColor: "#FFC72C",
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
  viewportFit: "cover",
};

export const metadata: Metadata = {
  title: "Baun AI Tutor | Your Personal AI Tutor",
  description: "Your personal AI tutor for learning and education - works fully offline",
  applicationName: "Baun AI Tutor",
  authors: [{ name: "Baun AI Team" }],
  keywords: ["education", "AI", "tutoring", "teaching", "learning", "offline", "PWA"],
  manifest: "/ai/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "Baun Tutor",
    startupImage: [
      {
        media: "(device-width: 768px) and (device-height: 1024px)",
        url: "/ai/icons/apple-splash-2048-2732.png",
      },
      {
        media: "(device-width: 834px) and (device-height: 1194px)",
        url: "/ai/icons/apple-splash-1668-2388.png",
      },
      {
        media: "(device-width: 834px) and (device-height: 1112px)",
        url: "/ai/icons/apple-splash-1536-2048.png",
      },
      {
        media: "(device-width: 375px) and (device-height: 812px)",
        url: "/ai/icons/apple-splash-1125-2436.png",
      },
      {
        media: "(device-width: 414px) and (device-height: 896px)",
        url: "/ai/icons/apple-splash-1242-2688.png",
      },
    ]
  },
  formatDetection: {
    telephone: false,
  },
  icons: {
    icon: [
      { url: "/ai/icons/icon-192x192.png", sizes: "192x192", type: "image/png" },
      { url: "/ai/icons/icon-512x512.png", sizes: "512x512", type: "image/png" },
    ],
    apple: [
      { url: "/ai/icons/apple-touch-icon.png", sizes: "180x180", type: "image/png" },
      { url: "/ai/icons/icon-192x192.png", sizes: "192x192", type: "image/png" },
      { url: "/ai/icons/icon-512x512.png", sizes: "512x512", type: "image/png" },
    ],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="apple-mobile-web-app-title" content="Baun Tutor" />
        <link rel="apple-touch-icon" href="/ai/icons/apple-touch-icon.png" />
        <meta name="theme-color" content="#FFC72C" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="application-name" content="Baun AI Tutor" />
        <meta name="msapplication-TileColor" content="#FFC72C" />
        <meta name="msapplication-tap-highlight" content="no" />
        <meta name="msapplication-navbutton-color" content="#FFC72C" />
        <link rel="manifest" href="/ai/manifest.json" crossOrigin="use-credentials" />
        <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover" />
        <link rel="preload" href="/ai/icons/apple-splash-1125-2436.png" as="image" />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-white text-black dark:bg-zinc-900 dark:text-white`}
      >
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}
