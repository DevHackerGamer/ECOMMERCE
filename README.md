# BigDawg Sneaker Store (Placeholder Scaffold)

This repository is a minimal **Next.js (App Router + TypeScript)** scaffold for a deadstock sneaker resell marketplace. It includes only placeholder pages, layout, styling, and a simple health API route so you can deploy to **Vercel** and start iterating immediately.

## Quick Start

```bash
npm install
npm run dev
```

Visit http://localhost:3000

## Included Routes (All Placeholder Content)

| Route | Purpose |
|-------|---------|
| `/` | Landing / hero |
| `/catalog` | Product browsing grid placeholder |
| `/product/[slug]` | Dynamic product detail placeholder |
| `/sell` | Selling flow placeholder |
| `/login`, `/register` | Auth forms placeholders |
| `/cart` | Cart placeholder |
| `/checkout` | Checkout flow placeholder |
| `/account` | Account dashboard placeholder |
| `/about`, `/contact` | Informational pages |
| `/privacy`, `/terms` | Legal content placeholders |
| `/api/health` | JSON health check |

## Tech Stack

- Next.js (latest) with App Router
- TypeScript (strict)
- CSS (single global stylesheet with design tokens)
- ESLint (Next.js defaults)

## Deployment (Vercel)

1. Push this repo to GitHub.
2. Import the repo in Vercel dashboard.
3. Accept defaults (framework auto-detected as Next.js).
4. (Optional) Add environment variables later (none required now).

No `vercel.json` is required for basic operation.

## Project Structure

```
app/               # App Router pages & API route
  api/health/route.ts
  layout.tsx
  page.tsx
  ... (other page folders)
components/        # Shared UI components (NavBar, Footer)
lib/               # Route helpers, future utilities
public/            # (create when you add static assets)
```

## Next Steps (Suggestions)

1. Data layer: choose Prisma + Postgres / PlanetScale / Supabase.
2. Auth: NextAuth, Auth0, Clerk, or custom JWT solution.
3. Product model: brand, model, colorway, size runs, condition, verification status.
4. Image handling: upload (Vercel Blob, Cloudinary, S3) + optimization.
5. Search & filters: indexing (e.g., Meilisearch / Typesense / OpenSearch) for speed.
6. Checkout: integrate Stripe (Payments + Connect for seller payouts) & anti-fraud.
7. Real-time: order status updates via websockets (Ably, Pusher, Supabase Realtime).
8. Moderation & verification workflow UI.
9. Observability: logging (pino), metrics (OpenTelemetry), error tracking (Sentry).
10. Testing: add Jest + Playwright for critical flows.

## Placeholder Disclaimer

No real products, prices, or user data are included. All UI is illustrative until you wire real services.

## License

Unlicensed scaffold. Feel free to adapt. (Add a proper license before production.)
