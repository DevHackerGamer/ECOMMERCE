"use client";
import { useEffect, useState } from "react";
import { useToast } from "../../../components/ToastProvider";

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
  const { notify } = useToast();
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
    if (!res.ok) { notify('Update failed', { type: 'error' }); return; }
    await load();
    notify('Order updated', { type: 'success' });
  }

  return (
    <section className="admin-section">
      <h2 className="admin-h2">Orders</h2>
      <div className="admin-toolbar">
        <select className="admin-select" value={status} onChange={e => setStatus(e.target.value as any)}>
          <option value="all">All</option>
          <option value="awaiting_payment">awaiting_payment</option>
          <option value="paid">paid</option>
          <option value="shipped">shipped</option>
          <option value="completed">completed</option>
        </select>
      </div>
      <div className="admin-list">
        {orders.filter(o => status === 'all' ? true : o.status === status).map(o => (
          <div key={o.id} className="admin-row">
            <div>
              <div style={{ fontWeight: 600 }}>{o.email}</div>
              <div className="admin-row-meta">
                Items: {o.productIds?.length || 0} · R{(o.price || 0).toFixed(2)} · {" "}
                <span className={`admin-status ${o.status}`}>{o.status.replace("_", " ")}</span>
              </div>
            </div>
            <div className="admin-row-actions">
              {(['awaiting_payment','paid','shipped','completed'] as const).map(s => (
                <button className="admin-btn" key={s} disabled={o.status === s} onClick={() => updateStatus(o.id, s)}>{s}</button>
              ))}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
