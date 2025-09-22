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
      <section className="promo-detail-hero">
        {promo.bannerImage && (
          <div
            className="promo-detail-hero-media"
            style={{ ['--promo-hero-img' as any]: `url(${promo.bannerImage})` }}
          />
        )}
        <div className="promo-detail-hero-inner container">
          <div className="promo-detail-text">
            <h1 className="promo-detail-title">{promo.title}</h1>
            {promo.description && <p className="promo-detail-desc">{promo.description}</p>}
            {/* <div className="promo-detail-meta"><span className="chip">{products.length} products</span></div> */}
          </div>
        </div>
      </section>

      <section className="container" style={{ marginTop: '1.25rem' }}>
        {products.length === 0 ? (
          <div className="placeholder-box">No products assigned to this promotion yet.</div>
        ) : (
          <div className="product-grid">
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
      </section>
    </div>
  );
}
