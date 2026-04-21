

## Replace `/help` redirect with a real in-app Help Center

### Problem
- `/help` currently shows a spinner for 2 seconds then redirects to `https://prepgenie.gitbook.io/help/` (external, may be empty/unmaintained).
- Users land on a useless intermediate screen, then often a broken or generic page.
- Meanwhile the app has 7+ major surfaces (Notes, Flashcards, Quiz, Schedule, Goals, Analytics, Resources, Referrals, Account/Tiers) with no in-app guidance.
- `/faq` exists but is Q&A-style, not feature-walkthrough.

### Solution
Rewrite `HelpRedirectPage.tsx` as a proper in-app Help Center. Keep the route `/help` so all 13 existing inbound links keep working. Remove the redirect entirely.

### Page structure

1. **Hero + search** — "How can we help?" with a search box that filters help topics live.
2. **Quick start** (3 cards) — "Create your first note", "Generate flashcards from a note", "Take your first quiz". Each links to the relevant page with a 1-line how-to.
3. **Browse by feature** (accordion grid, grouped to mirror sidebar):
   - **Study**: Notes (create, import PDF, OCR, AI enrich, chat with notes) · Flashcards (create, AI-generate, study modes, spaced repetition) · Quiz (generate from note, take, review)
   - **Plan**: Schedule (events, reminders, study planner) · Goals & Tasks
   - **Insight**: Analytics (sessions, progress) · Resources
   - **Account**: Tiers & limits, upgrading, billing, referrals
   - **AI**: How AI generation works, quality safeguards, reporting bad output, monthly limits
   - **Troubleshooting**: Autosave/draft recovery, hitting limits, slow app, import issues
   Each topic = short paragraph + "Open feature" button to the live route.
4. **Still need help?** footer card — link to `/contact` and `/feedback`, plus link to full `/faq`.

### Files to change
- **Rewrite** `src/pages/HelpRedirectPage.tsx` → rename component to `HelpCenterPage` (keep file name to avoid touching imports, or rename file + update `publicRoutes.tsx` import). Remove all redirect logic and external GitBook references.
- **Update** `GITBOOK_SETUP.md` — mark deprecated, or delete (notes-only).
- No route changes needed (`/help`, `/help-center`, `/help-centre` all keep working).
- No sidebar changes needed.

### Content sourcing
Reuse copy from existing `FAQPage` answers + the audit findings (autosave, quiz draft recovery, AI quality gates, tier limits) so help reflects what the app actually does today, including the recent improvements (note autosave, quiz draft, AI report-bad-output, etc.).

### Design
- Match existing app aesthetic (mint accents, white cards, `Layout` wrapper, `Helmet` for SEO).
- Use existing `Accordion`, `Card`, `Input`, `Button` shadcn primitives.
- Mobile-first single column → 2-col on `md:` for topic grid.
- All inline links use react-router `<Link>` (not `<a>`) for SPA navigation.

### Out of scope
- No new backend/tables.
- No video tutorials (placeholder text only).
- No internationalization.
- Not touching `/faq` (kept as deeper Q&A reference, linked from new help page).

