"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const [authed, setAuthed] = useState<boolean | null>(null);
  const [checked, setChecked] = useState(false);
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    let cancelled = false;
    setChecked(false);
    (async () => {
      try {
        const res = await fetch("/api/admin/status", { cache: 'no-store' });
        const j = await res.json();
        if (!cancelled) setAuthed(!!j.authenticated);
      } catch {
        if (!cancelled) setAuthed(false);
      } finally {
        if (!cancelled) setChecked(true);
      }
    })();
    return () => { cancelled = true; };
  }, [pathname]);

  // If not authenticated and not on the login page, redirect to /admin
  useEffect(() => {
    if (checked && authed === false && pathname !== '/admin') {
      router.replace('/admin');
    }
  }, [checked, authed, pathname, router]);

  async function logout() {
    await fetch('/api/admin/logout', { method: 'POST' });
    setAuthed(false);
    router.push('/admin');
  }

  if (!checked) return <div className="admin-container">Loading…</div>;
  // When logged out, allow the /admin index route to render its own login UI
  if (authed === false) {
    if (pathname === '/admin') {
      return <div className="admin-container">{children}</div>;
    }
    // For any other admin route, a redirect is scheduled; show a small placeholder
    return <div className="admin-container">Redirecting to login…</div>;
  }

  const tabs = [
    { href: '/admin/products', label: 'Products' },
    { href: '/admin/orders', label: 'Orders' },
    { href: '/admin/promotions', label: 'Promotions' },
  ];

  return (
    <div className="admin-container">
      <div className="admin-header">
        <h1 className="admin-title">Admin</h1>
        <button className="admin-logout" onClick={logout}>Log out</button>
      </div>
      <div className="admin-tabs">
        {tabs.map(t => (
          <Link
            key={t.href}
            href={t.href}
            className={`admin-tab${pathname === t.href ? ' active' : ''}`}
          >
            {t.label}
          </Link>
        ))}
      </div>
      <div className="admin-section">
        {children}
      </div>
    </div>
  );
}
