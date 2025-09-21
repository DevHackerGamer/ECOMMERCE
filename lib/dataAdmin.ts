import 'server-only';
import { adminDb } from './firebaseAdmin';
import { adminBucket } from './firebaseAdmin';
import { FieldValue } from 'firebase-admin/firestore';

export type Product = {
  id?: string;
  title: string;
  titleLower?: string;
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
const promotionsCol = adminDb.collection("promotions");

export type Promotion = {
  id?: string;
  title: string;
  description?: string;
  active: boolean;
  bannerImage?: string;
  productIds: string[];
  createdAt?: any;
};

// PRODUCT CRUD - Server-side admin operations only
export async function adminListProducts() {
  const snap = await productsCol.get();
  return snap.docs.map((d) => ({ id: d.id, ...(d.data() as any) })) as Product[];
}

export async function adminQueryProducts(opts?: { q?: string; limit?: number }) {
  const limitN = Math.min(Math.max(opts?.limit ?? 25, 1), 100);
  let qref: FirebaseFirestore.Query<FirebaseFirestore.DocumentData> = productsCol;
  if (opts?.q) {
    // Case-insensitive prefix search on lowercase title field
    const q = opts.q.toLowerCase();
    qref = qref.orderBy('titleLower').startAt(q).endAt(q + '\uf8ff');
  } else {
    qref = qref.orderBy('createdAt', 'desc');
  }
  qref = qref.limit(limitN);
  const snap = await qref.get();
  return snap.docs.map((d) => ({ id: d.id, ...(d.data() as any) })) as Product[];
}

export async function adminGetProduct(id: string) {
  const ref = productsCol.doc(id);
  const snap = await ref.get();
  if (!snap.exists) return null;
  return { id: snap.id, ...(snap.data() as any) } as Product;
}

export async function adminCreateProduct(p: Omit<Product, "id" | "createdAt">) {
  const payload = normalizeImagesOnWrite(p);
  const doc = {
    ...payload,
    titleLower: (p.title ?? '').toLowerCase(),
    createdAt: FieldValue.serverTimestamp(),
  };
  const ref = await productsCol.add(doc as any);
  return ref.id;
}

export async function adminUpdateProduct(id: string, p: Partial<Product>) {
  const ref = productsCol.doc(id);
  const payload = normalizeImagesOnWrite(p);
  const update: any = { ...payload };
  if (p.title !== undefined) {
    update.titleLower = (p.title ?? '').toLowerCase();
  }
  await ref.update(update);
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

// PROMOTIONS CRUD - Server-side admin operations only
export async function adminListPromotions() {
  const snap = await promotionsCol.get();
  return snap.docs.map((d) => ({ id: d.id, ...(d.data() as any) })) as Promotion[];
}

export async function adminListActivePromotions() {
  const snap = await promotionsCol.where('active', '==', true).get();
  return snap.docs.map((d) => ({ id: d.id, ...(d.data() as any) })) as Promotion[];
}

export async function adminGetPromotion(id: string) {
  const ref = promotionsCol.doc(id);
  const snap = await ref.get();
  if (!snap.exists) return null;
  return { id: snap.id, ...(snap.data() as any) } as Promotion;
}

export async function adminCreatePromotion(p: Omit<Promotion, 'id' | 'createdAt'>) {
  const payload = normalizeImagesOnWrite({ ...p, images: p.bannerImage ? [p.bannerImage] : [] });
  const docData: any = { ...payload, createdAt: FieldValue.serverTimestamp() };
  // Remove helper array and drop falsey banner values
  delete docData.images;
  if (!docData.bannerImage || String(docData.bannerImage).trim() === '') {
    delete docData.bannerImage;
  }
  const ref = await promotionsCol.add(docData);
  return ref.id;
}

export async function adminUpdatePromotion(id: string, p: Partial<Promotion>) {
  const withImageArray = { ...p, images: p.bannerImage ? [p.bannerImage] : undefined } as any;
  const payload = normalizeImagesOnWrite(withImageArray);
  const bannerCandidate = payload.images ? payload.images[0] : p.bannerImage;
  const { images, ...rest } = payload as any;
  // Ensure we don't carry raw bannerImage from rest; we'll control its update explicitly
  delete (rest as any).bannerImage;
  const ref = promotionsCol.doc(id);
  // Determine banner update
  let bannerUpdate: any = undefined;
  if (bannerCandidate !== undefined) {
    const s = typeof bannerCandidate === 'string' ? bannerCandidate.trim() : bannerCandidate;
    bannerUpdate = s === '' ? FieldValue.delete() : bannerCandidate;
  }
  await ref.update({ ...rest, ...(bannerUpdate !== undefined ? { bannerImage: bannerUpdate } : {}) });
}

export async function adminDeletePromotion(id: string) {
  const ref = promotionsCol.doc(id);
  await ref.delete();
}

// Helper: fetch products by IDs (chunked for 'in' query limit of 10)
export async function adminGetProductsByIds(ids: string[]) {
  if (!ids || ids.length === 0) return [] as Product[];
  const out: Product[] = [];
  for (let i = 0; i < ids.length; i += 10) {
    const slice = ids.slice(i, i + 10);
    const snap = await productsCol.where('__name__', 'in', slice).get();
    out.push(...snap.docs.map(d => ({ id: d.id, ...(d.data() as any) })) as Product[]);
  }
  // Preserve original order roughly by ids array
  const index = new Map(ids.map((id, i) => [id, i] as const));
  out.sort((a, b) => (index.get(a.id!) ?? 0) - (index.get(b.id!) ?? 0));
  return out;
}

// --- Helpers ---
function normalizeImagesOnWrite<T extends { images?: string[] }>(obj: T): T {
  if (!obj?.images || obj.images.length === 0) return obj;
  const bucket = adminBucket.name; // current bucket name
  const out = { ...obj } as T;
  out.images = obj.images.map((url) => rewriteToLocalIfSameBucket(url, bucket));
  return out;
}

function rewriteToLocalIfSameBucket(url: string, bucket: string): string {
  try {
    // Already local proxy
    if (url.startsWith('/api/media/')) return url;
    // firebase v0 style: https://firebasestorage.googleapis.com/v0/b/<bucket>/o/<encodedKey>?...
    const v0 = `https://firebasestorage.googleapis.com/v0/b/${bucket}/o/`;
    if (url.startsWith(v0)) {
      const after = url.slice(v0.length);
      const encodedKey = after.split('?')[0];
      const key = decodeURIComponent(encodedKey);
      return `/api/media/${key}`;
    }
    // GCS JSON/static style: https://storage.googleapis.com/<bucket>/<key>
    const gcs = `https://storage.googleapis.com/${bucket}/`;
    if (url.startsWith(gcs)) {
      const key = url.slice(gcs.length);
      return `/api/media/${key}`;
    }
    return url;
  } catch {
    return url;
  }
}