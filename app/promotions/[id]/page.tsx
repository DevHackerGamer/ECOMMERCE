import Image from 'next/image';
import Link from 'next/link';
import { adminGetPromotion } from '../../../lib/dataAdmin';
import { adminGetProductsByIds } from '../../../lib/dataAdmin';

export const dynamic = 'force-dynamic';

export default async function PromotionDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const promo = await adminGetPromotion(id);
  if (!promo) {
    return (
      <div style={{ padding: '2rem 0' }}>
        <h1 style={{ fontSize: '1.6rem', marginBottom: '.5rem' }}>Promotion not found</h1>
        <Link className="button" href="/">Back home</Link>
      </div>
    );
  }
  const products = await adminGetProductsByIds(promo.productIds || []);
  return (
    <div style={{ padding: '2rem 0' }}>
      <div style={{ display: 'grid', gap: '1rem', gridTemplateColumns: '1fr' }}>
        <div className="promo-card" style={{ display: 'grid', gridTemplateColumns: 'minmax(0,1fr)', overflow: 'hidden' }}>
          {promo.bannerImage && (
            <div className="promo-media">
              <Image src={promo.bannerImage} alt={promo.title} fill sizes="(max-width: 768px) 90vw, 800px" style={{ objectFit: 'cover' }} />
            </div>
          )}
          <div className="promo-body">
            <div className="promo-title" style={{ fontSize: '1.4rem' }}>{promo.title}</div>
            {promo.description && <div className="promo-desc" style={{ marginTop: 4 }}>{promo.description}</div>}
            <div className="promo-meta" style={{ marginTop: 8 }}><span className="chip">{products.length} products</span></div>
          </div>
        </div>
      </div>

      <div style={{ marginTop: '1.25rem' }}>
        <h2 style={{ fontSize: '1.2rem', marginBottom: '.75rem' }}>Products</h2>
        {products.length === 0 ? (
          <div className="placeholder-box">No products assigned to this promotion yet.</div>
        ) : (
          <div style={{ display: 'grid', gap: '1.25rem', gridTemplateColumns: 'repeat(auto-fill, minmax(180px,1fr))' }}>
            {products.map((p: any) => {
              const src = p.images?.[0] || '/airforce1.jpg';
              return (
                <Link key={p.id} href={`/product/${p.id}`} className="card" prefetch={false}>
                  <div className="card-media">
                    <Image src={src} alt={p.title} fill sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 200px" style={{ objectFit: 'cover' }} />
                  </div>
                  <div className="card-body">
                    <div className="card-title">{p.title}</div>
                    <div className="card-sub">{p.brand}</div>
                    <div className="card-price">R{(p.price || 0).toFixed(2)}</div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
