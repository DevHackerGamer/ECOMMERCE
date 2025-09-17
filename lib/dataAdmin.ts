import 'server-only';
import { adminDb } from './firebaseAdmin';
import { FieldValue } from 'firebase-admin/firestore';

export type Product = {
  id?: string;
  title: string;
  brand?: string;
  price: number;
  sizesAvailable?: string[];
  status: "available" | "sold_out";
  images?: string[];
  createdAt?: any;
};

export type Order = {
  id?: string;
  productIds: string[];
  email: string;
  shipping: {
    name?: string;
    address1?: string;
    address2?: string;
    city?: string;
    state?: string;
    postalCode?: string;
    country?: string;
  };
  price: number;
  size?: string;
  paymentMethod?: string;
  status: "awaiting_payment" | "paid" | "shipped" | "completed";
  createdAt?: any;
};

const productsCol = adminDb.collection("products");
const ordersCol = adminDb.collection("orders");

// PRODUCT CRUD - Server-side admin operations only
export async function adminListProducts() {
  const snap = await productsCol.get();
  return snap.docs.map((d) => ({ id: d.id, ...(d.data() as any) })) as Product[];
}

export async function adminGetProduct(id: string) {
  const ref = productsCol.doc(id);
  const snap = await ref.get();
  if (!snap.exists) return null;
  return { id: snap.id, ...(snap.data() as any) } as Product;
}

export async function adminCreateProduct(p: Omit<Product, "id" | "createdAt">) {
  const ref = await productsCol.add({ ...p, createdAt: FieldValue.serverTimestamp() });
  return ref.id;
}

export async function adminUpdateProduct(id: string, p: Partial<Product>) {
  const ref = productsCol.doc(id);
  await ref.update(p as any);
}

export async function adminDeleteProduct(id: string) {
  const ref = productsCol.doc(id);
  await ref.delete();
}

// ORDER CRUD - Server-side admin operations only
export async function adminListOrders() {
  const snap = await ordersCol.get();
  return snap.docs.map((d) => ({ id: d.id, ...(d.data() as any) })) as Order[];
}

export async function adminCreateOrder(o: Omit<Order, "id" | "createdAt" | "status">) {
  const ref = await ordersCol.add({ ...o, status: "awaiting_payment", createdAt: FieldValue.serverTimestamp() });
  return ref.id;
}

export async function adminUpdateOrder(id: string, o: Partial<Order>) {
  const ref = ordersCol.doc(id);
  await ref.update(o as any);
}