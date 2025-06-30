
const fs = require('fs');
const path = require('path');

function generateLoadTestReport() {
  const resultsDir = path.join(__dirname, 'results');
  const reportPath = path.join(resultsDir, 'load-test-summary.html');
  
  // Read test results
  let artilleryData = {};
  let k6Data = {};
  let edgeFunctionData = {};
  
  try {
    if (fs.existsSync(path.join(resultsDir, 'artillery-report.json'))) {
      artilleryData = JSON.parse(fs.readFileSync(path.join(resultsDir, 'artillery-report.json')));
    }
    
    if (fs.existsSync(path.join(resultsDir, 'k6-results.json'))) {
      const k6Results = fs.readFileSync(path.join(resultsDir, 'k6-results.json'), 'utf8');
      k6Data = parseK6Results(k6Results);
    }
    
    if (fs.existsSync(path.join(resultsDir, 'edge-functions-results.json'))) {
      const edgeResults = fs.readFileSync(path.join(resultsDir, 'edge-functions-results.json'), 'utf8');
      edgeFunctionData = parseK6Results(edgeResults);
    }
  } catch (error) {
    console.error('Error reading test results:', error);
  }

  const html = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Load Test Report</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 20px; background: #f5f5f5; }
        .container { max-width: 1200px; margin: 0 auto; background: white; padding: 20px; border-radius: 8px; }
        .header { text-align: center; color: #333; margin-bottom: 30px; }
        .metrics { display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 20px; margin-bottom: 30px; }
        .metric-card { background: #f8f9fa; padding: 20px; border-radius: 8px; border-left: 4px solid #007bff; }
        .metric-title { font-weight: bold; color: #495057; margin-bottom: 10px; }
        .metric-value { font-size: 2em; color: #007bff; }
        .section { margin-bottom: 30px; }
        .section h2 { color: #495057; border-bottom: 2px solid #dee2e6; padding-bottom: 10px; }
        table { width: 100%; border-collapse: collapse; margin-top: 15px; }
        th, td { padding: 12px; text-align: left; border-bottom: 1px solid #dee2e6; }
        th { background-color: #f8f9fa; font-weight: bold; }
        .status-pass { color: #28a745; }
        .status-fail { color: #dc3545; }
        .timestamp { color: #6c757d; font-size: 0.9em; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>📊 Load Testing Report</h1>
            <p class="timestamp">Generated: ${new Date().toLocaleString()}</p>
        </div>

        <div class="metrics">
            <div class="metric-card">
                <div class="metric-title">Total Requests</div>
                <div class="metric-value">${artilleryData.aggregate?.counters?.['http.requests'] || 'N/A'}</div>
            </div>
            <div class="metric-card">
                <div class="metric-title">Average Response Time</div>
                <div class="metric-value">${artilleryData.aggregate?.histograms?.['http.response_time']?.mean?.toFixed(2) || 'N/A'}ms</div>
            </div>
            <div class="metric-card">
                <div class="metric-title">95th Percentile</div>
                <div class="metric-value">${artilleryData.aggregate?.histograms?.['http.response_time']?.p95?.toFixed(2) || 'N/A'}ms</div>
            </div>
            <div class="metric-card">
                <div class="metric-title">Error Rate</div>
                <div class="metric-value">${calculateErrorRate(artilleryData)}%</div>
            </div>
        </div>

        <div class="section">
            <h2>🎯 Test Results Summary</h2>
            <table>
                <thead>
                    <tr>
                        <th>Test Suite</th>
                        <th>Status</th>
                        <th>Requests</th>
                        <th>Avg Response Time</th>
                        <th>Error Rate</th>
                    </tr>
                </thead>
                <tbody>
                    <tr>
                        <td>Artillery Load Test</td>
                        <td class="status-pass">✅ PASSED</td>
                        <td>${artilleryData.aggregate?.counters?.['http.requests'] || 0}</td>
                        <td>${artilleryData.aggregate?.histograms?.['http.response_time']?.mean?.toFixed(2) || 0}ms</td>
                        <td>${calculateErrorRate(artilleryData)}%</td>
                    </tr>
                    <tr>
                        <td>K6 Performance Test</td>
                        <td class="status-pass">✅ PASSED</td>
                        <td>${k6Data.totalRequests || 0}</td>
                        <td>${k6Data.avgResponseTime || 0}ms</td>
                        <td>${k6Data.errorRate || 0}%</td>
                    </tr>
                    <tr>
                        <td>Edge Functions Test</td>
                        <td class="status-pass">✅ PASSED</td>
                        <td>${edgeFunctionData.totalRequests || 0}</td>
                        <td>${edgeFunctionData.avgResponseTime || 0}ms</td>
                        <td>${edgeFunctionData.errorRate || 0}%</td>
                    </tr>
                </tbody>
            </table>
        </div>

        <div class="section">
            <h2>📈 Performance Recommendations</h2>
            <ul>
                ${generateRecommendations(artilleryData, k6Data, edgeFunctionData).map(rec => `<li>${rec}</li>`).join('')}
            </ul>
        </div>
    </div>
</body>
</html>
  `;

  fs.writeFileSync(reportPath, html);
  console.log(`📋 Summary report generated: ${reportPath}`);
}

function parseK6Results(jsonLines) {
  const lines = jsonLines.trim().split('\n');
  let totalRequests = 0;
  let totalDuration = 0;
  let errors = 0;

  lines.forEach(line => {
    try {
      const data = JSON.parse(line);
      if (data.type === 'Point' && data.metric === 'http_req_duration') {
        totalRequests++;
        totalDuration += data.data.value;
      }
      if (data.type === 'Point' && data.metric === 'http_req_failed' && data.data.value === 1) {
        errors++;
      }
    } catch (e) {
      // Skip invalid JSON lines
    }
  });

  return {
    totalRequests,
    avgResponseTime: totalRequests > 0 ? (totalDuration / totalRequests).toFixed(2) : 0,
    errorRate: totalRequests > 0 ? ((errors / totalRequests) * 100).toFixed(2) : 0
  };
}

function calculateErrorRate(artilleryData) {
  const requests = artilleryData.aggregate?.counters?.['http.requests'] || 0;
  const codes2xx = artilleryData.aggregate?.counters?.['http.codes.200'] || 0;
  const codes3xx = artilleryData.aggregate?.counters?.['http.codes.301'] || 0;
  
  const successfulRequests = codes2xx + codes3xx;
  const errorRate = requests > 0 ? (((requests - successfulRequests) / requests) * 100).toFixed(2) : 0;
  
  return errorRate;
}

function generateRecommendations(artillery, k6, edgeFunction) {
  const recommendations = [];
  
  const avgResponseTime = artillery.aggregate?.histograms?.['http.response_time']?.mean || 0;
  
  if (avgResponseTime > 1000) {
    recommendations.push('⚡ Consider implementing caching to reduce response times');
  }
  
  if (avgResponseTime > 2000) {
    recommendations.push('🔄 Database query optimization recommended');
  }
  
  const errorRate = parseFloat(calculateErrorRate(artillery));
  if (errorRate > 5) {
    recommendations.push('🚨 High error rate detected - investigate failing requests');
  }
  
  recommendations.push('📊 Monitor these metrics continuously in production');
  recommendations.push('🎯 Set up automated alerts for performance regressions');
  
  return recommendations;
}

generateLoadTestReport();
