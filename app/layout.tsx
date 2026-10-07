import type { Metadata, Viewport } from 'next';
import { Hanken_Grotesk, Instrument_Serif } from 'next/font/google';
import type { ReactNode } from 'react';
import { CartProvider } from '@/components/Cart';
import { SmoothScroll } from '@/components/motion/SmoothScroll';
import { site } from '@/lib/site';
import './globals.css';

const display = Instrument_Serif({ subsets: ['latin'], weight: '400', style: ['normal', 'italic'], variable: '--font-display' });
const body = Hanken_Grotesk({ subsets: ['latin'], variable: '--font-body' });

export const metadata: Metadata = {
  title: `${site.name} | Dog portraits by ${site.photographer}`,
  description: site.description,
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000'),
  openGraph: { title: site.name, description: site.description, images: ['/work/ruby.jpg'] },
};

export const viewport: Viewport = { themeColor: '#130B07' };

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en-GB" className={`${display.variable} ${body.variable}`}>
      <body>
        <a href="#work" className="skip">Skip to the work</a>
        <SmoothScroll>
          <CartProvider>{children}</CartProvider>
        </SmoothScroll>
      </body>
    </html>
  );
}
