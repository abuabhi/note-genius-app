
#!/bin/bash

# Test script to build Docker image locally
echo "Testing Docker build locally..."

# Make sure we're in the right directory
if [ ! -f "Dockerfile" ]; then
    echo "Error: Dockerfile not found in current directory"
    exit 1
fi

if [ ! -f "package.json" ]; then
    echo "Error: package.json not found in current directory"
    exit 1
fi

echo "Files found, starting build..."
docker build -t youtube-audio-extractor-test .

if [ $? -eq 0 ]; then
    echo "✅ Docker build succeeded locally!"
    echo "You can now try running: ./deploy-cloud-build.sh"
else
    echo "❌ Docker build failed locally. Check the error above."
fi
