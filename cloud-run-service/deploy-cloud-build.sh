
#!/bin/bash

# Configuration
PROJECT_ID="studyapp-462401"
SERVICE_NAME="youtube-audio-extractor"
REGION="us-central1"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${YELLOW}Deploying YouTube Audio Extractor using Cloud Build...${NC}"

# Check if gcloud is installed
if ! command -v gcloud &> /dev/null; then
    echo -e "${RED}gcloud CLI is not installed. Please install it first.${NC}"
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

# Submit build to Cloud Build
echo -e "${YELLOW}Submitting build to Cloud Build...${NC}"
gcloud builds submit --config cloudbuild.yaml .

# Get the service URL
SERVICE_URL=$(gcloud run services describe ${SERVICE_NAME} --region=${REGION} --format='value(status.url)')

echo -e "${GREEN}Deployment complete!${NC}"
echo -e "${GREEN}Service URL: ${SERVICE_URL}${NC}"
echo -e "${YELLOW}Don't forget to:${NC}"
echo -e "1. Update your Supabase Edge Function with CLOUD_RUN_SERVICE_URL=${SERVICE_URL}"
echo -e "2. Create and configure your Google Cloud Storage bucket"
echo -e "3. Set up proper IAM permissions for the service account"

exit 0
