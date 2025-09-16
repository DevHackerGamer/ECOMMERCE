export interface Product {
  slug: string;
  name: string;
  brand: string;
  priceCents: number;
  colorway?: string;
  description?: string;
  releaseYear?: number;
  image?: string; // Placeholder path or URL
}

export const products: Product[] = [
  {
    slug: 'air-jordan-1-chicago-2015',
    name: 'Air Jordan 1 Retro High OG "Chicago"',
    brand: 'Nike',
    priceCents: 320000,
    colorway: 'Varsity Red/Black-White',
    releaseYear: 2015,
    description: 'Iconic Jordan 1 in the classic Chicago colorway.',
    image: '/placeholder/jordan1-chicago.jpg'
  },
  {
    slug: 'yeezy-350-v2-zebra',
    name: 'Yeezy Boost 350 V2 "Zebra"',
    brand: 'Adidas',
    priceCents: 260000,
    colorway: 'White/Core Black/Red',
    releaseYear: 2017,
    description: 'Distinctive striped Primeknit pattern with red SPLY-350 branding.',
    image: '/placeholder/yeezy-zebra.jpg'
  },
  {
    slug: 'dunk-low-panda',
    name: 'Nike Dunk Low "Panda"',
    brand: 'Nike',
    priceCents: 120000,
    colorway: 'White/Black',
    releaseYear: 2021,
    description: 'Versatile monochrome Dunk Low nicknamed the Panda.',
    image: '/placeholder/dunk-panda.jpg'
  }
];

export function findProduct(slug: string): Product | undefined {
  return products.find(p => p.slug === slug);
}

export function formatPrice(cents: number): string {
  return new Intl.NumberFormat('en-ZA', { style: 'currency', currency: 'ZAR' }).format(cents / 100);
}
