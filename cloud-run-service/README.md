
# YouTube Audio Extractor - Cloud Run Service

This service provides reliable YouTube audio extraction using `yt-dlp` for the StudyBuddy application.

## Features

- **Reliable Audio Extraction**: Uses yt-dlp for robust YouTube audio downloading
- **Scalable**: Auto-scales based on demand with Cloud Run
- **Secure**: Temporary file handling with automatic cleanup
- **Production-Ready**: Comprehensive error handling, logging, and monitoring
- **Rate Limited**: Built-in rate limiting to prevent abuse

## Architecture

```
Frontend → Supabase Edge Function → Cloud Run Service → Google Cloud Storage → AssemblyAI
```

## Setup Instructions

### 1. Prerequisites

- Google Cloud Project with billing enabled
- Docker installed locally
- gcloud CLI installed and authenticated
- Google Cloud Storage bucket created

### 2. Environment Variables

Set these environment variables in Cloud Run:

```bash
GOOGLE_CLOUD_PROJECT_ID=your-project-id
GOOGLE_CLOUD_STORAGE_BUCKET=your-bucket-name
NODE_ENV=production
ALLOWED_ORIGINS=https://your-app-domain.com
```

### 3. IAM Permissions

The Cloud Run service needs these permissions:
- `storage.objects.create`
- `storage.objects.delete`
- `storage.objects.get`

### 4. Deploy to Cloud Run

1. Update the `PROJECT_ID` in `deploy.sh`
2. Make the script executable: `chmod +x deploy.sh`
3. Run the deployment: `./deploy.sh`

### 5. Configure Supabase Edge Function

Add the Cloud Run service URL to your Supabase Edge Function secrets:
```
CLOUD_RUN_SERVICE_URL=https://your-service-url.run.app
```

## API Endpoints

### POST /extract
Extract audio from a YouTube video.

**Request:**
```json
{
  "youtubeUrl": "https://www.youtube.com/watch?v=VIDEO_ID"
}
```

**Response:**
```json
{
  "success": true,
  "requestId": "uuid",
  "videoInfo": {
    "title": "Video Title",
    "duration": 300,
    "uploader": "Channel Name"
  },
  "audioUrl": "https://storage.googleapis.com/...",
  "cloudFileName": "temp-audio/filename.mp3",
  "expiresAt": "2023-12-01T12:00:00Z"
}
```

### GET /health
Health check endpoint.

### DELETE /cleanup/:fileName
Clean up temporary files.

## Monitoring and Logging

The service includes comprehensive logging for:
- Request tracking with unique IDs
- Audio extraction progress
- File upload/cleanup operations
- Error conditions

View logs in Google Cloud Console:
```bash
gcloud logs read "resource.type=cloud_run_revision AND resource.labels.service_name=youtube-audio-extractor" --limit 50
```

## Security Features

- **Rate Limiting**: 100 requests per 15 minutes per IP
- **CORS Protection**: Configurable allowed origins
- **Input Validation**: YouTube URL and video ID validation
- **Temporary Files**: Automatic cleanup of local and cloud files
- **Non-root User**: Container runs as non-privileged user

## Cost Optimization

- **Auto-scaling**: Scales to zero when not in use
- **Resource Limits**: Optimized CPU and memory allocation
- **File Cleanup**: Automatic removal of temporary files
- **Efficient Processing**: Direct streaming to cloud storage

## Troubleshooting

### Common Issues

1. **Audio extraction fails**: Check if the YouTube video is available and not geo-blocked
2. **Upload fails**: Verify Google Cloud Storage permissions
3. **Rate limiting**: Implement request queuing in your application
4. **Timeout**: Increase Cloud Run timeout for very long videos

### Health Checks

Monitor service health:
```bash
curl https://your-service-url.run.app/health
```

### Logs

Check service logs:
```bash
gcloud logs tail "resource.type=cloud_run_revision AND resource.labels.service_name=youtube-audio-extractor"
```
