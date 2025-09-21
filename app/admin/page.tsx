"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function AdminIndexPage() {
  const [authed, setAuthed] = useState<boolean | null>(null);
  const [password, setPassword] = useState("");
  const router = useRouter();

  useEffect(() => {
    (async () => {
      const res = await fetch("/api/admin/status");
      const j = await res.json();
      if (j.authenticated) {
        setAuthed(true);
        router.replace('/admin/products');
      } else {
        setAuthed(false);
      }
    })();
  }, [router]);

  async function login(e: React.FormEvent) {
    e.preventDefault();
    const res = await fetch("/api/admin/login", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ password }) });
    if (res.ok) {
      setPassword("");
      router.replace('/admin/products');
    } else {
      alert("Invalid password");
    }
  }

  if (authed === null) return <div style={{ padding: '2rem' }}>Loading…</div>;
  if (authed) return null;

  return (
    <div style={{ maxWidth: 420, margin: '2rem auto' }}>
      <h1>Admin Login</h1>
      <form onSubmit={login}>
        <input
          type="password"
          placeholder="Admin password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          style={{ width: '100%', padding: '.6rem', marginBottom: '.75rem' }}
        />
        <button type="submit" style={{ padding: '.6rem 1rem' }}>Log in</button>
      </form>
    </div>
  );
}
