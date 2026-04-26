## Goal

Make headings across **all five study tabs** (Original++, Summary, Key Points, Top 10 Questions, **and Enriched Note**) look identical:
- Same dark forest green (`#1f5a3d` — already used in Enriched headings, matches the green in your screenshot).
- Same size hierarchy regardless of whether content is markdown (`#`, `##`) or HTML (`<h2>`).
- Enriched green block/card styling (mint background, badge, border-left) **stays exactly as today** — only the heading color/size inside it is normalized.

## What's wrong today

| Tab | Heading source | Color today |
|---|---|---|
| Original++ | markdown `#`, `##` | bright mint `--primary` |
| Summary | HTML `<h2>` | unstyled / inherits |
| Key Points | bullets only | n/a |
| Top 10 Questions | markdown `#`, `##` | bright mint `--primary` |
| Enriched Note | HTML inside green card | dark forest `#1f5a3d` ← target |

Two real problems: color mismatch (bright mint vs dark forest) and inconsistent heading scale.

## Plan

### 1. Add one shared heading token

In `src/index.css` (both `:root` and `.dark`):
```
--study-heading: 151 49% 24%;   /* ≈ #1f5a3d, matches Enriched */
```
Does **not** touch `--primary` (that drives buttons, tabs, etc.).

### 2. Standardize one heading scale used everywhere

| Level | Size | Weight |
|---|---|---|
| h1 | 1.5rem | 700, bottom border |
| h2 | 1.25rem | 700 |
| h3 | 1.1rem | 600 |
| h4 | 1.0rem | 600 |

All in color `hsl(var(--study-heading))`.

### 3. `PlainTextNoteRenderer.tsx` (Original++, Summary fallback, Key Points, Questions)

- Replace inline `color: 'hsl(var(--primary))'` on h1–h4 with `hsl(var(--study-heading))`.
- Apply the size/weight scale above.
- Bullet dots stay `--primary` (small accent only).

### 4. `SimpleContentRenderer.css`

Add rules so the Summary HTML branch (`<h2>`) gets the same styling:
```
.study-safe-content h1 { font-size:1.5rem;  font-weight:700; color:hsl(var(--study-heading)); ... }
.study-safe-content h2 { font-size:1.25rem; font-weight:700; color:hsl(var(--study-heading)); ... }
.study-safe-content h3 { font-size:1.1rem;  font-weight:600; color:hsl(var(--study-heading)); ... }
.study-safe-content h4 { font-size:1.0rem;  font-weight:600; color:hsl(var(--study-heading)); ... }
```

### 5. `EnrichedContentRenderer.css` — minimal, surgical update

Only the heading rule changes. Card background, badge, border-left, padding, shadow — **all untouched**.

Change:
```
.enriched-content .ai-enriched-body h1..h6 {
  color: #1f5a3d !important;   /* hardcoded today */
  margin: 0.4rem 0;
  font-weight: 700;
}
```
to use the shared token + the new scale:
```
.enriched-content .ai-enriched-body h1 { color: hsl(var(--study-heading)) !important; font-size:1.5rem;  font-weight:700; margin:0.5rem 0; }
.enriched-content .ai-enriched-body h2 { color: hsl(var(--study-heading)) !important; font-size:1.25rem; font-weight:700; margin:0.5rem 0; }
.enriched-content .ai-enriched-body h3 { color: hsl(var(--study-heading)) !important; font-size:1.1rem;  font-weight:600; margin:0.4rem 0; }
.enriched-content .ai-enriched-body h4,
.enriched-content .ai-enriched-body h5,
.enriched-content .ai-enriched-body h6 { color: hsl(var(--study-heading)) !important; font-size:1.0rem; font-weight:600; margin:0.4rem 0; }
```
Also normalize the matching `.ai-enriched-body strong` color (`#1f5a3d`) to `hsl(var(--study-heading))` so inline emphasis stays consistent. Same color, just tokenized.

That's it for Enriched. No touch to `.ai-enriched-card`, `.ai-enriched-badge`, `.ai-enriched-body p/ul/ol/li`, hide-coloring rules, or `ExpandableContentRenderer.tsx`.

## Files to edit

1. `src/index.css` — add `--study-heading` token.
2. `src/components/notes/study/viewer/PlainTextNoteRenderer.tsx` — swap heading color + apply scale.
3. `src/components/notes/study/SimpleContentRenderer.css` — add `.study-safe-content` heading rules for Summary HTML.
4. `src/components/notes/study/EnrichedContentRenderer.css` — heading color + scale only (card/badge/layout untouched).

## Files NOT touched

- `ExpandableContentRenderer.tsx` and the rest of the expansion pipeline
- Any AI generation / edge function
- `--primary` token, tabs, buttons

## Result

All five tabs use the same dark forest green at the same heading sizes. Enriched cards still look like Enriched cards — green background, badge, border — just with normalized heading typography that now matches every other tab.