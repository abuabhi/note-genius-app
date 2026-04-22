import React from 'react';
import AdminLayout from '@/components/layout/AdminLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { CheckCircle2, ExternalLink, Terminal } from 'lucide-react';
import { Button } from '@/components/ui/button';

const checklist = [
  {
    event: 'customer.subscription.updated',
    purpose: 'Sync plan changes (upgrade / downgrade / status change).',
    trigger: [
      'Stripe Dashboard → Developers → Webhooks → your endpoint → "Send test webhook"',
      'Pick event: customer.subscription.updated',
      'Or via CLI: stripe trigger customer.subscription.updated',
    ],
    verify: [
      'Edge function logs show the event received and processed (no 4xx/5xx).',
      'Row in mock_subscriptions for that user has updated plan_name / status / mrr_amount.',
      'User\'s tier in the UI reflects the change after refresh.',
    ],
  },
  {
    event: 'customer.subscription.deleted',
    purpose: 'Revoke access on cancellation.',
    trigger: [
      'Cancel a test subscription from the Stripe Dashboard, OR',
      'CLI: stripe trigger customer.subscription.deleted',
    ],
    verify: [
      'mock_subscriptions row for that user shows status = "cancelled" and cancelled_at is set.',
      'User loses access to gated features on next session refresh.',
    ],
  },
  {
    event: 'invoice.payment_failed',
    purpose: 'Flag failed renewals so the user can be notified / dunned.',
    trigger: [
      'Use Stripe test card 4000 0000 0000 0341 (attaches but fails on charge), OR',
      'CLI: stripe trigger invoice.payment_failed',
    ],
    verify: [
      'Edge function logs show the failure was handled (200 OK response).',
      'mock_subscriptions row status updated to "past_due".',
      '(Optional) Notification / email pipeline picks up the flagged account.',
    ],
  },
];

const AdminStripeWebhookChecklistPage = () => {
  return (
    <AdminLayout>
      <div className="container mx-auto max-w-4xl p-6 space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Stripe Webhook Test Checklist</h1>
          <p className="text-muted-foreground mt-2">
            Run these checks in Stripe <strong>test mode</strong> before flipping live keys. All three handlers
            live in <code className="text-xs bg-muted px-1.5 py-0.5 rounded">supabase/functions/stripe-webhook</code>.
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Terminal className="w-5 h-5" />
              Before you start
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <p>1. Confirm the webhook endpoint is registered in the Stripe Dashboard and points to the deployed edge function URL.</p>
            <p>2. Make sure <code className="text-xs bg-muted px-1.5 py-0.5 rounded">STRIPE_WEBHOOK_SECRET</code> is set in Supabase secrets.</p>
            <p>3. Open edge function logs in a side tab so you can watch events arrive in real time.</p>
            <Button asChild variant="outline" size="sm" className="mt-2">
              <a href="https://dashboard.stripe.com/test/webhooks" target="_blank" rel="noopener noreferrer">
                Open Stripe Webhooks <ExternalLink className="w-3.5 h-3.5 ml-1.5" />
              </a>
            </Button>
          </CardContent>
        </Card>

        {checklist.map((item) => (
          <Card key={item.event}>
            <CardHeader>
              <div className="flex items-start justify-between gap-3 flex-wrap">
                <div>
                  <CardTitle className="font-mono text-base">{item.event}</CardTitle>
                  <CardDescription className="mt-1">{item.purpose}</CardDescription>
                </div>
                <Badge variant="secondary">test mode</Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4 text-sm">
              <div>
                <h4 className="font-semibold mb-2">How to trigger</h4>
                <ul className="space-y-1.5 text-muted-foreground">
                  {item.trigger.map((t, i) => (
                    <li key={i} className="flex gap-2">
                      <span className="text-primary">→</span>
                      <span>{t}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <Separator />
              <div>
                <h4 className="font-semibold mb-2">What to verify</h4>
                <ul className="space-y-1.5 text-muted-foreground">
                  {item.verify.map((v, i) => (
                    <li key={i} className="flex gap-2">
                      <CheckCircle2 className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                      <span>{v}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </CardContent>
          </Card>
        ))}

        <Card>
          <CardHeader>
            <CardTitle>Sign-off</CardTitle>
            <CardDescription>
              All three events must return 200 OK and produce the expected DB change before live keys are enabled.
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    </AdminLayout>
  );
};

export default AdminStripeWebhookChecklistPage;
