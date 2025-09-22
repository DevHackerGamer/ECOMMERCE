'use client';
import Link from 'next/link';
import Image from 'next/image';
import { routePaths } from '../lib/routes';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';

export function NavBar() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const links = [
    { href: routePaths.catalog, label: 'Catalog' },
    { href: routePaths.about, label: 'About' },
    { href: routePaths.contact, label: 'Contact' },
    { href: routePaths.cart, label: 'Cart' }
  ];

  const closeMenu = () => setOpen(false);

  // Toggle a body class so we can blur background content (works even if backdrop-filter isn't supported)
  useEffect(() => {
    if (open) document.body.classList.add('menu-open');
    else document.body.classList.remove('menu-open');
    return () => document.body.classList.remove('menu-open');
  }, [open]);

  return (
    <header className="site-header">
      <div className="container">
        <nav className="primary-nav">
          {/* Desktop/Large screens: show brand logo */}
          <Link href={routePaths.home} className="brand" aria-label="BigDawg home" prefetch={false}>
            <Image src="/STORE_2.svg" alt="BigDawg" width={1200} height={300} className="brand-logo" />
          </Link>

          {/* Mobile: centered logo in sticky header */}
          <Link
            href={routePaths.home}
            className="mobile-brand"
            aria-label="BigDawg home"
            prefetch={false}
          >
            <Image
              src="/mobileLogo.png"
              alt="BigDawg"
              width={1000}
              height={300}
              className="mobile-brand-logo"
              priority
            />
          </Link>

          {/* Desktop links */}
          <div className="nav-links">
            {links.map(l => (
              <Link
                key={l.href}
                href={l.href}
                prefetch={false}
                className={`link${pathname === l.href ? ' active' : ''}`}
                aria-current={pathname === l.href ? 'page' : undefined}
              >{l.label}</Link>
            ))}
          </div>

          {/* Mobile menu toggle */}
          <button
            className="menu-toggle"
            aria-controls="mobile-menu"
            aria-expanded={open}
            onClick={() => setOpen(v => !v)}
            aria-label={open ? 'Close menu' : 'Open menu'}
          >
            <span className="menu-icon" aria-hidden>☰</span>
          </button>
        </nav>
      </div>

      {/* Mobile slide-down menu */}
      <div id="mobile-menu" className={`mobile-menu${open ? ' open' : ''}`}>
        <div className="container">
          {/* Home link at top for easy return */}
          <Link
            key="home"
            href={routePaths.home}
            prefetch={false}
            className={`mobile-link${pathname === routePaths.home ? ' active' : ''}`}
            onClick={closeMenu}
            aria-current={pathname === routePaths.home ? 'page' : undefined}
          >Home</Link>

          {links.map(l => (
            <Link
              key={l.href}
              href={l.href}
              prefetch={false}
              className={`mobile-link${pathname === l.href ? ' active' : ''}`}
              onClick={closeMenu}
              aria-current={pathname === l.href ? 'page' : undefined}
            >{l.label}</Link>
          ))}
        </div>
      </div>
    </header>
  );
}
