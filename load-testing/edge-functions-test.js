
import http from 'k6/http';
import { check, sleep } from 'k6';
import { Rate } from 'k6/metrics';

export let errorRate = new Rate('edge_function_errors');

export let options = {
  stages: [
    { duration: '30s', target: 3 },
    { duration: '1m', target: 5 },
    { duration: '30s', target: 0 },
  ],
  thresholds: {
    'http_req_duration': ['p(95)<5000'], // Edge functions can be slower
    'http_req_failed': ['rate<0.1'], // 10% error rate threshold
  },
};

const SUPABASE_URL = 'https://your-project-ref.supabase.co';
const SUPABASE_ANON_KEY = 'your-anon-key';

export default function() {
  const headers = {
    'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
    'Content-Type': 'application/json',
  };

  // Test note enrichment function
  let enrichResponse = http.post(`${SUPABASE_URL}/functions/v1/enrich-note`, 
    JSON.stringify({
      noteId: 'test-note-id',
      enhancementType: 'summary'
    }), 
    { headers }
  );

  check(enrichResponse, {
    'enrich-note status is 200': (r) => r.status === 200,
    'enrich-note response time < 10s': (r) => r.timings.duration < 10000,
  });

  // Test flashcard generation function
  let flashcardResponse = http.post(`${SUPABASE_URL}/functions/v1/generate-flashcards`,
    JSON.stringify({
      noteContent: 'Test content for flashcard generation',
      quantity: 5
    }),
    { headers }
  );

  check(flashcardResponse, {
    'generate-flashcards status is 200': (r) => r.status === 200,
    'generate-flashcards response time < 15s': (r) => r.timings.duration < 15000,
  });

  sleep(2);
}
