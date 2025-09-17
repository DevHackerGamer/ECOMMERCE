import Link from 'next/link';
import Image from 'next/image';
import { listProducts } from '../../lib/data';

export const metadata = { title: 'Catalog | BigDawg' };
export const dynamic = 'force-dynamic';

export default async function CatalogPage() {
  const products = await listProducts();
  return (
    <div style={{ padding: '2.5rem 0' }}>
      <h1 style={{ fontSize: '2rem', marginBottom: '1rem' }}>Catalog</h1>
      <p className="muted" style={{ marginBottom: '1.5rem' }}>Curated in-stock pairs. Click a sneaker to view its detail page.</p>
      <div style={{ display: 'grid', gap: '1.25rem', gridTemplateColumns: 'repeat(auto-fill, minmax(180px,1fr))' }}>
        {products.map((p: any) => {
          const src = p.images?.[0] || '/airforce1.jpg';
          return (
            <Link key={p.id} href={`/product/${p.id}`} className="card" style={{ textDecoration: 'none' }}>
              <div style={{ position: 'relative', background: '#f0f0f0', aspectRatio: '1/1', borderRadius: 8, marginBottom: 8, overflow: 'hidden' }}>
                <Image
                  src={src}
                  alt={p.title}
                  fill
                  sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 200px"
                  style={{ objectFit: 'cover' }}
                />
              </div>
              <div style={{ fontSize: '.85rem', fontWeight: 600, lineHeight: 1.3 }}>{p.title}</div>
              <div style={{ fontSize: '.7rem', color: 'var(--color-text-dim)' }}>{p.brand}</div>
              <div style={{ fontSize: '.75rem', marginTop: 4 }}>${(p.price || 0).toFixed(2)}</div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
