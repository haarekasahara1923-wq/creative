import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { SessionProvider } from 'next-auth/react';
import { ToastProvider } from '@/components/ui/Toast';

const inter = Inter({ subsets: ['latin'], display: 'swap' });

export const metadata: Metadata = {
  title: 'Creative Group — Premium Real Estate in Gwalior, MP',
  description: 'Creative Group offers premium residential plots, flats (1/2/3 BHK), duplex & row houses in Gwalior, MP. Best & Affordable Prices | Premium Development | First Time in Gwalior.',
  keywords: 'real estate gwalior, plots gwalior, flats gwalior, creative group, property gwalior mp',
  openGraph: {
    title: 'Creative Group — Premium Real Estate in Gwalior',
    description: 'Best & Affordable Prices | Premium Development | First Time in Gwalior',
    type: 'website',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="scroll-smooth">
      <body className={`${inter.className} bg-slate-950 antialiased`}>
        <SessionProvider>
          <ToastProvider>
            {children}
          </ToastProvider>
        </SessionProvider>
      </body>
    </html>
  );
}
