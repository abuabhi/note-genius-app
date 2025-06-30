
import http from 'k6/http';
import { check, sleep } from 'k6';
import { Rate } from 'k6/metrics';

export let errorRate = new Rate('errors');

export let options = {
  stages: [
    { duration: '1m', target: 5 }, // Warm up
    { duration: '2m', target: 10 }, // Ramp up
    { duration: '5m', target: 15 }, // Sustained load
    { duration: '1m', target: 0 }, // Cool down
  ],
  thresholds: {
    'http_req_duration': ['p(95)<2000'], // 95% of requests must complete below 2s
    'http_req_failed': ['rate<0.05'], // Error rate must be below 5%
  },
};

const BASE_URL = 'http://localhost:8080';

export default function() {
  // Authentication test
  let authResponse = http.post(`${BASE_URL}/api/auth/login`, JSON.stringify({
    email: 'test@example.com',
    password: 'testpassword'
  }), {
    headers: { 'Content-Type': 'application/json' },
  });

  let authCheck = check(authResponse, {
    'auth status is 200': (r) => r.status === 200,
    'auth response time < 1000ms': (r) => r.timings.duration < 1000,
  });
  errorRate.add(!authCheck);

  if (authResponse.status === 200) {
    let token = JSON.parse(authResponse.body).access_token;
    
    // Notes API test
    let notesResponse = http.get(`${BASE_URL}/api/notes`, {
      headers: { 'Authorization': `Bearer ${token}` },
    });

    let notesCheck = check(notesResponse, {
      'notes status is 200': (r) => r.status === 200,
      'notes response time < 1500ms': (r) => r.timings.duration < 1500,
    });
    errorRate.add(!notesCheck);

    // Flashcards API test
    let flashcardsResponse = http.get(`${BASE_URL}/api/flashcards/sets`, {
      headers: { 'Authorization': `Bearer ${token}` },
    });

    let flashcardsCheck = check(flashcardsResponse, {
      'flashcards status is 200': (r) => r.status === 200,
      'flashcards response time < 1500ms': (r) => r.timings.duration < 1500,
    });
    errorRate.add(!flashcardsCheck);
  }

  sleep(1);
}
