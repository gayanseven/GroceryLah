# 🥬 GroceryLah

Weekly grocery planner for Singapore families. Plan the week in 5 minutes, share the list on WhatsApp or via a web link, learn real prices from receipts, and stick to your budget.

## Features (prototype)

Shared weekly lists with budget tracking, smart add with variant suggestions, saved & duplicable lists, per-item shop assignment (FairPrice / Giant / wet market / Indian shop…), group-by-shop shopping view, receipt parsing that learns item prices, spend analytics, WhatsApp share with live preview, and a no-login web view link so helpers or family can tick items off while shopping.

Everything is a single static file (`index.html`) — no build step, no backend. State persists in `localStorage`.

## Run locally

Open `index.html` in a browser, or:

```bash
python3 -m http.server 8765
# → http://localhost:8765
```

## Deploy on Vercel

1. Import this repo at [vercel.com/new](https://vercel.com/new)
2. Framework preset: **Other** — no build command, output directory: root
3. Deploy. The app is served at `/`, and shared web-view links (`#shop=…`) work out of the box.

## Roadmap

See [PRODUCT-PLAN.md](./PRODUCT-PLAN.md) — phases cover realtime sync (Supabase), receipt OCR via LLM, WhatsApp Business Cloud API notifications, and habit/savings features.
