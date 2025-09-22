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

  if (authed === null) return <div className="admin-container">Loading…</div>;
  if (authed) return null;

  return (
    <div className="admin-container" style={{ maxWidth: 480 }}>
      <h1 className="admin-title">Admin Login</h1>
      <form onSubmit={login} className="admin-form" style={{ maxWidth: 420 }}>
        <input
          className="admin-input"
          type="password"
          placeholder="Admin password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <div className="admin-actions">
          <button type="submit" className="admin-btn primary">Log in</button>
        </div>
      </form>
    </div>
  );
}
