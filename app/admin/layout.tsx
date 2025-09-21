"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const [authed, setAuthed] = useState<boolean | null>(null);
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    (async () => {
      const res = await fetch("/api/admin/status");
      const j = await res.json();
      setAuthed(!!j.authenticated);
    })();
  }, []);

  async function logout() {
    await fetch('/api/admin/logout', { method: 'POST' });
    setAuthed(false);
    router.push('/admin');
  }

  if (authed === null) return <div style={{ padding: '2rem' }}>Loading…</div>;
  if (!authed) return (
    <div style={{ maxWidth: 420, margin: '2rem auto', textAlign: 'center' }}>
      <h1>Admin</h1>
      <p>You must log in to access the admin. <Link href="/admin">Go to login</Link></p>
    </div>
  );

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
