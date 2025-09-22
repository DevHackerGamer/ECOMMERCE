import { db } from "./firebase";
import { collection, doc, getDoc, getDocs, addDoc, updateDoc, deleteDoc, serverTimestamp, query, where, orderBy, limit as fbLimit, startAfter } from "firebase/firestore";
import { products as sampleProducts } from "./products";

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

const productsCol = collection(db, "products");
const ordersCol = collection(db, "orders");
const promotionsCol = collection(db, "promotions");

export type Promotion = {
  id?: string;
  title: string;
  description?: string;
  active: boolean;
  bannerImage?: string; // single image URL
  productIds: string[];
  createdAt?: any;
};

export async function listProducts() {
  try {
    const snap = await getDocs(productsCol);
    return snap.docs.map((d) => ({ id: d.id, ...(d.data() as any) })) as Product[];
  } catch (err: any) {
    // Fallback to sample data when Firestore isn't configured locally
    return sampleProducts.map((p, i) => ({
      id: `${i + 1}`,
      title: p.name,
      brand: p.brand,
      price: (p.priceCents || 0) / 100,
      sizesAvailable: [],
      status: 'available',
      images: p.image ? [p.image] : [],
      createdAt: null,
    }));
  }
}

// Simple client-side pagination helper using Firestore SDK (fallback when admin SDK isn't available)
export async function listProductsPaged(opts?: { limit?: number; page?: number }) {
  const limitN = Math.min(Math.max(opts?.limit ?? 10, 1), 50);
  const pageN = Math.max(Math.floor(opts?.page ?? 1), 1);
  try {
    // For client SDK, we don't have offset, so we page by iterating cursors
    let cursor: any = undefined;
    let fetched: any[] = [];
    for (let p = 1; p <= pageN; p++) {
      const q = cursor
        ? query(productsCol, orderBy('createdAt', 'desc'), startAfter(cursor), fbLimit(limitN))
        : query(productsCol, orderBy('createdAt', 'desc'), fbLimit(limitN));
      const snap = await getDocs(q);
      const docs = snap.docs.map((d) => ({ id: d.id, ...(d.data() as any) })) as Product[];
      if (p === pageN) fetched = docs;
      cursor = snap.docs[snap.docs.length - 1];
      if (snap.empty || snap.docs.length < limitN) {
        // last page reached
        return { items: fetched, page: pageN, limit: limitN, hasNext: false };
      }
    }
    // We don't know if there's a next page without one more fetch, so do a small probe
    if (cursor) {
      const probeQ = query(productsCol, orderBy('createdAt', 'desc'), startAfter(cursor), fbLimit(1));
      const probeSnap = await getDocs(probeQ);
      return { items: fetched, page: pageN, limit: limitN, hasNext: !probeSnap.empty };
    }
    return { items: fetched, page: pageN, limit: limitN, hasNext: false };
  } catch (err) {
    // Fallback to sample data if Firestore not configured
    const start = (pageN - 1) * limitN;
    const items = sampleProducts.slice(start, start + limitN).map((p, i) => ({
      id: `${start + i + 1}`,
      title: p.name,
      brand: p.brand,
      price: (p.priceCents || 0) / 100,
      sizesAvailable: [],
      status: 'available',
      images: p.image ? [p.image] : [],
      createdAt: null,
    }));
    const hasNext = start + limitN < sampleProducts.length;
    return { items, page: pageN, limit: limitN, hasNext };
  }
}

export async function getProduct(id: string) {
  try {
    const ref = doc(db, "products", id);
    const snap = await getDoc(ref);
    if (!snap.exists()) return null;
    return { id: snap.id, ...(snap.data() as any) } as Product;
  } catch (err) {
    // Fallback to sample data by index when Firestore isn't available
    const idx = Number(id) - 1;
    const p = sampleProducts[idx];
    if (!p) return null;
    return {
      id,
      title: p.name,
      brand: p.brand,
      price: (p.priceCents || 0) / 100,
      sizesAvailable: [],
      status: 'available',
      images: p.image ? [p.image] : [],
      createdAt: null,
    } as Product;
  }
}

export async function createProduct(p: Omit<Product, "id" | "createdAt">) {
  const ref = await addDoc(productsCol, { ...p, createdAt: serverTimestamp() });
  return ref.id;
}

export async function updateProduct(id: string, p: Partial<Product>) {
  const ref = doc(db, "products", id);
  await updateDoc(ref, p as any);
}

export async function deleteProduct(id: string) {
  const ref = doc(db, "products", id);
  await deleteDoc(ref);
}

export async function listOrders() {
  try {
    const snap = await getDocs(ordersCol);
    return snap.docs.map((d) => ({ id: d.id, ...(d.data() as any) })) as Order[];
  } catch {
    return [];
  }
}

export async function createOrder(o: Omit<Order, "id" | "createdAt" | "status">) {
  const ref = await addDoc(ordersCol, { ...o, status: "awaiting_payment", createdAt: serverTimestamp() });
  return ref.id;
}

export async function updateOrder(id: string, o: Partial<Order>) {
  const ref = doc(db, "orders", id);
  await updateDoc(ref, o as any);
}

// --- Promotions (public) ---
export async function listPromotions(options?: { includeInactive?: boolean }) {
  try {
    let snap;
    if (options?.includeInactive) {
      snap = await getDocs(promotionsCol);
    } else {
      const q = query(promotionsCol, where("active", "==", true));
      snap = await getDocs(q);
    }
    return snap.docs.map((d) => ({ id: d.id, ...(d.data() as any) })) as Promotion[];
  } catch {
    return [] as Promotion[];
  }
}

export async function getPromotion(id: string) {
  try {
    const ref = doc(db, "promotions", id);
    const snap = await getDoc(ref);
    if (!snap.exists()) return null;
    return { id: snap.id, ...(snap.data() as any) } as Promotion;
  } catch {
    return null;
  }
}

export async function createPromotion(p: Omit<Promotion, "id" | "createdAt">) {
  const ref = await addDoc(promotionsCol, { ...p, createdAt: serverTimestamp() });
  return ref.id;
}

export async function updatePromotion(id: string, p: Partial<Promotion>) {
  const ref = doc(db, "promotions", id);
  await updateDoc(ref, p as any);
}

export async function deletePromotion(id: string) {
  const ref = doc(db, "promotions", id);
  await deleteDoc(ref);
}
