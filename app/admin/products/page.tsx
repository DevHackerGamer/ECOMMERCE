"use client";
import { useEffect, useRef, useState, DragEvent } from "react";

type Product = {
  id?: string;
  title: string;
  brand?: string;
  price: number;
  sizesAvailable?: string[];
  status: "available" | "sold_out";
  images?: string[];
};

export default function AdminProductsPage() {
  const [items, setItems] = useState<Product[]>([]);
  const [allItems, setAllItems] = useState<Product[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState<Product>({ title: "", brand: "", price: 0, status: "available", images: [], sizesAvailable: [] });
  const [showCreate, setShowCreate] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  async function loadAll() {
    setLoading(true);
    try {
      const p = await fetch('/api/products').then(r => r.json());
      setAllItems(p);
      setItems(p);
    } finally { setLoading(false); }
  }
  useEffect(() => { loadAll(); }, []);

  useEffect(() => {
    const q = search.trim().toLowerCase();
    const t = setTimeout(() => {
      if (!q) {
        setItems(allItems);
        return;
      }
      const filtered = allItems.filter((it) =>
        (it.title || '').toLowerCase().includes(q) || (it.brand || '').toLowerCase().includes(q)
      );
      setItems(filtered);
    }, 200);
    return () => clearTimeout(t);
  }, [search, allItems]);

  async function save(e: React.FormEvent) {
    e.preventDefault();
    const method = form.id ? 'PUT' : 'POST';
    const url = form.id ? `/api/products/${form.id}` : '/api/products';
    const payload = { ...form, price: Number(form.price) };
    const res = await fetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
    if (!res.ok) return alert('Save failed');
    setForm({ title: "", brand: "", price: 0, status: "available", images: [], sizesAvailable: [] });
    await loadAll();
  }

  async function remove(id?: string) {
    if (!id) return;
    if (!confirm('Delete product?')) return;
    const res = await fetch(`/api/products/${id}`, { method: 'DELETE' });
    if (!res.ok) return alert('Delete failed');
    await loadAll();
  }

  function onBrowseClick() { fileInputRef.current?.click(); }
  async function handleFiles(files: FileList | File[]) {
    const arr = Array.from(files);
    if (!arr.length) return;
    setUploading(true);
    try {
      const fd = new FormData();
      for (const f of arr) fd.append('files', f);
      const res = await fetch('/api/upload?folder=products', { method: 'POST', body: fd });
      if (!res.ok) throw new Error('Upload failed');
      const j = await res.json();
      const urls: string[] = j.urls || [];
      setForm(prev => ({ ...prev, images: [...(prev.images || []), ...urls] }));
    } finally { setUploading(false); }
  }
  function onDrop(e: DragEvent<HTMLDivElement>) { e.preventDefault(); setIsDragging(false); if (e.dataTransfer?.files?.length) handleFiles(e.dataTransfer.files); }
  function onDragOver(e: DragEvent<HTMLDivElement>) { e.preventDefault(); setIsDragging(true); }
  function onDragLeave(e: DragEvent<HTMLDivElement>) { e.preventDefault(); setIsDragging(false); }

  return (
    <section>
      <h2>Products</h2>
      <div style={{ display: 'flex', gap: '.5rem', alignItems: 'center', marginBottom: '.5rem' }}>
        {!showCreate ? (
          <>
            <input placeholder="Search products by title..." value={search} onChange={e => setSearch(e.target.value)} style={{ flex: 1, padding: '.5rem' }} />
            <button
              type="button"
              onClick={() => { setSearch(''); loadAll(); }}
              disabled={loading}
            >
              Reset
            </button>
            <button type="button" onClick={() => { setShowCreate(v => !v); if (!showCreate) setForm({ title: "", brand: "", price: 0, status: "available", images: [], sizesAvailable: [] }); }}>
              New Product
            </button>
          </>
        ) : (
          <button type="button" onClick={() => { setShowCreate(false); }}>
            Close Form
          </button>
        )}
      </div>
      {showCreate && (
      <form onSubmit={save} style={{ display: 'grid', gap: '.5rem', maxWidth: 600, marginBottom: '1rem' }}>
        <input placeholder="Title" value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} />
        <input placeholder="Brand" value={form.brand} onChange={e => setForm({ ...form, brand: e.target.value })} />
        <input type="number" step="0.01" placeholder="Price" value={form.price} onChange={e => setForm({ ...form, price: Number(e.target.value) })} />
        <input placeholder="Sizes (comma separated)" value={(form.sizesAvailable || []).join(',')} onChange={e => setForm({ ...form, sizesAvailable: e.target.value.split(',').map(s => s.trim()).filter(Boolean) })} />
        <select value={form.status} onChange={e => setForm({ ...form, status: e.target.value as any })}>
          <option value="available">available</option>
          <option value="sold_out">sold_out</option>
        </select>
        <div onDrop={onDrop} onDragOver={onDragOver} onDragLeave={onDragLeave} style={{ padding: '1rem', border: '2px dashed #ccc', borderColor: isDragging ? '#2563eb' : '#ccc', borderRadius: 8 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '.75rem', flexWrap: 'wrap' }}>
            <div style={{ fontSize: '.9rem' }}>Drag & drop product images here, or <button type="button" onClick={onBrowseClick} style={{ marginLeft: 8 }}>browse</button></div>
            <input ref={fileInputRef} type="file" accept="image/*" multiple onChange={(e) => e.target.files && handleFiles(e.target.files)} style={{ display: 'none' }} />
            {uploading && <span style={{ fontSize: '.85rem' }}>Uploading…</span>}
          </div>
          {(form.images?.length || 0) > 0 && (
            <div style={{ marginTop: '.75rem', display: 'flex', gap: '.5rem', flexWrap: 'wrap' }}>
              {(form.images || []).map((url, idx) => (
                <div key={idx} style={{ position: 'relative' }}>
                  <img src={url} alt="preview" style={{ width: 72, height: 72, objectFit: 'cover', borderRadius: 6, border: '1px solid #e5e7eb' }} />
                  <button type="button" onClick={() => setForm(prev => ({ ...prev, images: (prev.images || []).filter((_, i) => i !== idx) }))} style={{ position: 'absolute', top: -6, right: -6, background: '#fff', border: '1px solid #ddd', borderRadius: 999, width: 22, height: 22, lineHeight: '20px', textAlign: 'center', cursor: 'pointer' }} title="Remove">×</button>
                </div>
              ))}
            </div>
          )}
        </div>
        <div style={{ display: 'flex', gap: '.5rem' }}>
          <button type="submit">{form.id ? 'Update' : 'Create'} Product</button>
          {form.id && <button type="button" onClick={() => setForm({ title: "", brand: "", price: 0, status: "available", images: [], sizesAvailable: [] })}>Cancel</button>}
        </div>
      </form>
      )}

      <div style={{ marginTop: '1rem', display: 'grid', gap: '.5rem' }}>
        {items.map(p => (
          <div key={p.id} style={{ display: 'grid', gridTemplateColumns: '1fr auto auto', gap: '.5rem', alignItems: 'center' }}>
            <div>
              <div style={{ fontWeight: 600 }}>{p.title}</div>
              <div style={{ fontSize: '.85rem', opacity: .7 }}>{p.brand} · R{(p.price || 0).toFixed(2)} · {p.status}</div>
            </div>
            <button onClick={() => { setShowCreate(true); setForm({ ...p, images: p.images || [], sizesAvailable: p.sizesAvailable || [] }); }}>Edit</button>
            <button onClick={() => remove(p.id)}>Delete</button>
          </div>
        ))}
        {loading && <div>Loading…</div>}
      </div>
    </section>
  );
}
