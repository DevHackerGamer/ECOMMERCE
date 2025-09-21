import Link from 'next/link';
import Image from 'next/image';
import { listPromotions } from '../lib/data';

export default async function HomePage() {
  const promotions = await listPromotions().catch(() => []);
  return (
    <>
      {promotions.length > 0 && (
        <section className="promotions" style={{ marginBottom: '2rem' }}>
          <h2 style={{ fontSize: '1.4rem', marginBottom: '.75rem' }}>Promotions</h2>
          <div style={{ display: 'grid', gap: '1rem', gridTemplateColumns: 'repeat(auto-fit,minmax(260px,1fr))' }}>
            {promotions.map((p: any) => (
              <div key={p.id} style={{ border: '1px solid #e5e7eb', borderRadius: 12, overflow: 'hidden', background: '#fff' }}>
                {p.bannerImage && (
                  <div style={{ position: 'relative', width: '100%', aspectRatio: '16/9', background: '#f3f4f6' }}>
                    <Image src={p.bannerImage} alt={p.title} fill sizes="(max-width: 768px) 90vw, 400px" style={{ objectFit: 'cover' }} />
                  </div>
                )}
                <div style={{ padding: '0.75rem 1rem' }}>
                  <div style={{ fontWeight: 700 }}>{p.title}</div>
                  {p.description && <div style={{ fontSize: '.9rem', color: 'var(--color-text-dim)' }}>{p.description}</div>}
                  <div style={{ fontSize: '.85rem', opacity: .8, marginTop: 6 }}>{(p.productIds?.length || 0)} products</div>
                  <div style={{ marginTop: 8 }}>
                    <Link href="/catalog" className="button">Shop</Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}
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
      <section style={{marginTop:'3rem'}}>
        <h2 style={{fontSize:'1.4rem', marginBottom:'.75rem'}}>What&apos;s Included Right Now</h2>
        <ul style={{lineHeight:1.6, fontSize:'.9rem', color:'var(--color-text-dim)'}}>
          <li>Static sample product data + dynamic product detail pages</li>
          <li>App Router layout, navigation, footer, placeholder auth & legal routes</li>
          <li>TypeScript strict config and route constants</li>
          <li>Foundation ready for real inventory & checkout logic</li>
        </ul>
      </section>
    </>
  );
}
