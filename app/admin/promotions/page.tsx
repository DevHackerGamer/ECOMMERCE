"use client";
import { useEffect, useRef, useState } from "react";
import { useToast } from "../../../components/ToastProvider";

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
  const { notify, confirm } = useToast();
  const [items, setItems] = useState<Promotion[]>([]);
  const [search, setSearch] = useState('');
  const [results, setResults] = useState<Product[]>([]);
  const [lastBrandGroup, setLastBrandGroup] = useState<string | null>(null);
  const [selectedMeta, setSelectedMeta] = useState<Record<string, { title: string; brand?: string }>>({});
  const [form, setForm] = useState<Promotion>({ title: '', description: '', active: true, bannerImage: '', productIds: [] });
  const [uploading, setUploading] = useState(false);
  const [showForm, setShowForm] = useState(false);
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
    if (!res.ok) { notify('Save failed', { type: 'error' }); return; }
    setForm({ title: '', description: '', active: true, bannerImage: '', productIds: [] });
    setShowForm(false);
    await load();
    notify(form.id ? 'Promotion updated' : 'Promotion created', { type: 'success' });
  }

  async function remove(id?: string) {
    if (!id) return;
    const ok = await confirm({ title: 'Delete promotion', message: 'Are you sure you want to delete this promotion?', confirmText: 'Delete', cancelText: 'Cancel' });
    if (!ok) return;
    const res = await fetch(`/api/promotions/${id}`, { method: 'DELETE' });
    if (!res.ok) { notify('Delete failed', { type: 'error' }); return; }
    await load();
    notify('Promotion deleted', { type: 'success' });
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
    setSelectedMeta(prev => {
      const { [pid]: _omit, ...rest } = prev;
      return rest;
    });
  }

  useEffect(() => {
    const ctrl = new AbortController();
    const doSearch = async () => {
      const q = search.trim().toLowerCase();
      if (!q) { setResults([]); return; }
      try {
        const res = await fetch(`/api/products/search?q=${encodeURIComponent(q)}&limit=10`, { signal: ctrl.signal, cache: 'no-store' });
        if (!res.ok) { setResults([]); return; }
        const j = await res.json();
        if (!ctrl.signal.aborted) setResults(Array.isArray(j) ? j : []);
      } catch (err: any) {
        if (err?.name !== 'AbortError') {
          console.error('Typeahead search error', err);
        }
      }
    };
    const t = setTimeout(doSearch, 250);
    return () => { clearTimeout(t); ctrl.abort(); };
  }, [search]);

  // Resolve selected product IDs to titles/brands for chip display
  useEffect(() => {
    const ids = form.productIds;
    if (!ids || ids.length === 0) { setSelectedMeta({}); return; }
    (async () => {
      try {
        const res = await fetch('/api/products/byIds', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ ids }), cache: 'no-store' });
        if (!res.ok) return;
        const arr: Array<{ id: string; title: string; brand?: string }> = await res.json();
        const map: Record<string, { title: string; brand?: string }> = {};
        for (const p of arr) map[p.id] = { title: p.title, brand: p.brand };
        setSelectedMeta(map);
      } catch {}
    })();
  }, [form.productIds]);

  return (
    <section className="admin-section">
      <h2 className="admin-h2">Promotions</h2>
      <div className="admin-toolbar" style={{ justifyContent: 'space-between' }}>
        <div className="adm-muted">Create and manage store promotions</div>
        <div className="admin-actions">
          {!showForm && (
            <button className="admin-btn primary" type="button" onClick={() => { setForm({ title: '', description: '', active: true, bannerImage: '', productIds: [] }); setShowForm(true); }}>New Promo</button>
          )}
          {showForm && (
            <button className="admin-btn" type="button" onClick={() => { setShowForm(false); }}>Close Form</button>
          )}
        </div>
      </div>
      {showForm && (
      <form onSubmit={save} className="admin-form" style={{ maxWidth: 700 }}>
        <input className="admin-input" placeholder="Title" value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} />
        <textarea className="admin-textarea" placeholder="Description" value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} rows={3} />
        <label className="admin-toolbar">
          <input className="admin-checkbox" type="checkbox" checked={form.active} onChange={e => setForm({ ...form, active: e.target.checked })} /> Active
        </label>
        <div>
          <div className="admin-toolbar">
            <button className="admin-btn" type="button" onClick={onBrowseClick}>Upload banner</button>
            <input ref={fileInputRef} type="file" accept="image/*" onChange={onFileChange} style={{ display: 'none' }} />
            {uploading && <span className="adm-muted">Uploading…</span>}
          </div>
          {form.bannerImage && (
            <div style={{ marginTop: '.5rem' }}>
              <img src={form.bannerImage} alt="banner" style={{ maxWidth: '100%', width: 360, borderRadius: 8, border: '1px solid #e5e7eb' }} />
              <div>
                <button className="admin-btn" type="button" onClick={() => setForm(prev => ({ ...prev, bannerImage: '' }))} style={{ marginTop: '.25rem' }}>Remove</button>
              </div>
            </div>
          )}
        </div>
        <div>
          <div style={{ fontWeight: 600, marginBottom: 4 }}>Assign products</div>
          <input
            className="admin-input"
            placeholder="Search products by title..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
          {!!results.length && (
            <div style={{ border: '1px solid #e5e7eb', borderRadius: 6, maxHeight: 240, overflow: 'auto', marginBottom: '.5rem' }}>
              {results.map((r, idx) => {
                const added = form.productIds.includes(r.id);
                const brand = r.brand || '';
                const prevBrand = idx > 0 ? (results[idx-1].brand || '') : '';
                const brandChanged = brand && brand !== prevBrand;
                return (
                  <div key={r.id}>
                    {brandChanged && (
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#fafafa', borderBottom: '1px solid #f3f4f6', padding: '.4rem .65rem' }}>
                        <strong style={{ fontSize: '.85rem' }}>{brand}</strong>
                        <button type="button" className="admin-btn" onClick={() => {
                          const brandItems = results.filter(x => (x.brand || '') === brand);
                          const brandIds = brandItems.map(x => x.id);
                          setForm(prev => ({ ...prev, productIds: Array.from(new Set([...prev.productIds, ...brandIds])) }));
                          // Hydrate chip metadata immediately to avoid ID-first flash
                          setSelectedMeta(prev => {
                            const out = { ...prev } as Record<string, { title: string; brand?: string }>;
                            for (const it of brandItems) out[it.id] = { title: it.title, brand: it.brand };
                            return out;
                          });
                          setLastBrandGroup(brand);
                        }}>Add all</button>
                      </div>
                    )}
                    <button type="button" onClick={() => {
                      if (added) return;
                      setForm(prev => ({ ...prev, productIds: [...prev.productIds, r.id] }));
                      // Prime chip metadata synchronously
                      setSelectedMeta(prev => ({ ...prev, [r.id]: { title: r.title, brand: r.brand } }));
                    }} style={{ display: 'flex', justifyContent: 'space-between', width: '100%', padding: '.5rem .75rem', borderBottom: '1px solid #f3f4f6', background: added ? '#f9fafb' : '#fff', cursor: added ? 'not-allowed' : 'pointer' }} disabled={added}>
                      <span>{r.title}{r.brand ? ` · ${r.brand}` : ''}</span>
                      {added && <span className="adm-muted" style={{ fontSize: '.8rem' }}>added</span>}
                    </button>
                  </div>
                );
              })}
            </div>
          )}
          {form.productIds.length > 0 && (
            <div>
              <div className="admin-actions" style={{ justifyContent: 'space-between', marginBottom: '.35rem' }}>
                <div className="adm-muted">Selected: {form.productIds.length}{lastBrandGroup ? ` (last added brand: ${lastBrandGroup})` : ''}</div>
                <div className="admin-actions">
                  <button className="admin-btn" type="button" onClick={() => setForm(prev => ({ ...prev, productIds: [] }))}>Clear</button>
                </div>
              </div>
              <div className="admin-chips">
                {form.productIds.map(pid => {
                  const meta = selectedMeta[pid];
                  const label = meta ? `${meta.title}${meta.brand ? ' · ' + meta.brand : ''}` : 'Loading…';
                  return (
                    <span key={pid} className="admin-chip">
                      {label}
                      <button type="button" onClick={() => removeProduct(pid)} title="Remove">×</button>
                    </span>
                  );
                })}
              </div>
            </div>
          )}
        </div>
        <div className="admin-actions">
          <button className="admin-btn primary" type="submit">{form.id ? 'Update' : 'Create'} Promotion</button>
          <button className="admin-btn" type="button" onClick={() => { setForm({ title: '', description: '', active: true, bannerImage: '', productIds: [] }); setShowForm(false); }}>Cancel</button>
        </div>
      </form>
      )}

      <div className="admin-list" style={{ marginTop: '1rem' }}>
        {items.map(p => (
          <div key={p.id} className="admin-row">
            <div>
              <div style={{ fontWeight: 600 }}>{p.title} {!p.active && <span className="adm-muted" style={{ fontSize: '.8rem' }}>(inactive)</span>}</div>
              <div className="admin-row-meta">Products: {p.productIds?.length || 0}</div>
            </div>
            <div className="admin-row-actions">
              <button className="admin-btn" onClick={() => { setForm({ ...p }); setShowForm(true); }}>Edit</button>
              <button className="admin-btn danger" onClick={() => remove(p.id)}>Delete</button>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
