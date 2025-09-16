import { notFound } from 'next/navigation';
import { findProduct, products, formatPrice } from '../../../lib/products';

interface ProductParams { slug: string }

export async function generateStaticParams() {
  return products.map(p => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: { params: Promise<ProductParams> }) {
  const { slug } = await params;
  const product = findProduct(slug);
  return { title: product ? `${product.name} | BigDawg` : 'Product | BigDawg' };
}

export default async function ProductDetailPage({ params }: { params: Promise<ProductParams> }) {
  const { slug } = await params;
  const product = findProduct(slug);
  if (!product) return notFound();

  return (
    <div style={{padding:'2.5rem 0'}}>
      <div style={{display:'grid', gap:'2rem', gridTemplateColumns:'repeat(auto-fit,minmax(260px,1fr))'}}>
        <div style={{background:'#111', aspectRatio:'1/1', borderRadius:12, display:'flex', alignItems:'center', justifyContent:'center', color:'#555', fontSize:'.9rem'}}>
          PRODUCT IMG
        </div>
        <div>
          <h1 style={{fontSize:'1.9rem', lineHeight:1.1}}>{product.name}</h1>
          <div style={{margin:'0.5rem 0 1rem', fontSize:'.85rem', color:'var(--color-text-dim)'}}>
            {product.brand}{product.releaseYear ? ` · ${product.releaseYear}` : ''}{product.colorway ? ` · ${product.colorway}` : ''}
          </div>
          <div style={{fontSize:'1.2rem', fontWeight:600, marginBottom:'1rem'}}>{formatPrice(product.priceCents)}</div>
          {product.description && (
            <p style={{lineHeight:1.55, fontSize:'.9rem', maxWidth:500}}>{product.description}</p>
          )}
          <div style={{marginTop:'1.5rem'}}>
            <button style={{padding:'0.75rem 1.25rem', background:'var(--color-accent,#2563eb)', color:'#fff', border:'none', borderRadius:6, cursor:'pointer', fontSize:'.85rem', fontWeight:600}}>Add to Cart</button>
          </div>
        </div>
      </div>
    </div>
  );
}
