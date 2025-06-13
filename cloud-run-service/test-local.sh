
#!/bin/bash

echo "🧪 Testing Docker build locally..."

# Build the image
docker build -t youtube-audio-test .

if [ $? -eq 0 ]; then
    echo "✅ Docker build successful!"
    echo "You can test locally with:"
    echo "docker run -p 8080:8080 youtube-audio-test"
    echo ""
    echo "Ready to deploy? Run: ./deploy.sh"
else
    echo "❌ Docker build failed"
fi
