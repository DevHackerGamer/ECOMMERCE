# BigDawg Sneaker Store (Scaffold)

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
