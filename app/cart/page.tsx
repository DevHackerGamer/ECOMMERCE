export const metadata = { title: 'Cart | BigDawg (Placeholder)' };

export default function CartPage() {
  return (
    <div style={{padding:'2.5rem 0', maxWidth:760}}>
      <h1 style={{fontSize:'2rem', marginBottom:'1rem'}}>Cart</h1>
      <p className="muted" style={{marginBottom:'1.5rem'}}>Implement cart state (server or client) and merge guest carts on auth.</p>
      <div className="placeholder-box">Cart Items Placeholder</div>
    </div>
  );
}
