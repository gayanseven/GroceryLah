# GroceryLah — Weekly Grocery Planner for Singapore Families
**Product & Implementation Plan** · July 2026 · For: Gayan (builder)

---

## 1. Problem & Primary Goal

Couples/families in SG waste time every week on: rebuilding the same grocery list, coordinating over chat ("did you buy eggs?"), guessing what the trip will cost, and having no idea where the money went. Average SG household grocery spend is ~S$456/month (family of 4: S$600–900), and food inflation makes budgets drift silently.

**Primary goal:** minimise time spent on grocery admin so it becomes a 5-minute weekly task, not a recurring mental load.

**North-star metric:** minutes per week spent on grocery planning/coordination (target < 10 min/household). Supporting metrics: budget adherence %, % of weeks list reused, estimate accuracy (predicted vs actual bill).

---

## 2. Scope

**In scope (groceries only):**

| Area | What it means |
|---|---|
| Shared weekly list | Both partners add/remove items in real time; item states: planned → in-cart → bought |
| Budget & live estimate | Set weekly budget; list shows running estimated cost as items are added |
| Price learning | Upload receipt after shopping; app extracts item prices and updates its price memory; estimates get sharper each week |
| Household analytics | Category breakdown, week-over-week trend, budget adherence, price inflation on your own basket |
| WhatsApp integration | Share list + notify partner of changes/budget status |
| Off-app purchases | Quick manual log for things bought outside the plan (kopitiam run, 7-Eleven top-ups) so tracking stays honest |
| Habit building | Budget streaks, gentle nudges when estimate exceeds budget, end-of-week summary |
| Time tracking (later) | Log shop duration; suggest consolidating trips or switching frequently-bought staples to online order |

**Explicitly out of scope:** meal planning, recipes, general expense tracking, price-comparison across all SG supermarkets (only your own purchase history), loyalty cards, payments.

---

## 3. Users & Core Flows

Household = 2–5 members, one shared space. No complex roles — any member can edit; the budget is set jointly (or by whoever creates the household).

**Flow A — Weekly planning (Sun evening, ~5 min)**
1. Open app → last week's list is pre-cloned ("staples" auto-included).
2. Toggle off what's not needed, add extras via type-ahead from the household catalog.
3. Estimate updates live: "Est. S$142 / Budget S$160" with a colour bar.
4. Tap "Share to WhatsApp" → formatted list lands in the family chat.

**Flow B — Shopping (in store)**
1. Open list in "shopping mode" (big checkboxes, grouped by aisle/category).
2. Check off items; partner sees updates live. Anything unavailable gets flagged for next week.
3. Start/stop timer optional (enhanced phase).

**Flow C — Post-purchase (30 sec)**
1. Snap photo of receipt → OCR/LLM extracts line items + prices.
2. App matches lines to catalog items (fuzzy match, user confirms uncertain ones once — mapping is remembered).
3. Actuals replace estimates; price memory updates; unplanned receipt lines become "bought outside plan" entries.
4. Partner gets WhatsApp summary: "Shop done: S$148 actual vs S$142 est. 92% of budget. 3 items rolled to next week."

**Flow D — Review (monthly, 2 min)**
Analytics screen: spend by category, budget adherence streak, items whose prices rose most, estimate accuracy trend.

---

## 4. Price Learning (the differentiator)

Keep it simple — no ML needed initially:

- Each catalog item keeps a price history: `(date, store, unit_price, qty, source: receipt|manual)`.
- **Predicted price = exponentially weighted moving average** of last N observations, weighted toward recency and the household's usual store. Fallback chain: household history → seeded SG defaults (a small static table of ~150 common items: rice, eggs 30s ~S$8.5, Meiji 2L ~S$6.4, etc.) → user-entered guess.
- Estimate confidence shown subtly: solid price (3+ observations) vs "~" prefix (seeded/1 observation).
- Receipt parsing: send receipt image to an LLM (Claude API) with a structured-output prompt returning `[{raw_text, qty, price}]`. This beats classic OCR for SG receipts (FairPrice/Sheng Siong/Cold Storage formats vary). Store the raw text → catalog-item mapping so repeat receipts auto-match.
- Later: detect promo patterns ("2-for-S$X" appears in raw line) to power the bulk-savings feature.

---

## 5. WhatsApp Integration — recommended approach

Two tiers; start with Tier 1 (free, zero approval friction):

**Tier 1 (MVP): share links out.** `https://wa.me/?text=<formatted list>` or the Web Share API. No Meta approval, no cost, works instantly. Covers "share list with spouse" and "send summary to family chat". The deep link back into the app (`https://app/list/<id>`) makes the WhatsApp message actionable.

**Tier 2 (later): WhatsApp Business Cloud API for inbound + notifications.**
- Utility template messages (cheap tier, ~80–90% less than marketing rate) for: "budget 90% used", "receipt processed", "Sunday planning reminder".
- The killer feature: **add items by messaging the bot** ("add milk, kangkong x2") — replies within the 24-hour service window are free. This makes WhatsApp itself an input surface, which is the lowest-friction UX possible for SG families.
- Needs a Meta Business account + a BSP or direct Cloud API setup; per-message fees apply for business-initiated templates. Defer until retention proves out.

Don't build the whole app *as* a WhatsApp bot: receipt review, analytics, and list reordering need a real UI.

---

## 6. Tech Stack Recommendation

**PWA-first.** Reasons: one codebase, installable on both partners' phones, no app-store review, camera access for receipts works, and WhatsApp share links work natively. Native app adds nothing at this stage.

| Layer | Choice | Why |
|---|---|---|
| Frontend | Next.js (React) PWA, Tailwind | Fast to build, installable, offline shell for in-store mode |
| Realtime sync | Supabase (Postgres + Realtime + Auth) | Free tier fits a household app; realtime channel = live co-editing of the list; row-level security per household |
| Receipt parsing | Claude API (vision, structured output) | Handles messy SG receipt formats without OCR pipeline |
| Notifications | Tier 1: wa.me links + Web Push. Tier 2: WhatsApp Cloud API | Zero-cost start, upgrade path defined |
| Hosting | Vercel + Supabase cloud | Free tiers cover MVP entirely |

**Data model (core tables):**

```
households(id, name, currency, weekly_budget, store_default)
members(id, household_id, name, phone, role)
catalog_items(id, household_id, name, category, default_qty, unit, is_staple)
price_points(id, catalog_item_id, price, qty, store, date, source)
weekly_lists(id, household_id, week_start, budget_snapshot, status)
list_items(id, weekly_list_id, catalog_item_id, qty, est_price, actual_price,
           status[planned|in_cart|bought|skipped|rolled], added_by)
receipts(id, household_id, image_url, store, total, shop_date,
         duration_min, parsed_json)
off_plan_purchases(id, household_id, description, category, amount, date, by)
```

---

## 7. Phasing

**Phase 1 — MVP (2–3 weekends of build):**
Household + members, shared realtime list, catalog with seeded SG prices, weekly budget + live estimate, clone-last-week, WhatsApp share link, manual price entry. *Success test: you and your wife run 3 consecutive weeks on it.*

**Phase 2 — Price learning:**
Receipt photo → LLM parse → confirm-and-learn loop, actual vs estimate, off-plan purchase quick-add, basic analytics (category donut, weekly trend, adherence).

**Phase 3 — Habits & enhanced:**
Budget streaks + end-of-week WhatsApp summary, bulk-offer suggestions from promo detection, shopping-time log + "move these 12 staples to a monthly FairPrice online order" suggestion, WhatsApp Cloud API bot for add-by-message and reminders.

---

## 8. Friction-killers (design principles)

- **Never start from blank.** Week auto-clones; staples auto-tick.
- **One-tap everywhere.** Add from catalog = 1 tap; check off = 1 tap; share = 1 tap.
- **Learn silently.** Ask the user to confirm a receipt mapping once, never again.
- **Budget as ambient signal**, not a nag — colour bar (green/amber/red), one WhatsApp nudge max per week.
- **Transparency by default:** every spend traceable to a receipt line or a logged off-plan entry; both partners see the same numbers.

---

## 9. Risks

Receipt formats vary and totals may include non-grocery items (FairPrice sells household goods) — mitigate with category tagging at parse time. WhatsApp Cloud API pricing/policy changes yearly — that's why Tier 1 carries the MVP. Habit features can feel judgy between partners — keep all nudges household-level, never "who overspent".

---

*Sources: [SingSaver — average grocery cost](https://www.singsaver.com.sg/personal-loan/blog/average-cost-of-groceries), [SmartCalculator SG grocery costs 2026](https://www.smartcalculator.sg/articles/singapore-groceries-cost-2026), [WhatsApp Business Platform pricing](https://developers.facebook.com/documentation/business-messaging/whatsapp/pricing), [respond.io WhatsApp API pricing 2026](https://respond.io/blog/whatsapp-business-api-pricing)*
