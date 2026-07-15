import type { Metadata, Viewport } from 'next';
import { cormorant, jetbrainsMono } from '@/lib/fonts';
import SiteHeader from '@/components/SiteHeader';
import MagneticCursor from '@/components/MagneticCursor';
import './globals.css';

export const metadata: Metadata = {
  metadataBase: new URL('https://vanta.example'),
  title: 'VANTA — Time, perfected. Then left alone.',
  description:
    'VANTA, Maison Horologère, established 1971. Mechanical watches of obsessive precision and quiet power. Five years of development. Two seconds of tolerance.',
  keywords: ['VANTA', 'luxury watch', 'horology', 'mechanical watch', 'tourbillon', 'Vallée de Joux'],
  openGraph: {
    title: 'VANTA — Maison Horologère',
    description: 'Time, perfected. Then left alone.',
    type: 'website',
    locale: 'en_GB',
  },
  robots: { index: true, follow: true },
};

export const viewport: Viewport = {
  themeColor: '#0A0A0A',
  width: 'device-width',
  initialScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${cormorant.variable} ${jetbrainsMono.variable}`}>
      <body className="bg-vanta font-display text-platinum antialiased">
        <SiteHeader />
        {children}
        <MagneticCursor />
      </body>
    </html>
  );
}
