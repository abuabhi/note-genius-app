

## Pre-Launch Fix Plan

You don't need to "see a report" — the audit findings ARE this plan. Here's everything that needs fixing before go-live, in priority order. Approve and I'll execute all of it in one pass.

### 🔴 Block-launch fixes (must do)

**1. Re-verify the live build**
You republished — I'll re-run the performance profile on `prepgenie.lovable.app` to confirm landing FCP is now under 2s and initial JS under 350KB. If the numbers are still bad, the publish didn't take and we'll investigate.

**2. Remove `moment` (~290KB unused dependency)**
- `npm uninstall moment`
- Grep for any leftover `import moment` and convert to `date-fns` (already in the project).

**3. Fix Stripe webhook lifecycle gaps**
File: `supabase/functions/stripe-webhook/index.ts`
Currently only handles `checkout.session.completed`. Add handlers for:
- `customer.subscription.updated` — sync plan changes (upgrades/downgrades)
- `customer.subscription.deleted` — revoke access on cancellation
- `invoice.payment_failed` — flag account, optionally email user

Without these, paying customers who cancel will keep access, and failed renewals won't be caught.

**4. Fix Vite env var bug in `useUnifiedReminderSystem`**
Uses `process.env.NODE_ENV` (Node-only, undefined in Vite → silently broken). Replace with `import.meta.env.MODE`.

### ⚠️ Fix-before-launch polish

**5. Replace native browser dialogs**
- 2× `alert()` calls → shadcn `toast()`
- 6× `window.confirm()` calls → shadcn `<AlertDialog>`
Native dialogs look unprofessional and break on mobile webviews. I'll list exact files when executing.

**6. SEO basics for landing**
- Generate a branded `og-image.png` (1200×630) for social sharing
- Confirm `<title>`, `<meta description>`, OG tags are set on HomePage
- `robots.txt` and `sitemap.xml` already exist (verified) ✅

**7. Code-split the 921KB `vendor-pdf` chunk**
Currently lazy-loaded ✅, but it's huge. Split `pdfjs` (viewer) from `jspdf`+`html2canvas`+`docx` (export) so users who only export don't download the viewer.

### ✅ Confirmed healthy (no action)
- RLS security scan: clean
- No memory leaks (timers, listeners, Supabase channels all cleaned up)
- React Query config follows project standards
- Filter/search standardization: already consistent via `UniversalFilters`

### Order of execution
1. Re-profile live site (confirms #1)
2. Uninstall moment + grep cleanup (#2)
3. Stripe webhook handlers (#3)
4. Env var fix (#4)
5. Replace alert/confirm dialogs (#5)
6. OG image + meta tag check (#6)
7. PDF chunk split (#7)
8. Final re-profile → go/no-go verdict

### Out of scope
- New features, redesign, admin route optimization, load testing.

### Risk
- Stripe webhook changes need testing in Stripe test mode before live keys flip on. I'll add the handlers but you must trigger test events from the Stripe dashboard to confirm.

