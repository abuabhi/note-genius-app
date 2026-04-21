

## Performance Optimization Plan

Goal: cut landing FCP from **4.1s → under 2s** and initial JS from **741KB → under 350KB**, without breaking any feature.

### 1. Remove heavy libraries from the initial bundle

**`vendor-charts` (recharts, 156KB)** — currently loaded on every route via the manualChunks config.
- Remove `recharts` from `vite.config.ts` `manualChunks`.
- Wrap every chart-using component (Analytics dashboard, admin dashboards) in `React.lazy` so recharts only downloads when a chart actually mounts.
- Audit: `src/pages/AnalyticsPage.tsx`, `src/components/analytics/*`, `src/components/admin/analytics/*`.

**`vendor-tiptap` (rich-text editor, ~200KB)** — same treatment.
- Already in its own chunk, but it's being imported eagerly somewhere on landing/dashboard. Find the eager import and convert to lazy.
- Likely culprit: a notes-related component imported at module top-level in a shared layout.

**`vendor-pdf` (pdfjs + jspdf + html2canvas + docx)** — verify it's truly only loaded on export actions, not eagerly imported anywhere.

**`@fullcalendar/*`** — split out of `vendor-charts`, lazy-load only on `/schedule`.

### 2. Optimize landing-page images

Hero + 6 testimonial avatars are unoptimized PNGs (~2.5MB total).
- Convert `public/lovable-uploads/hero.png` and the 6 avatar PNGs to WebP (keep PNG fallback via `<picture>`).
- Add explicit `width`/`height` attributes to prevent layout shift.
- Add `loading="lazy"` to all below-the-fold images (testimonials, logos).
- Keep the existing `<link rel="preload">` for hero, but point it at the WebP.

### 3. Trim provider waterfall in `App.tsx`

Currently 4 nested providers run before any route renders. Two are doing measurable work on cold start:
- **`ProductionOptimizationProvider`** — runs perf monitoring intervals; defer with `requestIdleCallback` like Sentry already is.
- **`SubscriptionProvider`** — should not block rendering; lazy-fetch subscription on first authenticated route, not at app boot.

### 4. Consolidate tiny vendor chunks

`vendor-auth`, `vendor-query`, `vendor-utils` are each <50KB but each costs an HTTP round-trip. Merge into a single `vendor-core` chunk in `vite.config.ts`.

### 5. Remove dead/duplicate code paths

- `src/utils/bundleOptimization.ts` — unused estimator, delete.
- `moment` is in `vendor-utils` but `date-fns` is also there. Pick one (date-fns) and remove `moment` from package.json + any imports.
- `src/components/performance/ImageOptimizer.tsx` is a re-export shim — leave for now (low risk).

### 6. Verify with a re-profile

After changes ship, re-run `browser--performance_profile` on `/` and `/dashboard` against the published build. Target table:

| Metric | Before | Target |
|---|---|---|
| Landing FCP | 4.1s | < 2.0s |
| Landing initial JS | 741KB | < 350KB |
| Long tasks > 200ms | yes | none |

If any target is missed, drill in with `start_profiling` on the offending route.

### Out of scope
- No feature changes, no UI redesign, no route reshuffles.
- Admin-only routes not optimized (low traffic).
- Service worker / HTTP/3 / image CDN — separate infra discussion.

### Risk
- Lazy-loading recharts/tiptap means a one-time ~200ms delay the first time a user opens analytics or a note editor — acceptable trade for landing-page win.
- Removing `moment` requires touching every file that imports it; I'll grep and convert each call site to `date-fns` equivalents in the same pass.

### Order of work
1. Image conversion (zero-risk, biggest LCP win)
2. `vite.config.ts` chunk reshuffle + lazy charts/editor
3. Defer `ProductionOptimizationProvider` + `SubscriptionProvider`
4. Remove `moment`, delete dead utils
5. Re-profile and report

