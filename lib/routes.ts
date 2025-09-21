export const routePaths = {
  home: '/',
  catalog: '/catalog',
  product: (slug: string) => `/product/${slug}`,
  promotion: (id: string) => `/promotions/${id}`,
  about: '/about',
  contact: '/contact',
  sell: '/sell',
  login: '/login',
  register: '/register',
  cart: '/cart',
  checkout: '/checkout',
  account: '/account',
  privacy: '/privacy',
  terms: '/terms'
} as const;

export type StaticRoute = Exclude<keyof typeof routePaths, 'product'>;
