## Plan: Add RESEND_API_KEY and verify email delivery

### What I'll do

1. **Prompt for the secret** — Trigger the secret-add flow for `RESEND_API_KEY` so you can paste your key from https://resend.com/api-keys. It's stored encrypted and only accessible to edge functions.

2. **Redeploy `send-note-email`** — Force a redeploy so the function picks up the new secret immediately.

3. **Test the email flow** — Tail the edge function logs while you send a test email from the export dialog so we can confirm:
   - The function is invoked
   - Resend accepts the request
   - Any delivery error (e.g. unverified domain) is surfaced clearly

### Important — Domain verification

The current `from` address is `noreply@prepgenie.io`. For Resend to actually deliver (not just accept) the email, `prepgenie.io` must be verified as a sending domain in your Resend dashboard (SPF + DKIM DNS records added).

If `prepgenie.io` is **not yet verified**, I'll temporarily switch the `from` address to `onboarding@resend.dev` (Resend's shared testing sender) so you can confirm end-to-end delivery while you complete domain verification separately. Once verified, we flip it back to `noreply@prepgenie.io`.

### Files touched

- `supabase/functions/send-note-email/index.ts` (only if we need to swap the `from` address for testing)

### What I need from you

- Approve this plan, then paste the Resend API key when the secret prompt appears.
- Tell me whether `prepgenie.io` is already verified in Resend, or if I should use the testing sender for the first send.
