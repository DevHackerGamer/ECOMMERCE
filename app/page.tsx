import Link from 'next/link';
import Image from 'next/image';
import { adminListActivePromotions } from '../lib/dataAdmin';
import { adminGetProductsByIds } from '../lib/dataAdmin';
import { routePaths } from '../lib/routes';
import { listProductsPaged } from '../lib/data';

export const dynamic = 'force-dynamic';

export default async function HomePage({
  searchParams,
}: {
  searchParams?: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
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
  // --- Products (paginated) ---
  const sp = (searchParams ? await searchParams : {}) as { [key: string]: string | string[] | undefined };
  const rawPage = sp.page;
  const pageParam = Array.isArray(rawPage) ? rawPage[0] : (rawPage as string | undefined);
  const currentPage = Math.max(parseInt(pageParam || '1', 10) || 1, 1);
  const { items: products, hasNext } = await listProductsPaged({ limit: 10, page: currentPage });
  return (
    <>
      <section className="hero">
        <h1>Authentic. Curated.</h1>
        {/* <p>
        </p>
        {/* <div className="cta-row">
          <Link href="/catalog" className="button">Browse Catalog</Link>
        </div> */} 
      </section>
      {displayPromotions.length > 0 && (() => {
        const promos = displayPromotions as any[];
        const count = promos.length;
        const isOdd = count % 2 === 1;
        const gridClass = count === 1 ? 'single' : 'two-col';
        const firstSpans = count > 1 && isOdd; // first card spans full width
        return (
          <section className="promotions">
            <div className="container">
              <div className={`promotions-grid ${gridClass} ${firstSpans ? 'first-span' : ''}`}>
                {promos.map((p: any, idx: number) => (
                  <Link key={p.id} href={routePaths.promotion(p.id)} className="promo-card reveal-on-hover">
                  {p.bannerImage && (
                    <div
                      className="promo-media"
                      style={{
                        // use CSS var to feed background-image in CSS, enabling background-attachment: fixed
                        ['--promo-img' as any]: `url(${p.bannerImage})`,
                      }}
                    />
                  )}
                  <div className="promo-body">
                    <div className="promo-title">
                      {(() => {
                        const raw = String(p.title || '').trim();
                        const parts = raw.split(/\s+/);
                        const last = parts.pop() || '';
                        const first = parts.join(' ');
                        return (
                          <>
                            {first && <span className="promo-first-words">{first}&nbsp;</span>}
                            <span className="promo-last-word-grad">{last}</span>
                          </>
                        );
                      })()}
                    </div>
                  </div>
                  {p.description && (
                    <div className="promo-overlay">
                      <div className="promo-desc">{p.description}</div>
                    </div>
                  )}
                  </Link>
                ))}
              </div>
            </div>
          </section>
        );
      })()}

      {/* Products Grid */}
      <section style={{ padding: '2.5rem 0' }}>
        <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: '1rem' }}>
          <h2 style={{ fontSize: '1.5rem' }}>Latest Products</h2>
        </div>
  <div className="product-grid">
          {products.map((p: any) => {
            const src = p.images?.[0] || '/airforce1.jpg';
            return (
              <Link key={p.id} href={`/product/${p.id}`} className="card" prefetch={false}>
                <div className="card-media">
                  <Image
                    src={src}
                    alt={p.title}
                    fill
                    sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 200px"
                    style={{ objectFit: 'cover' }}
                  />
                </div>
                <div className="card-body">
                  <div className="card-title">{p.title}</div>
                  <div className="card-sub">{p.brand}</div>
                  <div className="card-price">R{(p.price || 0).toFixed(2)}</div>
                </div>
              </Link>
            );
          })}
          {products.length === 0 && (
            <div className="muted">No products yet.</div>
          )}
        </div>
        {/* Pagination Controls */}
        <div className="pagination-controls">
          <div className="pagination-row">
            {currentPage > 1 && (
              <Link href={`/?page=${currentPage - 1}`} className="button" prefetch={false}>
                ← Previous
              </Link>
            )}
            <span className="muted" style={{ alignSelf: 'center', padding: '0 0.5rem' }}>Page {currentPage}</span>
            {hasNext && (
              <Link href={`/?page=${currentPage + 1}`} className="button" prefetch={false}>
                Next →
              </Link>
            )}
          </div>
          <div className="pagination-row">
            <Link href="/catalog" className="link">View all</Link>
          </div>
        </div>
      </section>
    </>
  );
}
