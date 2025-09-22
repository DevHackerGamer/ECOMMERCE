"use client";
import { useEffect, useRef, useState, DragEvent } from "react";
import { useToast } from "../../../components/ToastProvider";

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
  const { notify, confirm } = useToast();
  const [items, setItems] = useState<Product[]>([]);
  const [allItems, setAllItems] = useState<Product[]>([]);
  const [page, setPage] = useState(1);
  const [hasNext, setHasNext] = useState(false);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState<Product>({ title: "", brand: "", price: 0, status: "available", images: [], sizesAvailable: [] });
  const [showCreate, setShowCreate] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  async function loadAll(p = 1) {
    setLoading(true);
    try {
  const res = await fetch(`/api/products?page=${p}&limit=10`).then(r => r.json());
      const data = res?.items ?? [];
      setAllItems(data);
      setItems(data);
      setHasNext(!!res?.hasNext);
      setPage(p);
    } finally { setLoading(false); }
  }
  useEffect(() => { loadAll(1); }, []);

  useEffect(() => {
    const q = search.trim().toLowerCase();
    const t = setTimeout(async () => {
      if (!q) {
        setItems(allItems);
        return;
      }
      try {
        // Fetch a reasonable chunk only when searching so filter applies broadly but stays light
        const res = await fetch('/api/products?limit=200', { cache: 'no-store' }).then(r => r.json());
        const all: Product[] = Array.isArray(res) ? res as Product[] : (res?.items ?? []);
        const filtered = all.filter((it) =>
          (it.title || '').toLowerCase().includes(q) || (it.brand || '').toLowerCase().includes(q)
        );
        // Cap visible results to avoid overwhelming the UI
        setItems(filtered.slice(0, 24));
      } catch {
        // ignore
      }
    }, 200);
    return () => clearTimeout(t);
  }, [search, allItems]);

  async function save(e: React.FormEvent) {
    e.preventDefault();
    const method = form.id ? 'PUT' : 'POST';
    const url = form.id ? `/api/products/${form.id}` : '/api/products';
    const payload = { ...form, price: Number(form.price) };
    const res = await fetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
    if (!res.ok) { notify('Save failed', { type: 'error' }); return; }
    setForm({ title: "", brand: "", price: 0, status: "available", images: [], sizesAvailable: [] });
    await loadAll();
    notify(form.id ? 'Product updated' : 'Product created', { type: 'success' });
  }

  async function remove(id?: string) {
    if (!id) return;
    const ok = await confirm({ title: 'Delete product', message: 'Are you sure you want to delete this product?', confirmText: 'Delete', cancelText: 'Cancel' });
    if (!ok) return;
    const res = await fetch(`/api/products/${id}`, { method: 'DELETE' });
    if (!res.ok) { notify('Delete failed', { type: 'error' }); return; }
    await loadAll();
    notify('Product deleted', { type: 'success' });
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
    <section className="admin-section">
      <h2 className="admin-h2">Products</h2>
      <div className="admin-toolbar">
        {!showCreate ? (
          <>
            <input className="admin-input grow" placeholder="Filter products..." value={search} onChange={e => setSearch(e.target.value)} />
            <button className="admin-btn" type="button" onClick={() => { setSearch(''); loadAll(1); }} disabled={loading}>Reset</button>
            <button className="admin-btn primary" type="button" onClick={() => { setShowCreate(v => !v); if (!showCreate) setForm({ title: "", brand: "", price: 0, status: "available", images: [], sizesAvailable: [] }); }}>
              New Product
            </button>
          </>
        ) : (
          <button className="admin-btn" type="button" onClick={() => { setShowCreate(false); }}>
            Close Form
          </button>
        )}
      </div>
      {showCreate && (
      <form onSubmit={save} className="admin-form" style={{ maxWidth: 600, marginBottom: '1rem' }}>
        <input className="admin-input" placeholder="Title" value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} />
        <input className="admin-input" placeholder="Brand" value={form.brand} onChange={e => setForm({ ...form, brand: e.target.value })} />
        <input className="admin-input" type="number" step="0.01" placeholder="Price" value={form.price} onChange={e => setForm({ ...form, price: Number(e.target.value) })} />
        <input className="admin-input" placeholder="Sizes (comma separated)" value={(form.sizesAvailable || []).join(',')} onChange={e => setForm({ ...form, sizesAvailable: e.target.value.split(',').map(s => s.trim()).filter(Boolean) })} />
        <select className="admin-select" value={form.status} onChange={e => setForm({ ...form, status: e.target.value as any })}>
          <option value="available">available</option>
          <option value="sold_out">sold_out</option>
        </select>
        <div onDrop={onDrop} onDragOver={onDragOver} onDragLeave={onDragLeave} className="admin-dropzone" style={{ borderColor: isDragging ? '#2563eb' : undefined }}>
          <div className="admin-toolbar" style={{ justifyContent: 'space-between' }}>
            <div className="adm-muted">Drag & drop product images here, or <button className="admin-btn" type="button" onClick={onBrowseClick} style={{ marginLeft: 8 }}>browse</button></div>
            <input ref={fileInputRef} type="file" accept="image/*" multiple onChange={(e) => e.target.files && handleFiles(e.target.files)} style={{ display: 'none' }} />
            {uploading && <span className="adm-muted">Uploading…</span>}
          </div>
          {(form.images?.length || 0) > 0 && (
            <div className="admin-thumb-grid" style={{ marginTop: '.75rem' }}>
              {(form.images || []).map((url, idx) => (
                <div key={idx} style={{ position: 'relative' }}>
                  <img src={url} alt="preview" className="admin-thumb" />
                  <button
                    type="button"
                    onClick={() => setForm(prev => ({ ...prev, images: (prev.images || []).filter((_, i) => i !== idx) }))}
                    title="Remove"
                    style={{ position: 'absolute', top: -6, right: -6, background: '#fff', border: '1px solid #ddd', borderRadius: 999, width: 22, height: 22, lineHeight: '20px', textAlign: 'center', cursor: 'pointer' }}
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
        <div className="admin-actions">
          <button className="admin-btn primary" type="submit">{form.id ? 'Update' : 'Create'} Product</button>
          {form.id && <button className="admin-btn" type="button" onClick={() => setForm({ title: "", brand: "", price: 0, status: "available", images: [], sizesAvailable: [] })}>Cancel</button>}
        </div>
      </form>
      )}

      <div className="admin-list" style={{ marginTop: '1rem' }}>
        {items.map(p => (
          <div key={p.id} className="admin-row">
            <div>
              <div style={{ fontWeight: 600 }}>{p.title}</div>
              <div className="admin-row-meta">{p.brand} · R{(p.price || 0).toFixed(2)} · {p.status}</div>
            </div>
            <div className="admin-row-actions">
              <button className="admin-btn" onClick={() => { setShowCreate(true); setForm({ ...p, images: p.images || [], sizesAvailable: p.sizesAvailable || [] }); }}>Edit</button>
              <button className="admin-btn danger" onClick={() => remove(p.id)}>Delete</button>
            </div>
          </div>
        ))}
        {loading && <div className="adm-muted">Loading…</div>}
        {!loading && (
          <div className="admin-actions" style={{ justifyContent: 'center', marginTop: '.75rem' }}>
            <button className="admin-btn" disabled={page <= 1} onClick={() => loadAll(page - 1)}>Previous</button>
            <button className="admin-btn" disabled={!hasNext} onClick={() => loadAll(page + 1)} style={{ marginLeft: '.5rem' }}>Next</button>
          </div>
        )}
      </div>
    </section>
  );
}
