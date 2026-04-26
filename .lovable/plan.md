## Admin ToDo Tracker

A private task tracker for DEAN-tier admins to manage internal build/ops work — fully separate from the user-facing study todos (which live in `study_goals`).

### Database

New table `admin_todos`:
- `title` (text, required)
- `description` (text, optional — supports multi-line notes)
- `status`: `todo` | `in_progress` | `done` (default `todo`)
- `priority`: `low` | `medium` | `high` (default `medium`)
- `due_date` (timestamptz, optional)
- `created_by` (uuid → auth.users)
- `completed_at` (timestamptz, set when status flips to `done`)

**RLS:** Only DEAN-tier users can select/insert/update/delete (uses the existing `is_dean_user(uid)` function already used by other admin features). No per-user ownership — it's a shared admin board.

Trigger to auto-set `completed_at` when status changes to `done`.

### Backend

No edge functions needed — direct Supabase client calls from the admin page, gated by RLS.

### Frontend

**New page:** `src/pages/AdminTodosPage.tsx` at route `/admin/todos`
- Wrapped in `AdminLayout` with the standard DEAN guard already used by `AdminUsersPage`
- Uses `StandardPageHeader` for consistency

**Components** (in `src/components/admin/todos/`):
- `AdminTodoList.tsx` — grouped by status (To Do / In Progress / Done) with collapsible Done section
- `AdminTodoItem.tsx` — checkbox to toggle done, status dropdown, priority badge, due date, edit/delete actions
- `AdminTodoFormDialog.tsx` — create/edit dialog with title, description, priority, due date
- `useAdminTodos.ts` hook — react-query CRUD against `admin_todos`

**Wiring:**
- Register route in `src/routes/adminRoutes.tsx`
- Add a "Admin Tasks" card to `AdminDashboardPage` linking to `/admin/todos`
- Add nav entry in the admin sidebar section

### Seed task

After the table is created, insert one starter row:

> **Title:** Build end-to-end email marketing sequence
> **Priority:** high
> **Description:** Set up a re-engagement / lifecycle email sequence for users who signed up but haven't used core features (e.g. no notes created). Use a dedicated marketing platform (Loops, Customer.io, Resend Broadcasts, or Mailchimp) on a separate subdomain from the Lovable auth/transactional email subdomain to protect sender reputation. Scope: dormant-user export from Supabase, welcome → nudge → re-engagement cadence, "create your first note" deep link (`/notes/new?source=email`), unsubscribe handling, performance tracking.

### What's NOT in scope

- No assignment to specific admins (single shared board for now)
- No comments/activity log
- No labels/tags (priority covers urgency)
- No email/notification reminders for due dates

These can be added later if the board gets heavy use.
