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

  if (!checked) return <div style={{ padding: '2rem' }}>Loading…</div>;
  // When logged out, allow the /admin index route to render its own login UI
  if (authed === false) {
    if (pathname === '/admin') {
      return <div style={{ padding: '2rem' }}>{children}</div>;
    }
    // For any other admin route, a redirect is scheduled; show a small placeholder
    return <div style={{ padding: '2rem' }}>Redirecting to login…</div>;
  }

  const tabs = [
    { href: '/admin/products', label: 'Products' },
    { href: '/admin/orders', label: 'Orders' },
    { href: '/admin/promotions', label: 'Promotions' },
  ];

  return (
    <div style={{ padding: '2rem', display: 'grid', gap: '1rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h1>Admin</h1>
        <button onClick={logout}>Log out</button>
      </div>
      <div style={{ display: 'flex', gap: '.5rem', flexWrap: 'wrap' }}>
        {tabs.map(t => (
          <Link key={t.href} href={t.href} className={`tab${pathname === t.href ? ' active' : ''}`} style={{ padding: '.4rem .7rem', border: '1px solid #e5e7eb', borderRadius: 6, background: pathname === t.href ? '#f3f4f6' : '#fff' }}>{t.label}</Link>
        ))}
      </div>
      <div>
        {children}
      </div>
    </div>
  );
}
