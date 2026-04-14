# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

@AGENTS.md

## Commands

```bash
npm run dev      # Start dev server (Next.js 16 with Turbopack)
npm run build    # Production build
npm run lint     # ESLint check
```

No test framework is configured yet.

## Architecture

This is a **Next.js 16 / React 19** app (App Router) for testing PayPal Pay Later eligibility. Two core tools:

1. **Eligibility Check** (`/eligibility`) — calls the internal Edge API route to probe PayPal's credit-presentment endpoint for every country in `COUNTRY_LIST` without loading the SDK. Runs all checks in parallel via `Promise.all`.

2. **Checkout Demo** (`/checkout`) — dynamically injects the PayPal JS SDK script into `<head>`, uses `isFundingEligible(PAYLATER)` to check eligibility, then renders the PayLater button + message. Country changes trigger a full SDK teardown + reload cycle.

### Key files

| Path | Purpose |
|------|---------|
| `src/lib/paypal.ts` | PayPal Client IDs (live & checkout) and base URL helper |
| `src/lib/countries.ts` | `COUNTRY_LIST`, `CHECKOUT_COUNTRIES`, `COUNTRY_CURRENCY`, `COUNTRY_LABELS` |
| `src/app/api/paylater-check/route.ts` | Edge runtime GET handler — proxies to PayPal credit-presentment and returns `{ http_code }` |
| `src/components/StatusCard.tsx` | Per-country result card (`pending` / `success` / `error`) |
| `src/components/LogPanel.tsx` | Timestamped log list shown below results |

### Data flow — Eligibility page

```
User clicks "Run" → runTests()
  → Promise.all(COUNTRY_LIST.map(checkCountry))
    → fetch /api/paylater-check?buyer_country=XX&client_id=...
      → Edge route proxies to paypal.com/credit-presentment/smart/message
      → returns { http_code: 200 | 403 | ... }
  → setResults() per country as each resolves
```

### Data flow — Checkout page

```
Country selected → loadPayPalSDK(country)
  → cleanupPayPalSDK()   (remove old script + clear window.paypal)
  → inject <script src="paypal.com/sdk/js?...buyer-country=XX...">
  → script.onload → checkEligibility(sdk, country)
    → sdk.isFundingEligible(PAYLATER)
    → if eligible: sdk.Buttons(...).render() + sdk.Messages(...).render()
```

## Important notes

- The API route uses `export const runtime = "edge"` — keep it Edge-compatible (no Node.js APIs).
- `src/lib/paypal.ts` contains **hardcoded public PayPal Client IDs** for demo purposes. Do not treat these as secrets, but do not add real merchant credentials here.
- The checkout page uses a unique `namespace` per SDK load (`paypal_${country}_${timestamp}`) to avoid collisions when switching countries rapidly.
- `COUNTRY_LIST` (eligibility) and `CHECKOUT_COUNTRIES` (checkout dropdown) are separate lists in `countries.ts` — keep them in sync intentionally when adding countries.
