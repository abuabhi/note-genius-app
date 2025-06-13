
const express = require('express');
const cors = require('cors');
const { Storage } = require('@google-cloud/storage');
const { v4: uuidv4 } = require('uuid');
const { spawn } = require('child_process');
const fs = require('fs').promises;
const path = require('path');

const app = express();
const PORT = process.env.PORT || 8080;

// Middleware
app.use(cors());
app.use(express.json());

// Initialize Google Cloud Storage
const storage = new Storage();
const bucketName = process.env.GOOGLE_CLOUD_STORAGE_BUCKET || 'studyai-audio-temp';
const bucket = storage.bucket(bucketName);

// Helper function to extract video ID from URL
function extractVideoId(url) {
  const regex = /(?:https?:\/\/)?(?:www\.)?(?:youtube\.com\/(?:[^\/\n\s]+\/\S+\/|(?:v|e(?:mbed)?)\/|\S*?[?&]v=)|youtu\.be\/)([a-zA-Z0-9_-]{11})/;
  const match = url.match(regex);
  return match ? match[1] : null;
}

// Helper function to run yt-dlp
function runYtDlp(videoId, outputPath) {
  return new Promise((resolve, reject) => {
    const videoUrl = `https://www.youtube.com/watch?v=${videoId}`;
    
    const ytDlpProcess = spawn('yt-dlp', [
      '--extract-audio',
      '--audio-format', 'mp3',
      '--audio-quality', '192K',
      '--output', outputPath,
      '--no-playlist',
      '--quiet',
      videoUrl
    ]);

    let stderr = '';
    
    ytDlpProcess.stderr.on('data', (data) => {
      stderr += data.toString();
    });

    ytDlpProcess.on('close', (code) => {
      if (code === 0) {
        resolve(outputPath);
      } else {
        reject(new Error(`yt-dlp failed: ${stderr}`));
      }
    });

    ytDlpProcess.on('error', (error) => {
      reject(error);
    });
  });
}

// Get video info
function getVideoInfo(videoId) {
  return new Promise((resolve, reject) => {
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
          resolve({
            title: info.title || `YouTube Video ${videoId}`,
            duration: info.duration || 0,
            uploader: info.uploader || ''
          });
        } catch (parseError) {
          reject(parseError);
        }
      } else {
        reject(new Error(`Failed to get video info: ${stderr}`));
      }
    });
  });
}

// Main extraction endpoint
app.post('/extract', async (req, res) => {
  const requestId = uuidv4();
  console.log(`[${requestId}] Starting extraction`);
  
  try {
    const { youtubeUrl } = req.body;
    
    if (!youtubeUrl) {
      return res.status(400).json({ error: 'YouTube URL is required' });
    }

    const videoId = extractVideoId(youtubeUrl);
    if (!videoId) {
      return res.status(400).json({ error: 'Invalid YouTube URL' });
    }

    console.log(`[${requestId}] Processing video: ${videoId}`);

    // Get video info
    const videoInfo = await getVideoInfo(videoId);
    
    // Setup file paths
    const audioFileName = `${videoId}-${requestId}.mp3`;
    const tempPath = `/tmp/${audioFileName}`;
    
    // Extract audio
    await runYtDlp(videoId, tempPath);
    
    // Upload to Cloud Storage
    const cloudFileName = `temp-audio/${audioFileName}`;
    await bucket.upload(tempPath, {
      destination: cloudFileName,
      metadata: {
        contentType: 'audio/mpeg',
        metadata: {
          videoId,
          requestId,
          extractedAt: new Date().toISOString()
        }
      }
    });

    // Generate signed URL (valid for 2 hours)
    const [signedUrl] = await bucket.file(cloudFileName).getSignedUrl({
      action: 'read',
      expires: Date.now() + 2 * 60 * 60 * 1000,
    });

    // Cleanup local file
    await fs.unlink(tempPath);

    console.log(`[${requestId}] Extraction completed`);

    res.json({
      success: true,
      requestId,
      videoInfo,
      audioUrl: signedUrl,
      cloudFileName
    });

  } catch (error) {
    console.error(`[${requestId}] Error:`, error);
    res.status(500).json({ error: error.message });
  }
});

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'healthy', timestamp: new Date().toISOString() });
});

// Cleanup endpoint
app.delete('/cleanup/:fileName', async (req, res) => {
  try {
    const { fileName } = req.params;
    const cloudFileName = `temp-audio/${fileName}`;
    
    await bucket.file(cloudFileName).delete();
    res.json({ success: true, message: 'File cleaned up' });
  } catch (error) {
    console.error('Cleanup failed:', error);
    res.status(500).json({ error: 'Cleanup failed' });
  }
});

app.listen(PORT, () => {
  console.log(`YouTube Audio Extractor running on port ${PORT}`);
});
