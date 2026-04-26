## Goal

Add a continuously rotating gradient border to the **Generate** button in the Note Study enhancement panel — but only while the user has not yet generated content for that tab. Once content exists (so the button reads "ReGenerate"), the border returns to its plain static style.

## What changes for the user

- On any enhancement tab (Summary, Key Points, Enriched Note, Top 10 Questions) where nothing has been generated yet, the **Generate** button shows a smooth conic-gradient border that rotates continuously, drawing the user's attention.
- While generating (loading) the animation pauses and the standard spinner shows.
- After successful generation the button switches to **ReGenerate** with the normal static mint border — no animation.
- Honors `prefers-reduced-motion` (animation disabled for users who request reduced motion).

## Files to change

1. `src/index.css` — add a small block defining:
   - `@property --gen-a` (registered angle custom property for smooth conic animation)
   - `@keyframes gen-border-spin`
   - `.gen-animated-border` utility class using a `linear-gradient(white,white) padding-box, conic-gradient(...) border-box` trick + `animation: gen-border-spin 2.5s linear infinite`
   - `:hover` variant that swaps the inner fill to mint-50 to match the existing hover state
   - `@media (prefers-reduced-motion: reduce)` to disable the animation
   - Colors use the existing `hsl(var(--primary))` token so it follows the theme.

2. `src/components/notes/study/SimpleEnhancementTabs.tsx` — change the Generate button's `className` to be conditional:
   - `gen-animated-border` when `!tab.hasContent && !isLoading(...)` (first-time CTA)
   - `border-mint-200` otherwise (current behavior, used for ReGenerate and while loading)
   - All other classes (`bg-white hover:bg-mint-50 text-mint-700 hover:text-mint-800`) stay the same.

## Technical notes

- The `@property --gen-a` registration is what makes the conic-gradient angle interpolate smoothly; without it browsers can't animate the angle.
- The `linear-gradient(white,white) padding-box, conic-gradient(...) border-box` pattern is the standard way to render an animated gradient *border* without affecting the button's text color or fill. Border width is `2px` (close to the existing 1px so the layout doesn't shift visibly).
- Animation duration: 2.5s — slow enough to feel premium, fast enough to read as "active".
- No changes to button behavior, click handler, disabled state, or generation logic.

## Out of scope

- Applying the same animated border to other Generate-style buttons elsewhere in the app (can be a follow-up — the utility class is reusable).
- Changing copy, icons, or layout of the enhancement tabs.
