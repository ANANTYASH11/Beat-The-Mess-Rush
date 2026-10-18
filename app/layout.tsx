import type { Metadata, Viewport } from 'next';
import { Bebas_Neue, Fraunces, IBM_Plex_Mono } from 'next/font/google';
import './globals.css';
import Navbar from '@/components/Navbar';
import PwaRegister from '@/components/PwaRegister';
import Link from 'next/link';
import HomeFooter from '@/components/home/HomeFooter';
import { brand } from '@/config/university';

// Headings & display: 1 weight (400), Latin subset, preloaded
const bebasNeue = Bebas_Neue({
  subsets: ['latin'],
  variable: '--font-condensed',
  weight: ['400'],
  display: 'swap',
  preload: true,
});

// Editorial accent: 1 weight (400), not preloaded
const fraunces = Fraunces({
  subsets: ['latin'],
  variable: '--font-accent',
  weight: ['400'],
  display: 'swap',
  preload: false,
});

// Data & labels: 3 weights (400, 600, 700), not preloaded
const ibmPlexMono = IBM_Plex_Mono({
  subsets: ['latin'],
  variable: '--font-mono',
  weight: ['400', '600', '700'],
  display: 'swap',
  preload: false,
});

export const metadata: Metadata = {
  title: {
    default: `${brand.name} | ${brand.tagline}`,
    template: `%s | ${brand.name}`,
  },
  description: `${brand.tagline} ${brand.descriptor}`,
  manifest: '/manifest.json',
  icons: {
    icon: '/icon.svg',
    shortcut: '/favicon.ico',
    apple: '/icon-180.png',
  },
  openGraph: {
    title: `${brand.name} | ${brand.tagline}`,
    description: `${brand.tagline} ${brand.descriptor}`,
    type: 'website',
    siteName: brand.name,
  },
  twitter: {
    card: 'summary_large_image',
    title: `${brand.name} | ${brand.tagline}`,
    description: `${brand.tagline} ${brand.descriptor}`,
  },
};

export const viewport: Viewport = {
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#F4ECD8' },
    { media: '(prefers-color-scheme: dark)', color: '#0B0D10' },
  ],
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',
};

import { Suspense } from 'react';
import { SelectedMessProvider } from '@/hooks/useSelectedMess';

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const fontVars = `${bebasNeue.variable} ${fraunces.variable} ${ibmPlexMono.variable}`;

  return (
    <html lang="en" className={`light ${fontVars}`} suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              try {
                var urlParams = new URLSearchParams(window.location.search);
                var urlTheme = urlParams.get('theme');
                var stored = urlTheme || localStorage.getItem('theme');
                if (stored === 'dark') {
                  document.documentElement.classList.remove('light');
                  document.documentElement.classList.add('dark');
                } else {
                  document.documentElement.classList.remove('dark');
                  document.documentElement.classList.add('light');
                }
              } catch (e) {}
            `,
          }}
        />
      </head>
      <body
        className={`${fontVars} font-body min-h-screen flex flex-col bg-bg text-ink relative selection:bg-saffron selection:text-ink`}
      >
        {/* Paper Grain: Desktop only (SVG feTurbulence is bypassed on touch devices for 60fps scrolling) */}
        <div
          aria-hidden="true"
          className="fixed inset-0 pointer-events-none z-[9999] opacity-[0.05] contrast-125 hidden md:block"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
          }}
        />
        <Suspense fallback={null}>
          <SelectedMessProvider>
            <PwaRegister />
            <Navbar />
            <main className="flex-1">{children}</main>
            <HomeFooter />
          </SelectedMessProvider>
        </Suspense>
      </body>
    </html>
  );
}
