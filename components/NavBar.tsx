'use client';
import Link from 'next/link';
import { routePaths } from '../lib/routes';
import { usePathname } from 'next/navigation';

export function NavBar() {
  const pathname = usePathname();
  const links = [
    { href: routePaths.catalog, label: 'Catalog' },
    { href: routePaths.about, label: 'About' },
    { href: routePaths.contact, label: 'Contact' },
    { href: routePaths.account, label: 'Account' },
    { href: routePaths.cart, label: 'Cart' }
  ];
  return (
    <header className="site-header">
      <div className="container">
        <nav className="primary-nav">
          <Link href={routePaths.home} className="brand">BigDawg</Link>
          {links.map(l => (
            <Link
              key={l.href}
              href={l.href}
              className={`link${pathname === l.href ? ' active' : ''}`}
              aria-current={pathname === l.href ? 'page' : undefined}
            >{l.label}</Link>
          ))}
        </nav>
      </div>
    </header>
  );
}
