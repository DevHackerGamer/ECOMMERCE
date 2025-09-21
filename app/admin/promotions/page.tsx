"use client";
import { useEffect, useRef, useState } from "react";

type Product = { id: string; title: string; brand?: string };
type Promotion = {
  id?: string;
  title: string;
  description?: string;
  active: boolean;
  bannerImage?: string;
  productIds: string[];
};

export default function AdminPromotionsPage() {
  const [items, setItems] = useState<Promotion[]>([]);
  const [search, setSearch] = useState('');
  const [results, setResults] = useState<Product[]>([]);
  const [form, setForm] = useState<Promotion>({ title: '', description: '', active: true, bannerImage: '', productIds: [] });
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  async function load() {
    const p = await fetch('/api/promotions').then(r => r.json());
    setItems(p);
  }
  useEffect(() => { load(); }, []);

  async function save(e: React.FormEvent) {
    e.preventDefault();
    const method = form.id ? 'PUT' : 'POST';
    const url = form.id ? `/api/promotions/${form.id}` : '/api/promotions';
    const res = await fetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) });
    if (!res.ok) return alert('Save failed');
    setForm({ title: '', description: '', active: true, bannerImage: '', productIds: [] });
    await load();
  }

  async function remove(id?: string) {
    if (!id) return;
    if (!confirm('Delete promotion?')) return;
    const res = await fetch(`/api/promotions/${id}`, { method: 'DELETE' });
    if (!res.ok) return alert('Delete failed');
    await load();
  }

  function onBrowseClick() { fileInputRef.current?.click(); }
  async function onFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append('files', file);
      const res = await fetch('/api/upload?folder=promotions', { method: 'POST', body: fd });
      if (!res.ok) throw new Error('Upload failed');
      const j = await res.json();
      const url: string = j.urls?.[0];
      if (url) setForm(prev => ({ ...prev, bannerImage: url }));
    } finally { setUploading(false); }
  }

  function removeProduct(pid: string) {
    setForm(prev => ({ ...prev, productIds: prev.productIds.filter(id => id !== pid) }));
  }

  useEffect(() => {
    const ctrl = new AbortController();
    const doSearch = async () => {
      const q = search.trim().toLowerCase();
      if (!q) { setResults([]); return; }
      try {
        const res = await fetch(`/api/products/search?q=${encodeURIComponent(q)}&limit=10`, { signal: ctrl.signal });
        if (!res.ok) return;
        const j = await res.json();
        if (!ctrl.signal.aborted) setResults(j);
      } catch (err: any) {
        if (err?.name !== 'AbortError') {
          console.error('Typeahead search error', err);
        }
      }
    };
    const t = setTimeout(doSearch, 250);
    return () => { clearTimeout(t); ctrl.abort(); };
  }, [search]);

  return (
    <section>
      <h2>Promotions</h2>
      <form onSubmit={save} style={{ display: 'grid', gap: '.5rem', maxWidth: 700 }}>
        <input placeholder="Title" value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} />
        <textarea placeholder="Description" value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} rows={3} />
        <label style={{ display: 'flex', gap: '.5rem', alignItems: 'center' }}>
          <input type="checkbox" checked={form.active} onChange={e => setForm({ ...form, active: e.target.checked })} /> Active
        </label>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '.5rem' }}>
            <button type="button" onClick={onBrowseClick}>Upload banner</button>
            <input ref={fileInputRef} type="file" accept="image/*" onChange={onFileChange} style={{ display: 'none' }} />
            {uploading && <span style={{ fontSize: '.85rem' }}>Uploading…</span>}
          </div>
          {form.bannerImage && (
            <div style={{ marginTop: '.5rem' }}>
              <img src={form.bannerImage} alt="banner" style={{ maxWidth: '100%', width: 360, borderRadius: 8, border: '1px solid #e5e7eb' }} />
              <div>
                <button type="button" onClick={() => setForm(prev => ({ ...prev, bannerImage: '' }))} style={{ marginTop: '.25rem' }}>Remove</button>
              </div>
            </div>
          )}
        </div>
        <div>
          <div style={{ fontWeight: 600, marginBottom: 4 }}>Assign products</div>
          <input
            placeholder="Search products by title..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            style={{ width: '100%', padding: '.5rem', marginBottom: '.5rem' }}
          />
          {!!results.length && (
            <div style={{ border: '1px solid #e5e7eb', borderRadius: 6, maxHeight: 220, overflow: 'auto', marginBottom: '.5rem' }}>
              {results.map(r => {
                const added = form.productIds.includes(r.id);
                return (
                  <button key={r.id} type="button" onClick={() => setForm(prev => ({ ...prev, productIds: added ? prev.productIds : [...prev.productIds, r.id] }))} style={{ display: 'flex', justifyContent: 'space-between', width: '100%', padding: '.5rem .75rem', borderBottom: '1px solid #f3f4f6', background: added ? '#f9fafb' : '#fff', cursor: added ? 'not-allowed' : 'pointer' }} disabled={added}>
                    <span>{r.title}{r.brand ? ` · ${r.brand}` : ''}</span>
                    {added && <span style={{ fontSize: '.8rem', color: '#6b7280' }}>added</span>}
                  </button>
                );
              })}
            </div>
          )}
          {form.productIds.length > 0 && (
            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', maxHeight: 120, overflow: 'auto', padding: 6, border: '1px dashed #e5e7eb', borderRadius: 6 }}>
              {form.productIds.map(pid => (
                <span key={pid} style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '4px 8px', borderRadius: 999, background: '#eef2ff', color: '#1e3a8a' }}>
                  {pid}
                  <button type="button" onClick={() => removeProduct(pid)} title="Remove" style={{ background: 'transparent', border: 0, color: '#1e3a8a', cursor: 'pointer' }}>×</button>
                </span>
              ))}
            </div>
          )}
        </div>
        <div style={{ display: 'flex', gap: '.5rem' }}>
          <button type="submit">{form.id ? 'Update' : 'Create'} Promotion</button>
          {form.id && <button type="button" onClick={() => setForm({ title: '', description: '', active: true, bannerImage: '', productIds: [] })}>Cancel</button>}
        </div>
      </form>

      <div style={{ marginTop: '1rem', display: 'grid', gap: '.5rem' }}>
        {items.map(p => (
          <div key={p.id} style={{ display: 'grid', gridTemplateColumns: '1fr auto auto', gap: '.5rem', alignItems: 'center' }}>
            <div>
              <div style={{ fontWeight: 600 }}>{p.title} {!p.active && <span style={{ fontSize: '.8rem', color: '#6b7280' }}>(inactive)</span>}</div>
              <div style={{ fontSize: '.85rem', opacity: .7 }}>Products: {p.productIds?.length || 0}</div>
            </div>
            <button onClick={() => setForm({ ...p })}>Edit</button>
            <button onClick={() => remove(p.id)}>Delete</button>
          </div>
        ))}
      </div>
    </section>
  );
}
