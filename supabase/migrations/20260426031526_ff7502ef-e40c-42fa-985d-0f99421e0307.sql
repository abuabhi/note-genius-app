
INSERT INTO public.admin_todos (title, description, priority, status, created_by)
SELECT
  'Build end-to-end email marketing sequence',
  E'Set up a re-engagement / lifecycle email sequence for users who signed up but havent used core features (e.g. no notes created).\n\nUse a dedicated marketing platform (Loops, Customer.io, Resend Broadcasts, or Mailchimp) on a SEPARATE subdomain from the Lovable auth/transactional email subdomain to protect sender reputation.\n\nScope:\n- Dormant-user export from Supabase (users with notes_count=0 after N days)\n- Welcome -> nudge -> re-engagement cadence\n- "Create your first note" deep link (/notes/new?source=email)\n- Unsubscribe handling\n- Performance tracking (open/click/conversion)',
  'high',
  'todo',
  id
FROM auth.users
WHERE email = 'abhinav.paul.sharma@gmail.com'
LIMIT 1;
