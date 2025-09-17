import Link from 'next/link';
import { routePaths } from '../lib/routes';

export function Footer() {
  return (
    <footer className="site-footer">
      <div className="container">
        <div className="cols">
          <div>
            <h4>Marketplace</h4>
            <Link href={routePaths.catalog}>Catalog</Link>
            <Link href={routePaths.account}>Account</Link>
            <Link href={routePaths.cart}>Cart</Link>
          </div>
          <div>
            <h4>Company</h4>
            <Link href={routePaths.about}>About</Link>
            <Link href={routePaths.contact}>Contact</Link>
              <Link href="/admin">Admin</Link>
          </div>
          <div>
            <h4>Legal</h4>
            <Link href={routePaths.privacy}>Privacy</Link>
            <Link href={routePaths.terms}>Terms</Link>
          </div>
        </div>
        <div className="legal">© {new Date().getFullYear()} BigDawg — Placeholder UI only. No real products offered yet.</div>
      </div>
    </footer>
  );
}
