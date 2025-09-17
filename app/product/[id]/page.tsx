import { notFound } from 'next/navigation';
import Image from 'next/image';
import { getProduct } from '../../../lib/data';

export default async function ProductDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const product: any = await getProduct(id);
  if (!product) return notFound();
  const src = product.images?.[0] || '/airforce1.jpg';
  return (
    <div style={{ padding: '2.5rem 0' }}>
      <div style={{ display: 'grid', gap: '2rem', gridTemplateColumns: 'repeat(auto-fit,minmax(260px,1fr))' }}>
        <div style={{ position: 'relative', background: '#f0f0f0', aspectRatio: '1/1', borderRadius: 12, overflow: 'hidden' }}>
          <Image src={src} alt={product.title} fill sizes="(max-width: 768px) 90vw, 400px" style={{ objectFit: 'cover' }} />
        </div>
        <div>
          <h1 style={{ fontSize: '1.9rem', lineHeight: 1.1 }}>{product.title}</h1>
          <div style={{ margin: '0.5rem 0 1rem', fontSize: '.85rem', color: 'var(--color-text-dim)' }}>
            {product.brand}
          </div>
          <div style={{ fontSize: '1.2rem', fontWeight: 600, marginBottom: '1rem' }}>${(product.price || 0).toFixed(2)}</div>
          <div style={{ marginTop: '1.5rem' }}>
            <a href="/checkout" style={{ display:'inline-block', padding: '0.75rem 1.25rem', background: 'var(--color-accent,#2563eb)', color: '#fff', borderRadius: 6, fontSize: '.85rem', fontWeight: 600 }}>Checkout</a>
          </div>
        </div>
      </div>
    </div>
  );
}
