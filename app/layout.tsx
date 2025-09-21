import './globals.css';
import type { Metadata } from 'next';
import { ReactNode } from 'react';
import { NavBar } from '../components/NavBar';
import { Footer } from '../components/Footer';

export const metadata: Metadata = {
  title: 'BigDawg Sneaker Store (Placeholder)',
  description: 'Placeholder UI scaffolding for a sneaker resell store built with Next.js',
  metadataBase: new URL('https://example.com')
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" data-scroll-behavior="smooth">
      <body>
        <NavBar />
        <main className="container">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
