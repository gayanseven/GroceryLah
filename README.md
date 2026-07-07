# 🥬 GroceryLah

Weekly grocery planner for Singapore families. Plan the week in 5 minutes, share the list on WhatsApp or via a web link, learn real prices from receipts, and stick to your budget.

Built with **Next.js (App Router)** + plain CSS. State lives in `localStorage` for now; Supabase realtime sync is milestone 2.

## Features

Shared weekly lists with budget tracking, smart add with variant suggestions, saved & duplicable lists, per-item shop assignment (FairPrice / Giant / wet market / Indian shop…), group-by-shop shopping view, receipt parsing that learns item prices, spend analytics, WhatsApp share with live preview, and a no-login web view (`/s#…`) so helpers or family can tick items off while shopping.

The original single-file prototype is preserved at [`/prototype.html`](./public/prototype.html).

## Development

```bash
npm install
npm run dev      # http://localhost:3000
npm run build    # production build
```

## Project structure

```
app/
  page.js        app shell: onboarding → tabs (List, My Lists, Receipt, Insights)
  s/page.js      shopper web view (opened from share links)
  globals.css    design system
components/      Onboarding, Header, ListTab, ListsTab, ReceiptTab, InsightsTab, ShareSheets
lib/
  catalog.js     seed catalog (SG staples), base/demo state
  pricing.js     price prediction (recency-weighted), totals
  suggest.js     type-ahead + receipt line matching
  share.js       WhatsApp message + share-link encoding
  store.js       React context store, localStorage persistence
```

## Deploy on Vercel

Import the repo at [vercel.com/new](https://vercel.com/new) — Next.js is auto-detected, no configuration needed. Every push to `main` redeploys.

## Roadmap

See [PRODUCT-PLAN.md](./PRODUCT-PLAN.md).

1. **Milestone 1 (this)** — full prototype feature set, localStorage, deployable PWA shell
2. **Milestone 2** — Supabase auth + realtime shared lists (live sync between family members and the shopper view)
3. **Milestone 3** — receipt photo OCR via Claude API, WhatsApp Cloud API notifications, savings suggestions
