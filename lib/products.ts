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
    slug: 'airforce-1-low-retro-prm',
    name: 'Air Force 1',
    brand: 'Nike',
    priceCents: 320000,
    colorway: 'Varsity Red/Black-White',
    releaseYear: 2015,
    description: 'Iconic Jordan 1 in the classic Chicago colorway.',
    image: "https://static.nike.com/a/images/c_limit,w_592,f_auto/t_product_v1/a80d1905-5296-4aa9-855a-1d617e3c98f6/AIR+FORCE+1+LOW+RETRO+PRM.png"
  },
  {
    slug: 'yeezy-350-v2-zebra',
    name: 'Yeezy Boost 350 V2 "Zebra"',
    brand: 'Adidas',
    priceCents: 260000,
    colorway: 'White/Core Black/Red',
    releaseYear: 2017,
    description: 'Distinctive striped Primeknit pattern with red SPLY-350 branding.',
    image: '/airforce1.jpg'
  },
  {
    slug: 'dunk-low-panda',
    name: 'Nike Dunk Low "Panda"',
    brand: 'Nike',
    priceCents: 120000,
    colorway: 'White/Black',
    releaseYear: 2021,
    description: 'Versatile monochrome Dunk Low nicknamed the Panda.',
    image: '/airforce1.jpg'
  }
];

export function findProduct(slug: string): Product | undefined {
  return products.find(p => p.slug === slug);
}

export function formatPrice(cents: number): string {
  return new Intl.NumberFormat('en-ZA', { style: 'currency', currency: 'ZAR' }).format(cents / 100);
}
