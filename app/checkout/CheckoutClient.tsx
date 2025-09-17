"use client";

import { useState } from 'react';

export default function CheckoutClient() {
  const [email, setEmail] = useState("");
  const [productIds, setProductIds] = useState("");
  const [price, setPrice] = useState(0);
  const [status, setStatus] = useState<string | null>(null);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    const body = {
      productIds: productIds.split(',').map(s => s.trim()).filter(Boolean),
      email,
      shipping: {},
      price: Number(price),
    };
    const res = await fetch('/api/orders', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
    if (res.ok) {
      const j = await res.json();
      setStatus(`Order created: ${j.id}`);
      setEmail(""); setProductIds(""); setPrice(0);
    } else {
      setStatus('Failed to create order');
    }
  }

  return (
    <div style={{padding:'2.5rem 0', maxWidth:760}}>
      <h1 style={{fontSize:'2rem', marginBottom:'1rem'}}>Checkout</h1>
      <form onSubmit={submit} style={{ display:'grid', gap:'.5rem'}}>
        <input placeholder="Email" value={email} onChange={(e)=>setEmail(e.target.value)} />
        <input placeholder="Product IDs (comma)" value={productIds} onChange={(e)=>setProductIds(e.target.value)} />
        <input type="number" step="0.01" placeholder="Total price" value={price} onChange={(e)=>setPrice(Number(e.target.value))} />
        <button type="submit">Create Order</button>
      </form>
      {status && <p style={{marginTop:'.75rem'}}>{status}</p>}
    </div>
  );
}
