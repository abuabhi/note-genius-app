
#!/bin/bash

# Configuration
PROJECT_ID="your-gcp-project-id"
SERVICE_NAME="youtube-audio-extractor"
REGION="us-central1"
IMAGE_NAME="gcr.io/${PROJECT_ID}/${SERVICE_NAME}"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${YELLOW}Deploying YouTube Audio Extractor to Cloud Run...${NC}"

# Check if gcloud is installed
if ! command -v gcloud &> /dev/null; then
    echo -e "${RED}gcloud CLI is not installed. Please install it first.${NC}"
    exit 1
fi

# Check if Docker is running
if ! docker info &> /dev/null; then
    echo -e "${RED}Docker is not running. Please start Docker first.${NC}"
    exit 1
fi

# Set the project
echo -e "${YELLOW}Setting GCP project to ${PROJECT_ID}...${NC}"
gcloud config set project ${PROJECT_ID}

# Enable required APIs
echo -e "${YELLOW}Enabling required APIs...${NC}"
gcloud services enable cloudbuild.googleapis.com
gcloud services enable run.googleapis.com
gcloud services enable storage-api.googleapis.com

# Build the Docker image
echo -e "${YELLOW}Building Docker image...${NC}"
docker build -t ${IMAGE_NAME} .

# Push the image to Google Container Registry
echo -e "${YELLOW}Pushing image to Google Container Registry...${NC}"
docker push ${IMAGE_NAME}

# Deploy to Cloud Run
echo -e "${YELLOW}Deploying to Cloud Run...${NC}"
gcloud run deploy ${SERVICE_NAME} \
  --image ${IMAGE_NAME} \
  --platform managed \
  --region ${REGION} \
  --allow-unauthenticated \
  --memory 2Gi \
  --cpu 2 \
  --timeout 900 \
  --concurrency 10 \
  --max-instances 100 \
  --set-env-vars "NODE_ENV=production" \
  --set-env-vars "GOOGLE_CLOUD_PROJECT_ID=${PROJECT_ID}" \
  --set-env-vars "GOOGLE_CLOUD_STORAGE_BUCKET=your-bucket-name"

# Get the service URL
SERVICE_URL=$(gcloud run services describe ${SERVICE_NAME} --region=${REGION} --format='value(status.url)')

echo -e "${GREEN}Deployment complete!${NC}"
echo -e "${GREEN}Service URL: ${SERVICE_URL}${NC}"
echo -e "${YELLOW}Don't forget to:${NC}"
echo -e "1. Update your Supabase Edge Function with CLOUD_RUN_SERVICE_URL=${SERVICE_URL}"
echo -e "2. Create and configure your Google Cloud Storage bucket"
echo -e "3. Set up proper IAM permissions for the service account"

exit 0
