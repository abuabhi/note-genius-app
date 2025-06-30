
# StudyAI Load Testing Suite

This directory contains comprehensive load testing infrastructure for the StudyAI application, including Artillery.js and k6 scripts, automated reporting, and edge function monitoring.

## 🚀 Quick Start

### Prerequisites

1. Install Artillery.js globally:
```bash
npm install -g artillery
```

2. Install k6:
```bash
# macOS
brew install k6

# Ubuntu/Debian
sudo apt-key adv --keyserver hkp://keyserver.ubuntu.com:80 --recv-keys C5AD17C747E3415A3642D57D77C6C491D6AC1D69
echo "deb https://dl.k6.io/deb stable main" | sudo tee /etc/apt/sources.list.d/k6.list
sudo apt-get update
sudo apt-get install k6

# Windows
choco install k6
```

### Running Tests

1. **Run all tests:**
```bash
./run-tests.sh
```

2. **Run individual tests:**
```bash
# Artillery load test
npm run test:artillery

# k6 performance test
npm run test:k6

# Edge functions test
npm run test:edge-functions
```

3. **Generate reports:**
```bash
npm run report
```

## 📊 Test Scenarios

### Artillery Load Test (artillery.yml)
- **Duration:** 8 minutes total
- **Phases:** Warm up → Ramp up → Sustained load → Cool down
- **Scenarios:**
  - User Authentication Flow (30%)
  - Notes Management (25%)
  - Flashcard Study Session (25%)
  - Quiz Taking (20%)

### k6 Performance Test (k6-load-test.js)
- **Focus:** API endpoint performance
- **Thresholds:**
  - 95% of requests < 2000ms
  - Error rate < 5%
- **Tests:** Auth, Notes, Flashcards APIs

### Edge Functions Test (edge-functions-test.js)
- **Target:** Supabase edge functions
- **Functions tested:**
  - enrich-note
  - generate-flashcards
  - generate-quiz
  - process-document

## 📈 Reports

After running tests, check the `results/` directory for:

- `artillery-report.html` - Interactive Artillery report
- `k6-results.json` - K6 metrics in JSON format
- `edge-functions-results.json` - Edge function performance data
- `load-test-summary.html` - Consolidated HTML report

## 🎯 Performance Thresholds

### API Endpoints
- Response time: < 2000ms (95th percentile)
- Error rate: < 5%
- Throughput: > 10 RPS

### Edge Functions
- Response time: < 5000ms (95th percentile)
- Error rate: < 10%
- Cold start frequency: < 30%

## 🔧 Configuration

### Environment Variables
Update the test files with your environment URLs:

```javascript
// k6-load-test.js
const BASE_URL = 'https://your-app-url.com';

// edge-functions-test.js
const SUPABASE_URL = 'https://your-project-ref.supabase.co';
const SUPABASE_ANON_KEY = 'your-anon-key';
```

### Artillery Configuration
Modify `artillery.yml` to adjust:
- Test duration and phases
- Arrival rates (users per second)
- Target endpoints
- Test scenarios

### k6 Configuration
Adjust `k6-load-test.js` for:
- Virtual user stages
- Performance thresholds
- Test endpoints
- Request patterns

## 📱 Admin Dashboard Integration

Access the load testing dashboard at:
- **URL:** `/admin/system-monitoring`
- **Tab:** Load Testing
- **Requirements:** Dean-tier access

Features:
- Run tests directly from the UI
- View real-time test status
- Download test reports
- Performance metrics visualization
- Historical trend analysis

## 🚨 Monitoring & Alerts

The system includes:
- **Real-time monitoring** during test execution
- **Performance threshold alerts** when limits are exceeded
- **Automated reporting** with recommendations
- **Integration with system alerts** for critical issues

## 📋 Best Practices

1. **Before Testing:**
   - Ensure test environment is isolated
   - Verify all services are running
   - Check baseline performance metrics

2. **During Testing:**
   - Monitor system resources
   - Watch for error spikes
   - Track response time trends

3. **After Testing:**
   - Analyze reports thoroughly
   - Compare with previous results
   - Implement recommended optimizations

## 🛠️ Troubleshooting

### Common Issues

1. **Connection Refused:**
   - Verify application is running
   - Check firewall settings
   - Confirm correct URLs

2. **High Error Rates:**
   - Check application logs
   - Verify database connections
   - Monitor resource usage

3. **Slow Response Times:**
   - Check database performance
   - Monitor memory usage
   - Verify cache hit rates

### Debug Mode

Enable debug logging:
```bash
DEBUG=* artillery run artillery.yml
```

Run k6 with verbose output:
```bash
k6 run --verbose k6-load-test.js
```

## 📞 Support

For issues or questions:
1. Check the application logs
2. Review the test reports
3. Monitor system health dashboard
4. Contact the development team

## 🔄 Continuous Integration

To integrate with CI/CD:

```yaml
# .github/workflows/load-test.yml
name: Load Testing
on:
  schedule:
    - cron: '0 2 * * *'  # Daily at 2 AM
  
jobs:
  load-test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - name: Install dependencies
        run: |
          npm install -g artillery
          curl https://github.com/grafana/k6/releases/download/v0.44.0/k6-v0.44.0-linux-amd64.tar.gz -L | tar xvz
      - name: Run load tests
        run: cd load-testing && ./run-tests.sh
      - name: Archive reports
        uses: actions/upload-artifact@v2
        with:
          name: load-test-reports
          path: load-testing/results/
```
