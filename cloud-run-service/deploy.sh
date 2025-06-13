
#!/bin/bash

# Simple deployment script for Cloud Run
PROJECT_ID="studyapp-462401"
SERVICE_NAME="youtube-audio-extractor"
REGION="us-central1"
BUCKET_NAME="studyai-audio-temp"

echo "🚀 Deploying YouTube Audio Extractor to Cloud Run..."

# Build and deploy
gcloud run deploy $SERVICE_NAME \
  --source . \
  --platform managed \
  --region $REGION \
  --project $PROJECT_ID \
  --allow-unauthenticated \
  --set-env-vars GOOGLE_CLOUD_STORAGE_BUCKET=$BUCKET_NAME \
  --memory 1Gi \
  --cpu 1 \
  --timeout 300s \
  --max-instances 10

if [ $? -eq 0 ]; then
    echo "✅ Deployment successful!"
    echo "Service URL: https://$SERVICE_NAME-$(gcloud config get-value core/project).$REGION.run.app"
else
    echo "❌ Deployment failed"
fi
