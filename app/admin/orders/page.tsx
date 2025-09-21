"use client";
import { useEffect, useState } from "react";

type Order = {
  id?: string;
  productIds: string[];
  email: string;
  shipping: any;
  price: number;
  size?: string;
  paymentMethod?: string;
  status: "awaiting_payment" | "paid" | "shipped" | "completed";
};

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [status, setStatus] = useState<Order['status'] | 'all'>('all');
  async function load() {
    const o = await fetch('/api/orders').then(r => r.ok ? r.json() : []);
    setOrders(o);
  }
  useEffect(() => { load(); }, []);

  async function updateStatus(id?: string, status?: Order['status']) {
    if (!id || !status) return;
    const res = await fetch(`/api/orders/${id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ status }) });
    if (!res.ok) return alert('Update failed');
    await load();
  }

  return (
    <section>
      <h2>Orders</h2>
      <div style={{ marginBottom: '.5rem' }}>
        <select value={status} onChange={e => setStatus(e.target.value as any)}>
          <option value="all">All</option>
          <option value="awaiting_payment">awaiting_payment</option>
          <option value="paid">paid</option>
          <option value="shipped">shipped</option>
          <option value="completed">completed</option>
        </select>
      </div>
      <div style={{ display: 'grid', gap: '.5rem' }}>
        {orders.filter(o => status === 'all' ? true : o.status === status).map(o => (
          <div key={o.id} style={{ display: 'grid', gridTemplateColumns: '1fr auto', gap: '.5rem', alignItems: 'center' }}>
            <div>
              <div style={{ fontWeight: 600 }}>{o.email}</div>
              <div style={{ fontSize: '.85rem', opacity: .8 }}>Items: {o.productIds?.length || 0} · R{(o.price || 0).toFixed(2)} · {o.status}</div>
            </div>
            <div style={{ display: 'flex', gap: '.25rem', flexWrap: 'wrap' }}>
              {(['awaiting_payment','paid','shipped','completed'] as const).map(s => (
                <button key={s} disabled={o.status === s} onClick={() => updateStatus(o.id, s)}>{s}</button>
              ))}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
