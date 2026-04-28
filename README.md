#  Last-Minute Chef

> **Cook what you have. Order what you don't.**

An AI micro-app that recommends recipes from ingredients you already have at home — factoring in dietary needs and allergies — and lets you order missing items directly from **Swiggy Instamart** in one tap.


## What It Does

Most households have a half-stocked fridge and no idea what to cook with it. Last-Minute Chef solves this in under 90 seconds:

1. **Enter your ingredients** — type what you have (paneer, spinach, onion, garlic…)
2. **Set your preferences** — dietary filters, allergies, meal type
3. **Get AI-generated recipes** — ranked by how many ingredients you already have
4. **See the cost gap** — each recipe shows missing ingredients + live Instamart pricing
5. **Order the difference** — one tap adds missing items to your Swiggy Instamart cart

No login required to browse recipes. Sign in with Instamart only when you want to save a recipe or place an order.

---

## Demo Flow

```
User enters: paneer, spinach, onion, garlic, tomato, cumin

AI returns:
  ✅ Palak Paneer        — missing: cream (₹45), kasuri methi (₹28)   → Total gap: ₹73
  ✅ Paneer Bhurji       — missing: capsicum (₹32)                    → Total gap: ₹32
  ✅ Paneer Stir-fry     — missing: soy sauce (₹55), bell pepper (₹38) → Total gap: ₹93

User picks "Palak Paneer" → sees full recipe → taps "Order Missing Items"
→ Prompted to sign in with Instamart
→ Cart populated with cream + kasuri methi via Swiggy Instamart MCP
→ Checkout → delivery ETA shown
```

---

## Key Features

| Feature | Details |
|---|---|
| **No login to browse** | Enter ingredients and get recipes instantly — no account needed |
| **Live Instamart pricing** | Each recipe shows the exact cost to fill the ingredient gap |
| **Dietary filters** | Vegetarian, Vegan, Jain, Gluten-Free, Dairy-Free, High-Protein, Low-Carb |
| **Allergy protection** | Hard constraints — allergenic recipes never shown, not just flagged |
| **One-tap ordering** | Missing ingredients added to Instamart cart in a single action |
| **Login on intent** | Swiggy Instamart sign-in triggered only when user saves or orders |
| **PWA** | Installable on Android and iOS homescreen, works on slow connections |

---

## Tech Stack

```
Frontend      Next.js (React) · Tailwind CSS · PWA
Hosting       Vercel
AI            AI API (server-side only — no keys on client)
Grocery       Swiggy Instamart MCP
Auth          Swiggy SSO (triggered on save / order intent)
Storage       localStorage (v1) → Postgres (v2)
```

### Architecture Overview

```
Browser
  │
  ├── /  (ingredient input + recipe display)   ← no auth required
  │
  └── [Save Recipe] or [Order Now] pressed
        │
        └── Swiggy SSO login flow
              │
              └── Authenticated session
                    │
                    ├── POST /api/recipes      → AI API (server-side)
                    │     returns: structured recipe JSON + missing ingredients
                    │
                    └── POST /api/order
                          ├── search_products  (Instamart MCP — per missing item)
                          ├── update_cart      (Instamart MCP — batch add)
                          └── track_order      (Instamart MCP — post checkout)
```

### Instamart MCP Endpoints Used

| MCP Tool | When It's Called |
|---|---|
| `search_products` | Map AI-generated ingredient names to real Instamart SKUs + fetch live prices |
| `update_cart` | Add confirmed missing items to user's Instamart cart |
| `get_cart` | Check for existing cart before adding; display cart summary |
| `checkout` | Initiate Instamart checkout flow |
| `track_order` | Show estimated delivery time after order placed |

---

## User Flow

```
┌─────────────────────────────────────────────────────┐
│  Enter ingredients + filters    (no login required)  │
└──────────────────────┬──────────────────────────────┘
                       │
              ┌────────▼────────┐
              │  AI generates   │
              │  3-5 recipes    │
              └────────┬────────┘
                       │
         ┌─────────────▼──────────────┐
         │  Recipe card               │
         │  ✓ Ingredients you have    │
         │  ✗ Missing: item · ₹price  │
         │  Total cost to order: ₹XX  │
         └──────┬───────────┬─────────┘
                │           │
         [View Recipe]  [Save / Order]
                │           │
                │    ┌──────▼──────────────┐
                │    │ Sign in with        │
                │    │ Swiggy Instamart    │
                │    └──────┬─────────────┘
                │           │
                │    ┌──────▼──────────────┐
                │    │ Cart populated      │
                │    │ Checkout → ETA      │
                │    └─────────────────────┘
                │
        ┌───────▼────────────────┐
        │ Full recipe view       │
        │ Step-by-step cooking   │
        │ (no login needed)      │
        └────────────────────────┘
```

---

## Versioning Roadmap

| Version | Focus | Key Deliverable |
|---|---|---|
| **v1.0** — MVP | Core flow | Ingredient input → AI recipes → Instamart cost preview → one-tap order |
| **v1.1** — Stability | Cost + reliability | Redis caching, product substitution fallback, analytics |
| **v2.0** — Persistence | User accounts | Swiggy SSO, saved recipes, cross-device preferences, order history |
| **v2.1** — Real-time | Social + batch | Background order polling, batch weekly ordering, recipe sharing |
| **v3.0** — Intelligence | AI + inventory | Predictive ingredient stocking, meal plans, voice input, dynamic pricing |

---

## Why This Matters for Swiggy

**Food waste is a ₹50,000 crore annual problem in India.** Last-Minute Chef converts that waste into Instamart orders — not by convincing users to buy more, but by helping them cook smarter with what they have.

The average missing ingredient basket is small (2–4 items, ₹80–200) but the intent is extremely high — the user already knows exactly what they want to cook. This creates a new category of Instamart orders that doesn't compete with regular grocery runs.

## Project Status

| Item | Status |
|---|---|
| PRD & product specification | ✅ Complete |
| Versioned roadmap (v1.0 → v3.0) | ✅ Complete |
| Frontend scaffold (Next.js + Tailwind) | 🔄 In progress |
| AI recipe generation (server-side) | 🔄 In progress |
| Instamart MCP integration | ⏳ Awaiting API credentials |
| Swiggy SSO auth flow | ⏳ Awaiting API credentials |
| Vercel deployment | ⏳ Pending credentials |

> Instamart MCP credentials have been applied for via the Swiggy Builders Club programme. Integration will be completed within 48 hours of provisioning.

---

## Open Questions

Issues are tracked for the following pre-build decisions:

- [ ] **OQ-1** — Auth model: Swiggy SSO flow confirmation
- [ ] **OQ-2** — Product matching: tiebreaker logic for multiple Instamart SKUs
- [ ] **OQ-3** — Location: GPS auto-detect vs manual pin vs Swiggy account inherit
- [ ] **OQ-4** — Rate limits: `search_products` call budget per session
- [ ] **OQ-7** — Cart merge: add to existing cart vs new cart prompt
