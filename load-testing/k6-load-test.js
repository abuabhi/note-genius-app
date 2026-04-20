// PrepGenie load test — hits real Supabase REST + Edge Functions.
//
// Usage:
//   1. Create a dedicated test user in Supabase Auth (email/password).
//   2. Export creds before running:
//        export SUPABASE_URL="https://zuhcmwujzfddmafozubd.supabase.co"
//        export SUPABASE_ANON_KEY="<anon key>"
//        export TEST_USER_EMAIL="loadtest@example.com"
//        export TEST_USER_PASSWORD="<password>"
//   3. Run: k6 run load-testing/k6-load-test.js
//
// What it simulates per virtual user:
//   - One auth (cached for the VU's lifetime)
//   - Repeated reads against the most-used tables (notes, flashcard_sets, profiles)
//   - One AI Edge Function call every ~10 iterations (rate-sensitive)

import http from 'k6/http';
import { check, sleep, group } from 'k6';
import { Rate, Trend } from 'k6/metrics';

export const errorRate = new Rate('errors');
export const aiLatency = new Trend('ai_function_latency_ms');

export const options = {
  // Target: sustain 100 concurrent users for 5 min — matches launch goal.
  stages: [
    { duration: '1m', target: 25 },   // Warm up
    { duration: '2m', target: 100 },  // Ramp to launch target
    { duration: '5m', target: 100 },  // Hold at 100 VUs
    { duration: '1m', target: 0 },    // Cool down
  ],
  thresholds: {
    'http_req_failed': ['rate<0.02'],                      // <2% errors
    'http_req_duration{type:read}': ['p(95)<1000'],        // reads p95 < 1s
    'ai_function_latency_ms': ['p(95)<5000'],              // AI p95 < 5s
    'errors': ['rate<0.05'],
  },
};

const SUPABASE_URL = __ENV.SUPABASE_URL || 'https://zuhcmwujzfddmafozubd.supabase.co';
const SUPABASE_ANON_KEY = __ENV.SUPABASE_ANON_KEY || '';
const TEST_EMAIL = __ENV.TEST_USER_EMAIL || '';
const TEST_PASSWORD = __ENV.TEST_USER_PASSWORD || '';

if (!SUPABASE_ANON_KEY || !TEST_EMAIL || !TEST_PASSWORD) {
  throw new Error(
    'Missing env vars. Set SUPABASE_ANON_KEY, TEST_USER_EMAIL, TEST_USER_PASSWORD before running.'
  );
}

// Per-VU cached auth token (logging in once per VU, not per iteration).
let cachedToken = null;

function login() {
  const res = http.post(
    `${SUPABASE_URL}/auth/v1/token?grant_type=password`,
    JSON.stringify({ email: TEST_EMAIL, password: TEST_PASSWORD }),
    {
      headers: {
        'Content-Type': 'application/json',
        'apikey': SUPABASE_ANON_KEY,
      },
      tags: { type: 'auth' },
    }
  );
  const ok = check(res, { 'login 200': (r) => r.status === 200 });
  errorRate.add(!ok);
  if (!ok) return null;
  return JSON.parse(res.body).access_token;
}

function authedHeaders(token, extra = {}) {
  return {
    'Content-Type': 'application/json',
    'apikey': SUPABASE_ANON_KEY,
    'Authorization': `Bearer ${token}`,
    ...extra,
  };
}

export default function () {
  if (!cachedToken) {
    cachedToken = login();
    if (!cachedToken) {
      sleep(2);
      return;
    }
  }

  group('reads', () => {
    // Notes list
    const notes = http.get(
      `${SUPABASE_URL}/rest/v1/notes?select=id,title,updated_at&order=updated_at.desc&limit=20`,
      { headers: authedHeaders(cachedToken), tags: { type: 'read', endpoint: 'notes' } }
    );
    errorRate.add(
      !check(notes, {
        'notes 200': (r) => r.status === 200,
        'notes < 1s': (r) => r.timings.duration < 1000,
      })
    );

    // Flashcard sets list
    const sets = http.get(
      `${SUPABASE_URL}/rest/v1/flashcard_sets?select=id,name,card_count&limit=20`,
      { headers: authedHeaders(cachedToken), tags: { type: 'read', endpoint: 'flashcard_sets' } }
    );
    errorRate.add(!check(sets, { 'sets 200': (r) => r.status === 200 }));

    // Profile
    const profile = http.get(
      `${SUPABASE_URL}/rest/v1/profiles?select=id,user_tier&limit=1`,
      { headers: authedHeaders(cachedToken), tags: { type: 'read', endpoint: 'profile' } }
    );
    errorRate.add(!check(profile, { 'profile 200': (r) => r.status === 200 }));
  });

  // Hit an AI Edge Function ~10% of iterations to avoid burning quota.
  if (Math.random() < 0.1) {
    group('ai-edge-function', () => {
      const start = Date.now();
      const res = http.post(
        `${SUPABASE_URL}/functions/v1/expand-content`,
        JSON.stringify({
          selectedText: 'photosynthesis',
          fullContext: 'Biology study notes about plant cellular processes.',
          contentType: 'note',
          noteTitle: 'Load test',
        }),
        { headers: authedHeaders(cachedToken), tags: { type: 'ai', endpoint: 'expand-content' } }
      );
      aiLatency.add(Date.now() - start);
      // Accept 200 (success) and 429 (rate-limited — expected under load).
      errorRate.add(
        !check(res, { 'ai 2xx or 429': (r) => r.status === 200 || r.status === 429 })
      );
    });
  }

  sleep(Math.random() * 2 + 1); // 1–3s think time, mimics real users
}
