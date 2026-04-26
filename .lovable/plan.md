## Plan: Properly format note emails (render markdown → HTML)

### Problem
The email currently shows raw markdown syntax (`#`, `**bold**`, `-`, `_italic_`) because `send-note-email` only converts newlines to `<br>`. Headings, bold, italic, lists, and code blocks aren't rendered.

### Fix
Convert the note content from markdown to HTML inside the edge function before sending, and apply clean email-safe styling.

**Steps:**

1. **Render markdown to HTML in `supabase/functions/send-note-email/index.ts`**
   - Import `marked` (Deno-compatible: `https://esm.sh/marked@12`) — small, battle-tested, no DOM needed.
   - Sanitize the result with a lightweight allowlist (strip `<script>`, `on*` handlers, `javascript:` URLs) since content originates from user notes / AI output.
   - Replace the current `content.replace(/\n/g, '<br>')` with the rendered HTML.

2. **Improve the email template styling** (inline CSS, email-client safe)
   - Proper styles for `h1/h2/h3`, `p`, `ul/ol/li`, `strong`, `em`, `code`, `pre`, `blockquote`, `a`, `hr`.
   - Constrain width (~640px), comfortable line-height (1.6), readable font sizes.
   - Keep the existing PrepGenie mint accent for headings and the personal-message callout.
   - Remove the `white-space: pre-wrap` from `.content` (no longer needed once HTML is rendered) so paragraphs/lists collapse correctly.

3. **Plain-text fallback**
   - Generate a plain-text version (strip markdown symbols) and pass it as `text` alongside `html` to Resend. Improves deliverability and supports text-only clients.

4. **Subject line cleanup**
   - Current default `Note: <title> - <contentType>` — keep, but ensure no markdown leaks into the subject (strip any `#`/`*` from title).

### Files touched
- `supabase/functions/send-note-email/index.ts` — markdown rendering, sanitization, restyled HTML template, plain-text fallback.

### Out of scope (can do later if you want)
- Embedding images from notes (would need uploading to storage and rewriting `<img src>`).
- A full React Email template — overkill for this single function; inline-styled HTML is enough and easier to iterate on.

### Verification
After deploy, send a test email from the same note. Headings should render as styled headings, `**bold**` as bold, lists as bullet lists, and the personal message stays in its mint callout box.
