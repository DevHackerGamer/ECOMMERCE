'use client';
import Link from 'next/link';
import Image from 'next/image';
import { routePaths } from '../lib/routes';
import { usePathname } from 'next/navigation';
import { useState } from 'react';

export function NavBar() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const links = [
    { href: routePaths.catalog, label: 'Catalog' },
    { href: routePaths.about, label: 'About' },
    { href: routePaths.contact, label: 'Contact' },
    { href: routePaths.account, label: 'Account' },
    { href: routePaths.cart, label: 'Cart' }
  ];

  const closeMenu = () => setOpen(false);

  return (
    <header className="site-header">
      <div className="container">
        <nav className="primary-nav">
          {/* Desktop/Large screens: show brand logo */}
          <Link href={routePaths.home} className="brand" aria-label="BigDawg home">
            <Image src="/STORE_2.svg" alt="BigDawg" width={1200} height={300} priority className="brand-logo" />
          </Link>

          {/* Desktop links */}
          <div className="nav-links">
            {links.map(l => (
              <Link
                key={l.href}
                href={l.href}
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
            className={`mobile-link${pathname === routePaths.home ? ' active' : ''}`}
            onClick={closeMenu}
            aria-current={pathname === routePaths.home ? 'page' : undefined}
          >Home</Link>

          {links.map(l => (
            <Link
              key={l.href}
              href={l.href}
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
