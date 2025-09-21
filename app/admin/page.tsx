"use client";
import { useEffect, useState, useRef, DragEvent } from "react";

type Product = {
  id?: string;
  title: string;
  brand?: string;
  price: number;
  sizesAvailable?: string[];
  status: "available" | "sold_out";
  images?: string[];
};

type Order = {
  id?: string;
  productIds: string[];
  email: string;
  shipping: any;
  price: number;
  size?: string;
  paymentMethod?: string;
  status: "awaiting_payment" | "paid" | "shipped" | "completed";
};

export default function AdminPage() {
  const [authed, setAuthed] = useState<boolean | null>(null);
  const [password, setPassword] = useState("");
  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [form, setForm] = useState<Product>({ title: "", brand: "", price: 0, status: "available", images: [], sizesAvailable: [] });

  async function checkAuth() {
    const res = await fetch("/api/admin/status");
    const j = await res.json();
    setAuthed(!!j.authenticated);
  }

  useEffect(() => {
    checkAuth();
  }, []);

  async function login(e: React.FormEvent) {
    e.preventDefault();
    const res = await fetch("/api/admin/login", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ password }) });
    if (res.ok) {
      setPassword("");
      await checkAuth();
      await loadData();
    } else {
      alert("Invalid password");
    }
  }

  async function logout() {
    await fetch("/api/admin/logout", { method: "POST" });
    setAuthed(false);
  }

  async function loadData() {
    const [p, o] = await Promise.all([
      fetch("/api/products").then((r) => r.json()),
      fetch("/api/orders").then((r) => (r.ok ? r.json() : [])),
    ]);
    setProducts(p);
    setOrders(o);
  }

  useEffect(() => {
    if (authed) loadData();
  }, [authed]);

  async function saveProduct(e: React.FormEvent) {
    e.preventDefault();
    const method = form.id ? "PUT" : "POST";
    const url = form.id ? `/api/products/${form.id}` : "/api/products";
    const payload = { ...form, price: Number(form.price) };
    const res = await fetch(url, { method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
    if (!res.ok) return alert("Save failed");
    setForm({ title: "", brand: "", price: 0, status: "available", images: [], sizesAvailable: [] });
    await loadData();
  }

  async function editProduct(p: Product) {
    setForm({ ...p });
  }

  async function deleteProductById(id?: string) {
    if (!id) return;
    if (!confirm("Delete product?")) return;
    const res = await fetch(`/api/products/${id}`, { method: "DELETE" });
    if (!res.ok) return alert("Delete failed");
    await loadData();
  }

  async function updateOrderStatus(id?: string, status?: Order["status"]) {
    if (!id || !status) return;
    const res = await fetch(`/api/orders/${id}`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ status }) });
    if (!res.ok) return alert("Update failed");
    await loadData();
  }

  // Image upload handlers
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [uploading, setUploading] = useState(false);

  function onBrowseClick() {
    fileInputRef.current?.click();
  }

  async function handleFiles(files: FileList | File[]) {
    const arr = Array.from(files);
    if (!arr.length) return;
    setUploading(true);
    try {
      const fd = new FormData();
      for (const f of arr) fd.append('files', f);
      const res = await fetch('/api/upload', { method: 'POST', body: fd });
      if (!res.ok) throw new Error('Upload failed');
      const j = await res.json();
      const urls: string[] = j.urls || [];
      setForm((prev) => ({ ...prev, images: [...(prev.images || []), ...urls] }));
    } catch (err) {
      console.error(err);
      alert("Image upload failed. Please try again.");
    } finally {
      setUploading(false);
    }
  }

  function onDrop(e: DragEvent<HTMLDivElement>) {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    if (e.dataTransfer?.files?.length) {
      void handleFiles(e.dataTransfer.files);
    }
  }

  function onDragOver(e: DragEvent<HTMLDivElement>) {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  }

  function onDragLeave(e: DragEvent<HTMLDivElement>) {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  }

  if (authed === false) {
    return (
      <div style={{ maxWidth: 420, margin: "2rem auto" }}>
        <h1>Admin Login</h1>
        <form onSubmit={login}>
          <input
            type="password"
            placeholder="Admin password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            style={{ width: "100%", padding: ".6rem", marginBottom: ".75rem" }}
          />
          <button type="submit" style={{ padding: ".6rem 1rem" }}>Log in</button>
        </form>
      </div>
    );
  }

  if (authed === null) return <div style={{ padding: "2rem" }}>Loading…</div>;

  return (
    <div style={{ padding: "2rem", display: "grid", gap: "2rem" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <h1>Admin</h1>
        <button onClick={logout}>Log out</button>
      </div>

      <section>
        <h2>Products</h2>
        <form onSubmit={saveProduct} style={{ display: "grid", gap: ".5rem", maxWidth: 600 }}>
          <input placeholder="Title" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
          <input placeholder="Brand" value={form.brand} onChange={(e) => setForm({ ...form, brand: e.target.value })} />
          <input type="number" step="0.01" placeholder="Price" value={form.price} onChange={(e) => setForm({ ...form, price: Number(e.target.value) })} />
          <input placeholder="Sizes (comma separated)" value={(form.sizesAvailable || []).join(",")} onChange={(e) => setForm({ ...form, sizesAvailable: e.target.value.split(",").map((s) => s.trim()).filter(Boolean) })} />
          <select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value as any })}>
            <option value="available">available</option>
            <option value="sold_out">sold_out</option>
          </select>
          {/* Image Uploader */}
          <div
            onDrop={onDrop}
            onDragOver={onDragOver}
            onDragLeave={onDragLeave}
            style={{
              padding: "1rem",
              border: "2px dashed #ccc",
              borderColor: isDragging ? "#2563eb" : "#ccc",
              borderRadius: 8,
              background: isDragging ? "#f0f6ff" : "transparent",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: ".75rem", flexWrap: "wrap" }}>
              <div style={{ fontSize: ".9rem" }}>
                Drag & drop product images here, or
                <button type="button" onClick={onBrowseClick} style={{ marginLeft: 8 }}>browse</button>
              </div>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                multiple
                onChange={(e) => e.target.files && handleFiles(e.target.files)}
                style={{ display: "none" }}
              />
              {uploading && <span style={{ fontSize: ".85rem" }}>Uploading…</span>}
            </div>
            {(form.images?.length || 0) > 0 && (
              <div style={{ marginTop: ".75rem", display: "flex", gap: ".5rem", flexWrap: "wrap" }}>
                {(form.images || []).map((url, idx) => (
                  <div key={idx} style={{ position: "relative" }}>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={url} alt="preview" style={{ width: 72, height: 72, objectFit: "cover", borderRadius: 6, border: "1px solid #e5e7eb" }} />
                    <button
                      type="button"
                      onClick={() => setForm((prev) => ({ ...prev, images: (prev.images || []).filter((_, i) => i !== idx) }))}
                      style={{ position: "absolute", top: -6, right: -6, background: "#fff", border: "1px solid #ddd", borderRadius: 999, width: 22, height: 22, lineHeight: "20px", textAlign: "center", cursor: "pointer" }}
                      title="Remove"
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
          <div style={{ display: "flex", gap: ".5rem" }}>
            <button type="submit">{form.id ? "Update" : "Create"} Product</button>
            {form.id && (
              <button type="button" onClick={() => setForm({ title: "", brand: "", price: 0, status: "available", images: [], sizesAvailable: [] })}>Cancel</button>
            )}
          </div>
        </form>

        <div style={{ marginTop: "1rem", display: "grid", gap: ".5rem" }}>
          {products.map((p) => (
            <div key={p.id} style={{ display: "grid", gridTemplateColumns: "1fr auto auto", gap: ".5rem", alignItems: "center" }}>
              <div>
                <div style={{ fontWeight: 600 }}>{p.title}</div>
                <div style={{ fontSize: ".85rem", opacity: .7 }}>{p.brand} · ${(p.price || 0).toFixed(2)} · {p.status}</div>
              </div>
              <button onClick={() => editProduct(p)}>Edit</button>
              <button onClick={() => deleteProductById(p.id)}>Delete</button>
            </div>
          ))}
        </div>
      </section>

      <section>
        <h2>Orders</h2>
        <div style={{ display: "grid", gap: ".5rem" }}>
          {orders.map((o) => (
            <div key={o.id} style={{ display: "grid", gridTemplateColumns: "1fr auto", gap: ".5rem", alignItems: "center" }}>
              <div>
                <div style={{ fontWeight: 600 }}>{o.email}</div>
                <div style={{ fontSize: ".85rem", opacity: .8 }}>Items: {o.productIds?.length || 0} · ${(o.price || 0).toFixed(2)} · {o.status}</div>
              </div>
              <div style={{ display: "flex", gap: ".25rem" }}>
                {(["awaiting_payment", "paid", "shipped", "completed"] as const).map((s) => (
                  <button key={s} disabled={o.status === s} onClick={() => updateOrderStatus(o.id, s)}>{s}</button>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
