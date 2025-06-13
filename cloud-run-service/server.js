
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const { Storage } = require('@google-cloud/storage');
const { v4: uuidv4 } = require('uuid');
const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs').promises;
const util = require('util');

const app = express();
const PORT = process.env.PORT || 8080;

// Security middleware
app.use(helmet());
app.use(cors({
  origin: process.env.ALLOWED_ORIGINS?.split(',') || ['*'],
  credentials: true
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
});
app.use('/extract', limiter);

app.use(express.json({ limit: '10mb' }));

// Initialize Google Cloud Storage
const storage = new Storage({
  projectId: process.env.GOOGLE_CLOUD_PROJECT_ID,
  keyFilename: process.env.GOOGLE_APPLICATION_CREDENTIALS
});

const bucketName = process.env.GOOGLE_CLOUD_STORAGE_BUCKET;
const bucket = storage.bucket(bucketName);

// Helper function to execute yt-dlp
const extractAudio = util.promisify((videoId, outputPath, callback) => {
  const videoUrl = `https://www.youtube.com/watch?v=${videoId}`;
  
  const ytDlpProcess = spawn('yt-dlp', [
    '--extract-audio',
    '--audio-format', 'mp3',
    '--audio-quality', '192K',
    '--output', outputPath,
    '--no-playlist',
    '--no-warnings',
    '--quiet',
    videoUrl
  ]);

  let stderr = '';
  
  ytDlpProcess.stderr.on('data', (data) => {
    stderr += data.toString();
  });

  ytDlpProcess.on('close', (code) => {
    if (code === 0) {
      callback(null, outputPath);
    } else {
      callback(new Error(`yt-dlp failed with code ${code}: ${stderr}`));
    }
  });

  ytDlpProcess.on('error', (error) => {
    callback(error);
  });
});

// Helper function to get video info
const getVideoInfo = util.promisify((videoId, callback) => {
  const videoUrl = `https://www.youtube.com/watch?v=${videoId}`;
  
  const ytDlpProcess = spawn('yt-dlp', [
    '--dump-json',
    '--no-playlist',
    '--quiet',
    videoUrl
  ]);

  let stdout = '';
  let stderr = '';
  
  ytDlpProcess.stdout.on('data', (data) => {
    stdout += data.toString();
  });
  
  ytDlpProcess.stderr.on('data', (data) => {
    stderr += data.toString();
  });

  ytDlpProcess.on('close', (code) => {
    if (code === 0) {
      try {
        const info = JSON.parse(stdout);
        callback(null, {
          title: info.title || `YouTube Video ${videoId}`,
          duration: info.duration || 0,
          description: info.description || '',
          uploader: info.uploader || ''
        });
      } catch (parseError) {
        callback(parseError);
      }
    } else {
      callback(new Error(`yt-dlp info extraction failed: ${stderr}`));
    }
  });
});

// Validate YouTube video ID
function isValidVideoId(videoId) {
  const regex = /^[a-zA-Z0-9_-]{11}$/;
  return regex.test(videoId);
}

// Extract video ID from URL
function extractVideoId(url) {
  const regex = /(?:https?:\/\/)?(?:www\.)?(?:youtube\.com\/(?:[^\/\n\s]+\/\S+\/|(?:v|e(?:mbed)?)\/|\S*?[?&]v=)|youtu\.be\/)([a-zA-Z0-9_-]{11})/;
  const match = url.match(regex);
  return match ? match[1] : null;
}

// Cleanup function for temporary files
async function cleanupFile(filePath) {
  try {
    await fs.unlink(filePath);
    console.log(`Cleaned up temporary file: ${filePath}`);
  } catch (error) {
    console.error(`Failed to cleanup file ${filePath}:`, error);
  }
}

// Main extraction endpoint
app.post('/extract', async (req, res) => {
  const requestId = uuidv4();
  console.log(`[${requestId}] Starting audio extraction request`);
  
  try {
    const { youtubeUrl } = req.body;
    
    if (!youtubeUrl) {
      return res.status(400).json({
        error: 'YouTube URL is required',
        requestId
      });
    }

    // Extract and validate video ID
    const videoId = extractVideoId(youtubeUrl);
    if (!videoId || !isValidVideoId(videoId)) {
      return res.status(400).json({
        error: 'Invalid YouTube URL',
        requestId
      });
    }

    console.log(`[${requestId}] Processing video: ${videoId}`);

    // Get video information
    const videoInfo = await getVideoInfo(videoId);
    console.log(`[${requestId}] Video info retrieved: ${videoInfo.title}`);

    // Generate unique filename
    const audioFileName = `${videoId}-${requestId}.mp3`;
    const tempPath = `/tmp/${audioFileName}`;
    
    // Extract audio using yt-dlp
    console.log(`[${requestId}] Extracting audio...`);
    await extractAudio(videoId, tempPath);
    
    // Check if file was created
    try {
      await fs.access(tempPath);
    } catch (error) {
      throw new Error('Audio extraction failed - no output file created');
    }

    // Upload to Google Cloud Storage
    console.log(`[${requestId}] Uploading to Cloud Storage...`);
    const cloudFileName = `temp-audio/${audioFileName}`;
    await bucket.upload(tempPath, {
      destination: cloudFileName,
      metadata: {
        contentType: 'audio/mpeg',
        metadata: {
          videoId,
          requestId,
          originalTitle: videoInfo.title,
          extractedAt: new Date().toISOString()
        }
      }
    });

    // Generate signed URL (valid for 2 hours)
    const [signedUrl] = await bucket.file(cloudFileName).getSignedUrl({
      action: 'read',
      expires: Date.now() + 2 * 60 * 60 * 1000, // 2 hours
    });

    // Cleanup local file
    await cleanupFile(tempPath);

    console.log(`[${requestId}] Audio extraction completed successfully`);

    res.json({
      success: true,
      requestId,
      videoInfo,
      audioUrl: signedUrl,
      cloudFileName,
      expiresAt: new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString()
    });

  } catch (error) {
    console.error(`[${requestId}] Audio extraction failed:`, error);
    
    res.status(500).json({
      error: error.message || 'Audio extraction failed',
      requestId
    });
  }
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    service: 'youtube-audio-extractor'
  });
});

// Cleanup endpoint for removing temporary files
app.delete('/cleanup/:fileName', async (req, res) => {
  try {
    const { fileName } = req.params;
    const cloudFileName = `temp-audio/${fileName}`;
    
    await bucket.file(cloudFileName).delete();
    
    res.json({
      success: true,
      message: 'File cleaned up successfully'
    });
  } catch (error) {
    console.error('Cleanup failed:', error);
    res.status(500).json({
      error: 'Cleanup failed'
    });
  }
});

// Global error handler
app.use((error, req, res, next) => {
  console.error('Unhandled error:', error);
  res.status(500).json({
    error: 'Internal server error',
    message: process.env.NODE_ENV === 'development' ? error.message : undefined
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`YouTube Audio Extractor service running on port ${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV || 'production'}`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received, shutting down gracefully');
  process.exit(0);
});
