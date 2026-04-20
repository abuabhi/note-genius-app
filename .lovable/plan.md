
The user wants a detailed, step-by-step plan to address the production-readiness issues identified in the previous audit. I'll group the fixes by priority/risk and explain each one clearly so a non-technical reader understands what's broken, why it matters at scale, and how we'll fix it.

Key issues to address:
1. Mock implementations still in code (`useGemini.ts`, `useCachedAnalytics.ts`)
2. Three competing QueryClient instances → fragmented cache
3. Aggressive 30s polling on subscription refresh
4. No route-level code splitting → 28s initial load
5. Load tests hit fake `/api/` URLs instead of real Edge Functions
6. No per-IP rate limiting on AI Edge Functions

I'll order by impact and risk: quick safe wins first, then performance, then resilience/scale.
