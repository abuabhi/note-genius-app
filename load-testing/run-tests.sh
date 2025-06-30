
#!/bin/bash

echo "🚀 Starting Load Testing Suite..."

# Create results directory
mkdir -p results

# Run Artillery tests
echo "📊 Running Artillery load tests..."
artillery run artillery.yml --output results/artillery-report.json

# Generate Artillery HTML report
echo "📈 Generating Artillery HTML report..."
artillery report results/artillery-report.json --output results/artillery-report.html

# Run k6 tests
echo "🔥 Running k6 load tests..."
k6 run --out json=results/k6-results.json k6-load-test.js

# Run edge function specific tests
echo "⚡ Running edge function tests..."
k6 run --out json=results/edge-functions-results.json edge-functions-test.js

# Generate summary report
echo "📋 Generating summary report..."
node generate-report.js

echo "✅ Load testing complete! Check the results/ directory for reports."
