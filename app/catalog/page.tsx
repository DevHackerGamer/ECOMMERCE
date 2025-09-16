import Link from 'next/link';
import { products, formatPrice } from '../../lib/products';

export const metadata = { title: 'Catalog | BigDawg' };

export default function CatalogPage() {
  return (
    <div style={{padding:'2.5rem 0'}}>
      <h1 style={{fontSize:'2rem', marginBottom:'1rem'}}>Catalog</h1>
      <p className="muted" style={{marginBottom:'1.5rem'}}>Curated in-stock pairs. Click a sneaker to view its detail page.</p>
      <div style={{display:'grid', gap:'1.25rem', gridTemplateColumns:'repeat(auto-fill, minmax(180px,1fr))'}}>
        {products.map(p => (
          <Link key={p.slug} href={`/product/${p.slug}`} className="card" style={{textDecoration:'none'}}>
            <div className="image" style={{background:'#111', aspectRatio:'1/1', borderRadius:8, marginBottom:8, display:'flex', alignItems:'center', justifyContent:'center', color:'#555', fontSize:'.75rem'}}>
              IMG
            </div>
            <div style={{fontSize:'.85rem', fontWeight:600, lineHeight:1.3}}>{p.name}</div>
            <div style={{fontSize:'.7rem', color:'var(--color-text-dim)'}}>{p.brand}</div>
            <div style={{fontSize:'.75rem', marginTop:4}}>{formatPrice(p.priceCents)}</div>
          </Link>
        ))}
      </div>
    </div>
  );
}
