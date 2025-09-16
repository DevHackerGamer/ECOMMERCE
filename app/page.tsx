import Link from 'next/link';

export default function HomePage() {
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
