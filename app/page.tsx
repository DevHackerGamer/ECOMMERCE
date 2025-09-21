import Link from 'next/link';
import Image from 'next/image';
import { adminListActivePromotions } from '../lib/dataAdmin';
import { adminGetProductsByIds } from '../lib/dataAdmin';
import { routePaths } from '../lib/routes';

export default async function HomePage() {
  // Use Admin SDK on the server to reliably fetch from Firestore
  const promotions = await adminListActivePromotions().catch(() => []);
  // Build small product previews for each real promotion (up to 3 per promo)
  const previewMap = new Map<string, any[]>();
  if (promotions.length) {
    const pairs = await Promise.all(
      promotions.map(async (p: any) => {
        const ids = Array.isArray(p.productIds) ? p.productIds.slice(0, 3) : [];
        const items = ids.length ? await adminGetProductsByIds(ids) : [];
        return [p.id, items] as const;
      })
    );
    for (const [id, items] of pairs) previewMap.set(id, items);
  }
  // Fallback demo promotions so the section isn't empty on fresh installs
  const fallbackPromotions = [
    { id: 'demo-1', title: 'Featured Drops', description: 'Handpicked heat this week.', active: true, bannerImage: '/airforce1.jpg', productIds: Array.from({ length: 6 }, (_, i) => `d${i}`) },
    { id: 'demo-2', title: 'Clean Classics', description: 'Timeless silhouettes in neutral tones.', active: true, bannerImage: '/airforce1.jpg', productIds: Array.from({ length: 4 }, (_, i) => `c${i}`) },
    { id: 'demo-3', title: 'Street Essentials', description: 'Everyday pairs that go with anything.', active: true, bannerImage: '/airforce1.jpg', productIds: Array.from({ length: 5 }, (_, i) => `s${i}`) },
  ];
  const displayPromotions = (promotions?.length ? promotions : fallbackPromotions);
  return (
    <>
      <section className="hero">
        <h1>Authentic. Curated.</h1>
        <p>
          A focused storefront for verified pairs from our own controlled inventory. Browse the current
          catalog below while the full experience (inventory management, richer product media, checkout)
          is still being built out.
        </p>
        <div className="cta-row">
          <Link href="/catalog" className="button">Browse Catalog</Link>
        </div>
      </section>
            {displayPromotions.length > 0 && (
        <section className="promotions">
          <h2 className="section-title">Promotions</h2>
          <div className="promotions-grid">
            {displayPromotions.map((p: any) => (
              <div key={p.id} className="promo-card">
                {p.bannerImage && (
                  <div className="promo-media">
                    <Image src={p.bannerImage} alt={p.title} fill sizes="(max-width: 768px) 90vw, 400px" style={{ objectFit: 'cover' }} />
                  </div>
                )}
                <div className="promo-body">
                  <div className="promo-title">{p.title}</div>
                  {p.description && <div className="promo-desc">{p.description}</div>}
                  {previewMap.get(p.id)?.length ? (
                    <div className="promo-preview">
                      {previewMap.get(p.id)!.slice(0, 3).map((prod: any) => {
                        const src = prod.images?.[0] || '/airforce1.jpg';
                        return (
                          <div key={prod.id} className="promo-thumb">
                            <Image src={src} alt={prod.title} fill sizes="52px" style={{ objectFit: 'cover' }} />
                          </div>
                        );
                      })}
                      {Array.isArray(p.productIds) && p.productIds.length > 3 && (
                        <div className="promo-thumb more">+{p.productIds.length - 3}</div>
                      )}
                    </div>
                  ) : null}
                  <div className="promo-actions" style={{ marginTop: 8 }}>
                    <Link href={routePaths.promotion(p.id)} className="button">Shop</Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}
    </>
  );
}
