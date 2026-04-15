# PayPal PayLater Message Dashboard

A **Next.js 16 / React 19** developer tool for testing PayPal Pay Later eligibility and rendering.

## Main Features

### 1. Eligibility Check (`/eligibility`)
Batch-tests PayPal Pay Later eligibility across 8 countries (US, GB, DE, FR, IT, ES, AU, CA) via the PayPal credit-presentment API — no SDK required. All checks run in parallel with `Promise.all`.

### 2. Checkout Demo (`/checkout`)
Simulated checkout page demonstrating:
- Dynamic PayPal SDK injection per buyer country
- `isFundingEligible(PAYLATER)` eligibility detection
- PayLater button rendering via `sdk.Buttons()`
- **All-countries PayLater Message section** — a dedicated `data-pp-message` auto-rendering area using a single shared SDK script (`PayPalMessageSDK` namespace). Shows messages for all 8 supported countries simultaneously.

## Key Implementation Notes

- The Checkout page uses a unique `namespace` per SDK load to avoid collisions when rapidly switching countries
- Currency mismatches between `buyer-country` and SDK load currency can cause `paypal_messages_buyer_country_currency_mismatch` errors — handled by using a separate message-only SDK script
- `COUNTRY_LIST` (eligibility) and `CHECKOUT_COUNTRIES` (checkout) are intentionally separate lists in `countries.ts`

## Getting Started

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) — choose Eligibility Check or Checkout Demo from the homepage.

## Tech Stack

- Next.js 16 (App Router, Turbopack)
- React 19
- PayPal JS SDK v5 (dynamically injected, no npm package)
- Edge Runtime API route for credit-presentment proxy
