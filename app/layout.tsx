import './globals.css';
import './admin/admin.css';
import type { Metadata } from 'next';
import { ReactNode } from 'react';
import { NavBar } from '../components/NavBar';
import { Footer } from '../components/Footer';
import { ToastProvider } from '../components/ToastProvider';
import { Inter, Montserrat, Bebas_Neue } from 'next/font/google';

// Load typography: Body = Inter, Headings = Montserrat, Accent = Bebas Neue
const inter = Inter({ subsets: ['latin'], variable: '--font-body' });
const montserrat = Montserrat({ subsets: ['latin'], variable: '--font-heading' });
const bebas = Bebas_Neue({ subsets: ['latin'], weight: '400', variable: '--font-accent' });

export const metadata: Metadata = {
  title: 'BigDawg Sneaker Store (Placeholder)',
  description: 'Placeholder UI scaffolding for a sneaker resell store built with Next.js',
  metadataBase: new URL('https://example.com')
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" data-scroll-behavior="smooth" className={`${inter.variable} ${montserrat.variable} ${bebas.variable}`}>
      <body>
        <ToastProvider>
          <NavBar />
          <main className="container">{children}</main>
          <Footer />
        </ToastProvider>
      </body>
    </html>
  );
}
