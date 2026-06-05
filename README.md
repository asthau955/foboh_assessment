# Foboh — Supplier bespoke pricing

React UI + Node.js API for building customer-specific pricing profiles and resolving overlapping rules (the wholesale “three profiles, one SKU” problem).

## Quick start

```bash
# Terminal 1 — API (port 3001)
cd backend && npm install && npm run dev

# Terminal 2 — UI (port 5173)
cd frontend && npm install && npm run dev
```

- UI: http://localhost:5173  
- OpenAPI / Swagger: http://localhost:3001/api/docs  

## Features

**Supplier UI**

- Filter products by title, SKU, sub-category, segment, brand  
- Select products (including select-all on the current filter)  
- Fixed ($) or dynamic (%) adjustment, increase or decrease  
- Override mode for explicit contract prices  
- Preview adjusted prices before save  
- Save profiles via `POST /api/pricing-profiles`  
- **Price resolver** tab: pick customer + product, see final price, winning profile, and ranked losers  

**API**

- In-memory store with seeded catalogue + scenario profiles A/B/C  
- Zod validation on write paths  
- CRUD: `/api/pricing-profiles`  
- Preview: `POST /api/pricing-profiles/preview`  
- Resolve: `GET /api/resolve-price?customerId=&productId=`  

## Price calculation

| Kind | Formula |
|------|---------|
| Calculated fixed | `New = round(Base ± Adjustment)` |
| Calculated dynamic | `New = round(Base ± (Adjustment% × Base))` |
| Override | `New = TargetPrice` (ignores base; still clamped ≥ 0) |

**Guards:** amounts rounded half-up to 2 decimal places; final price never below `$0.00`.

## Precedence rule (overlapping profiles)

Profiles **never stack**. Exactly one profile applies per customer × product. When several match, pick the winner by comparing these keys **in order** (first difference wins):

### 1. Targeting specificity (higher wins)

Sum of customer score + product score:

| Customer scope | Score |
|----------------|-------|
| Named customer | 300 |
| Customer group (membership) | 200 |

| Product scope | Score |
|---------------|-------|
| Explicit SKU / selected product IDs | 400 |
| Sub-category (exact string match) | 300 |
| Segment (see wine family below) | 200 |
| All products | 100 |

A profile that does not match the customer or product is excluded.

**Wine family:** segment value `Wine` in a profile also matches catalogue segment `Wines` (and vice versa). Real catalogues split labels; contracts usually mean the same aisle.

### 2. Adjustment kind (higher wins)

| Kind | Score |
|------|-------|
| `override` (contract / shelf price) | 50 |
| `calculated` (discount or markup) | 0 |

Rationale: a price agreed with one account is a commercial commitment; category promos should not silently replace it when specificity is equal.

### 3. Supplier priority (higher wins)

Integer `priority` on the profile (default `0`). Lets the supplier break ties deliberately (e.g. “national promo beats regional”).

### 4. Customer-favouring tie-break (lower final price wins)

If still tied, the customer pays the **lowest** computed price.

Rationale: when two rules are equally specific and the supplier has not set priority, defaulting to the cheaper outcome avoids surprise invoices and matches how buyers expect conflicting promos to behave. (If you need margin protection instead, raise `priority` on the profile you want to win.)

---

## Seed scenario — what does Bondi pay?

**Customer:** Bondi Cellars — in groups *Independent Retailers* and *VIP*.

**Product:** Koyama Methode Brut Nature NV (`KOYBRUN`), base **$120.00**.

| Profile | Rule | Scope | Computed |
|---------|------|-------|----------|
| A | 10% decrease | Wine segment · Independent Retailers | $108.00 |
| B | $15 decrease | Wine Sparkling sub-cat · VIP | $105.00 |
| C | Override **$95** | Bondi Cellars · this SKU only | **$95.00** |

**Winner: Profile C → Bondi pays $95.00**

Why:

1. Specificity: C scores **700** (customer 300 + SKU 400). B scores **500**, A scores **400**.  
2. C is also an **override**, so it would still beat calculated rules even at equal specificity.  
3. Priority and tie-break are not needed here.

### API example

```http
GET /api/resolve-price?customerId=cust-bondi&productId=prod-koybrun
```

```json
{
  "finalPrice": 95,
  "profileName": "Profile C — Bondi Cellars KOYBRUN @ $95",
  "reason": "Profile \"Profile C — Bondi Cellars KOYBRUN @ $95\" applies because it has the highest targeting specificity among 3 matching profile(s). ..."
}
```

Use the **Price resolver** tab in the UI for the same output with a ranked table.

## Deliberate product decisions

| Topic | Choice |
|-------|--------|
| **Rounding** | Half-up to 2 dp on every intermediate and final amount |
| **Negative prices** | Clamped to `$0.00` after calculation |
| **“All products” over time** | Scope is evaluated at **order time** against the current catalogue; new SKUs are included automatically; deleted SKUs no longer match SKU-scoped rules and fall back to base price if nothing else applies |
| **Deleted products** | `resolve-price` returns 404 for unknown `productId`; historical orders would keep snapshots (out of scope for this exercise) |
| **No stacking** | One profile only — avoids compounding discounts that erode margin without explicit supplier intent |

## Project layout

```
backend/   Express + TypeScript, Zod, Swagger UI
frontend/  Vite + React
```

## Tech

- Node 20+, Express, Zod, yamljs + swagger-ui-express  
- React 19, Vite 6  
