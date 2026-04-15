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

### Data flow — All Countries Message Section (2026-04-15)

Checkout page contains a dedicated section below the payment area that displays PayLater Messages for all 8 supported countries simultaneously. Uses a single shared SDK script:

```
<Script id="paypal-message-sdk" data-namespace="PayPalMessageSDK"
  src="https://www.paypal.com/sdk/js?client-id=test&components=messages" />

JSX: {supportedCountries.map(country => (
  <div key={country.value} data-pp-message data-pp-placement="product"
      data-pp-amount="160" data-pp-buyercountry={country.value} />
))}
```

SDK auto-scans and renders all `data-pp-message` elements after script loads. Each card shows country label + rendered message in a bordered pill container.

## Important notes

- The API route uses `export const runtime = "edge"` — keep it Edge-compatible (no Node.js APIs).
- `src/lib/paypal.ts` contains **hardcoded public PayPal Client IDs** for demo purposes. Do not treat these as secrets, but do not add real merchant credentials here.
- The checkout page uses a unique `namespace` per SDK load (`paypal_${country}_${timestamp}`) to avoid collisions when switching countries rapidly.
- `COUNTRY_LIST` (eligibility) and `CHECKOUT_COUNTRIES` (checkout dropdown) are separate lists in `countries.ts` — keep them in sync intentionally when adding countries.
- When `buyer-country` currency mismatches the SDK load currency, PayPal returns `paypal_messages_buyer_country_currency_mismatch`. The all-countries message section avoids this by using a separate message-only SDK script with a generic `client-id=test` and letting `data-pp-buyercountry` attribute drive per-card rendering.

## Changelog

### 2026-04-15
- Added "All Countries PayLater Message" section to checkout page — displays all 8 supported countries' PayLater Messages simultaneously using `data-pp-message` auto-rendering with a single shared SDK script (`PayPalMessageSDK` namespace)
- Fixed bug: `data-pp-buyercountry` was incorrectly passing the full country object instead of `country.value`
- Added country label above each message card
- Added GitHub link to homepage
- Rewrote README.md to reflect project scope
