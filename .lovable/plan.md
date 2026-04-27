# Cap study session counters per card (one rating per card, with overrides)

## The bug
On the study page, each click on Hard / Needs Practice / Medium / Easy / Mastered increments `studiedToday` (and sometimes `masteredCount`) — with no per-card de-duplication. So a 10-card set can show "23 today" and "10/10" progress with mismatched mastered count, just by clicking buttons multiple times.

Root cause: `src/hooks/useOptimizedFlashcardStudy.ts` only does `setStudiedToday(prev => prev + 1)` and `setMasteredCount(prev => prev + 1)` — no record of which cards have already been rated this session, and no upper bound.

## Fix — track rating per card, allow changes

Track a per-session map: `cardRatings: Record<cardId, choice>`. Derive all counters from this map instead of incrementing freely.

Behavior:
- **First rating for a card** → adds it to the map, advances to next card.
- **Re-rating the same card (e.g. Needs Practice → Mastered)** → updates the map entry; counters recompute. Does NOT double-count, does NOT advance again.
- All counters are derived: `studiedToday = Object.keys(map).length`, `masteredCount = count where choice === 'mastered'`, `needsPracticeCount = count where choice === 'needs_practice'`, etc.
- Hard caps as a safety net: every counter is `Math.min(value, totalCards)`.

This naturally enforces:
- `studied ≤ totalCards`
- `mastered ≤ totalCards`
- "23 today" bug becomes impossible — if 10 cards exist, max is 10.
- User can still freely change a rating (Needs Practice → Mastered → Easy etc.) and the right counters update.

## UX detail — re-rating mid-session

Currently every click auto-advances to the next card after 500ms. With the new logic:
- If the card has **not** been rated yet this session → rate + advance (current behavior).
- If the card **has** already been rated → just update the rating, show a small toast like "Updated to Mastered", don't auto-advance (user is clearly correcting themselves).

The Previous button already lets users go back to a card to re-rate it.

## Technical details

File: `src/hooks/useOptimizedFlashcardStudy.ts`
- Replace `studiedToday` / `masteredCount` `useState` numbers with a `Record<string, Choice>` ratings map.
- Compute `studiedToday`, `masteredCount`, `needsPracticeCount`, `easyCount`, `mediumCount`, `hardCount` via `useMemo` from the map, each clamped to `totalCards`.
- In `handleCardChoice`: check `ratings[currentCard.id]`; if present, just update map (no advance, optional toast); if absent, set map then advance.
- Keep DB update (difficulty / `last_reviewed_at`) on every click — that's the user's latest rating.
- Return the same shape (`studiedToday`, `masteredCount`, `progressStats`) so consumers don't change.

No DB migration. No other components need changes — `StudySessionManager.tsx` and the progress UI just consume the derived numbers.

## Out of scope
- Cross-session "today" counter (would need a DB-backed query of `last_reviewed_at >= today`). Current scope is the in-session counter shown in the progress card.
- Disabling buttons after rating — explicitly NOT doing this; user should be able to change their mind, that's the second half of the request.
