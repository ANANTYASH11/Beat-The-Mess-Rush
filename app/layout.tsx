import type { Metadata, Viewport } from 'next';
import { Bebas_Neue, Fraunces, IBM_Plex_Mono, Inter, Caveat } from 'next/font/google';
import './globals.css';
import Navbar from '@/components/Navbar';
import PwaRegister from '@/components/PwaRegister';
import Link from 'next/link';
import HomeFooter from '@/components/home/HomeFooter';
import { brand } from '@/config/university';

const bebasNeue = Bebas_Neue({
  subsets: ['latin'],
  variable: '--font-condensed',
  weight: ['400'],
  display: 'swap',
});

const fraunces = Fraunces({
  subsets: ['latin'],
  variable: '--font-accent',
  style: ['normal', 'italic'],
  display: 'swap',
});

const ibmPlexMono = IBM_Plex_Mono({
  subsets: ['latin'],
  variable: '--font-mono',
  weight: ['400', '500', '600', '700'],
  display: 'swap',
});

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-body',
  display: 'swap',
});

const caveat = Caveat({
  subsets: ['latin'],
  variable: '--font-handwriting',
  weight: ['600', '700'],
  display: 'swap',
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
  themeColor: '#F4ECD8',
  width: 'device-width',
  initialScale: 1,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const fontVars = `${bebasNeue.variable} ${fraunces.variable} ${ibmPlexMono.variable} ${inter.variable} ${caveat.variable}`;

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
        {/* Paper Grain: SVG feTurbulence overlay at 5% opacity, fixed, pointer-events: none */}
        <div
          aria-hidden="true"
          className="fixed inset-0 pointer-events-none z-[9999] opacity-[0.05] contrast-125"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
          }}
        />
        <PwaRegister />
        <Navbar />
        <main className="flex-1">{children}</main>
        <HomeFooter />
      </body>
    </html>
  );
}
