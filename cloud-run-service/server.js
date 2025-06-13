
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

// Enhanced yt-dlp runner with multiple fallback methods
function runYtDlpWithFallbacks(videoId, outputPath) {
  return new Promise(async (resolve, reject) => {
    const videoUrl = `https://www.youtube.com/watch?v=${videoId}`;
    
    // Create cache directory with proper permissions
    const cacheDir = '/tmp/yt-dlp-cache';
    try {
      await fs.mkdir(cacheDir, { recursive: true, mode: 0o755 });
    } catch (error) {
      console.warn('Could not create cache directory:', error.message);
    }
    
    // Method 1: Standard extraction with enhanced options
    const methods = [
      {
        name: 'standard',
        args: [
          '--extract-audio',
          '--audio-format', 'mp3',
          '--audio-quality', '192K',
          '--output', outputPath,
          '--no-playlist',
          '--user-agent', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
          '--referer', 'https://www.youtube.com/',
          '--cache-dir', cacheDir,
          '--ignore-errors',
          '--no-warnings',
          videoUrl
        ]
      },
      {
        name: 'fallback_1',
        args: [
          '--extract-audio',
          '--audio-format', 'mp3',
          '--audio-quality', '128K',
          '--output', outputPath,
          '--no-playlist',
          '--user-agent', 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
          '--extractor-args', 'youtube:player_client=android',
          '--cache-dir', cacheDir,
          '--no-check-certificate',
          videoUrl
        ]
      },
      {
        name: 'fallback_2',
        args: [
          '--extract-audio',
          '--audio-format', 'mp3',
          '--output', outputPath,
          '--no-playlist',
          '--user-agent', 'Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)',
          '--extractor-args', 'youtube:player_client=web',
          '--cache-dir', cacheDir,
          '--socket-timeout', '30',
          videoUrl
        ]
      }
    ];

    for (const method of methods) {
      try {
        console.log(`Attempting ${method.name} extraction method...`);
        await attemptExtraction(method.args, method.name);
        console.log(`Successfully extracted using ${method.name} method`);
        resolve(outputPath);
        return;
      } catch (error) {
        console.log(`${method.name} method failed:`, error.message);
        continue;
      }
    }

    reject(new Error('All extraction methods failed. YouTube may be blocking this video or it may be unavailable.'));
  });
}

function attemptExtraction(args, methodName) {
  return new Promise((resolve, reject) => {
    const ytDlpProcess = spawn('yt-dlp', args);
    
    let stderr = '';
    let stdout = '';
    
    ytDlpProcess.stdout.on('data', (data) => {
      stdout += data.toString();
    });
    
    ytDlpProcess.stderr.on('data', (data) => {
      stderr += data.toString();
    });

    const timeout = setTimeout(() => {
      ytDlpProcess.kill('SIGTERM');
      reject(new Error(`${methodName} method timed out after 60 seconds`));
    }, 60000);

    ytDlpProcess.on('close', (code) => {
      clearTimeout(timeout);
      if (code === 0) {
        resolve(stdout);
      } else {
        reject(new Error(`${methodName} extraction failed with code ${code}: ${stderr}`));
      }
    });

    ytDlpProcess.on('error', (error) => {
      clearTimeout(timeout);
      reject(new Error(`${methodName} process error: ${error.message}`));
    });
  });
}

// Enhanced video info retrieval with fallbacks
function getVideoInfoWithFallbacks(videoId) {
  return new Promise(async (resolve, reject) => {
    const videoUrl = `https://www.youtube.com/watch?v=${videoId}`;
    
    const infoMethods = [
      {
        name: 'standard_info',
        args: ['--dump-json', '--no-playlist', videoUrl]
      },
      {
        name: 'fallback_info',
        args: [
          '--dump-json', 
          '--no-playlist',
          '--user-agent', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
          '--extractor-args', 'youtube:player_client=android',
          videoUrl
        ]
      }
    ];

    for (const method of infoMethods) {
      try {
        console.log(`Attempting ${method.name}...`);
        const info = await getVideoInfoMethod(method.args, method.name);
        resolve(info);
        return;
      } catch (error) {
        console.log(`${method.name} failed:`, error.message);
        continue;
      }
    }

    // Fallback to basic info
    resolve({
      title: `YouTube Video ${videoId}`,
      duration: 0,
      uploader: 'Unknown'
    });
  });
}

function getVideoInfoMethod(args, methodName) {
  return new Promise((resolve, reject) => {
    const ytDlpProcess = spawn('yt-dlp', args);

    let stdout = '';
    let stderr = '';
    
    ytDlpProcess.stdout.on('data', (data) => {
      stdout += data.toString();
    });
    
    ytDlpProcess.stderr.on('data', (data) => {
      stderr += data.toString();
    });

    const timeout = setTimeout(() => {
      ytDlpProcess.kill('SIGTERM');
      reject(new Error(`${methodName} timed out`));
    }, 30000);

    ytDlpProcess.on('close', (code) => {
      clearTimeout(timeout);
      if (code === 0) {
        try {
          const info = JSON.parse(stdout);
          resolve({
            title: info.title || `YouTube Video`,
            duration: info.duration || 0,
            uploader: info.uploader || 'Unknown'
          });
        } catch (parseError) {
          reject(new Error(`Failed to parse video info: ${parseError.message}`));
        }
      } else {
        reject(new Error(`${methodName} failed: ${stderr}`));
      }
    });

    ytDlpProcess.on('error', (error) => {
      clearTimeout(timeout);
      reject(new Error(`${methodName} process error: ${error.message}`));
    });
  });
}

// Main extraction endpoint with enhanced error handling
app.post('/extract', async (req, res) => {
  const requestId = uuidv4();
  console.log(`[${requestId}] Starting enhanced extraction`);
  
  try {
    const { youtubeUrl } = req.body;
    
    if (!youtubeUrl) {
      return res.status(400).json({ 
        error: 'YouTube URL is required',
        errorType: 'validation',
        requestId 
      });
    }

    const videoId = extractVideoId(youtubeUrl);
    if (!videoId) {
      return res.status(400).json({ 
        error: 'Invalid YouTube URL format',
        errorType: 'validation',
        requestId 
      });
    }

    console.log(`[${requestId}] Processing video: ${videoId}`);

    // Get video info with fallbacks
    console.log(`[${requestId}] Getting video info...`);
    const videoInfo = await getVideoInfoWithFallbacks(videoId);
    console.log(`[${requestId}] Video info retrieved:`, videoInfo.title);
    
    // Setup file paths
    const audioFileName = `${videoId}-${requestId}.mp3`;
    const tempPath = `/tmp/${audioFileName}`;
    
    // Extract audio with fallback methods
    console.log(`[${requestId}] Starting audio extraction...`);
    await runYtDlpWithFallbacks(videoId, tempPath);
    console.log(`[${requestId}] Audio extraction completed`);
    
    // Verify file exists and has content
    try {
      const stats = await fs.stat(tempPath);
      if (stats.size === 0) {
        throw new Error('Extracted audio file is empty');
      }
      console.log(`[${requestId}] Audio file size: ${stats.size} bytes`);
    } catch (error) {
      throw new Error(`Audio extraction verification failed: ${error.message}`);
    }
    
    // Upload to Cloud Storage
    console.log(`[${requestId}] Uploading to Cloud Storage...`);
    const cloudFileName = `temp-audio/${audioFileName}`;
    await bucket.upload(tempPath, {
      destination: cloudFileName,
      metadata: {
        contentType: 'audio/mpeg',
        metadata: {
          videoId,
          requestId,
          extractedAt: new Date().toISOString(),
          videoTitle: videoInfo.title
        }
      }
    });

    // Generate signed URL (valid for 2 hours)
    const [signedUrl] = await bucket.file(cloudFileName).getSignedUrl({
      action: 'read',
      expires: Date.now() + 2 * 60 * 60 * 1000,
    });

    // Cleanup local file
    try {
      await fs.unlink(tempPath);
    } catch (cleanupError) {
      console.warn(`[${requestId}] Cleanup warning:`, cleanupError.message);
    }

    console.log(`[${requestId}] Extraction completed successfully`);

    res.json({
      success: true,
      requestId,
      videoInfo,
      audioUrl: signedUrl,
      cloudFileName,
      extractionMethod: 'enhanced_fallback'
    });

  } catch (error) {
    console.error(`[${requestId}] Extraction error:`, error);
    
    // Categorize errors for better user experience
    let errorType = 'unknown';
    let userMessage = error.message;
    
    if (error.message.includes('Sign in to confirm')) {
      errorType = 'bot_detection';
      userMessage = 'YouTube is blocking automated access to this video. This may be due to age restrictions, geographic restrictions, or bot detection.';
    } else if (error.message.includes('Video unavailable')) {
      errorType = 'unavailable';
      userMessage = 'This video is unavailable. It may be private, deleted, or region-restricted.';
    } else if (error.message.includes('timeout')) {
      errorType = 'timeout';
      userMessage = 'Video processing timed out. Please try a shorter video or try again later.';
    } else if (error.message.includes('All extraction methods failed')) {
      errorType = 'extraction_failed';
      userMessage = 'Unable to extract audio from this video. YouTube may be blocking access or the video may have restrictions.';
    }
    
    res.status(500).json({ 
      error: userMessage,
      errorType,
      requestId,
      originalError: error.message
    });
  }
});

// Health check
app.get('/health', (req, res) => {
  res.json({ 
    status: 'healthy', 
    timestamp: new Date().toISOString(),
    version: '2.0.0' 
  });
});

// Enhanced cleanup endpoint
app.delete('/cleanup/:fileName', async (req, res) => {
  try {
    const { fileName } = req.params;
    const cloudFileName = `temp-audio/${fileName}`;
    
    await bucket.file(cloudFileName).delete();
    console.log(`Cleaned up file: ${cloudFileName}`);
    res.json({ success: true, message: 'File cleaned up successfully' });
  } catch (error) {
    console.error('Cleanup failed:', error);
    res.status(500).json({ 
      error: 'Cleanup failed', 
      details: error.message 
    });
  }
});

// New endpoint to check video accessibility
app.post('/check-video', async (req, res) => {
  const requestId = uuidv4();
  
  try {
    const { youtubeUrl } = req.body;
    const videoId = extractVideoId(youtubeUrl);
    
    if (!videoId) {
      return res.status(400).json({ error: 'Invalid YouTube URL' });
    }
    
    console.log(`[${requestId}] Checking video accessibility: ${videoId}`);
    const videoInfo = await getVideoInfoWithFallbacks(videoId);
    
    res.json({
      success: true,
      accessible: true,
      videoInfo,
      requestId
    });
    
  } catch (error) {
    console.error(`[${requestId}] Video check failed:`, error);
    res.json({
      success: false,
      accessible: false,
      error: error.message,
      requestId
    });
  }
});

app.listen(PORT, () => {
  console.log(`Enhanced YouTube Audio Extractor running on port ${PORT}`);
  console.log('Features: Enhanced bot detection handling, multiple fallback methods, improved error categorization');
});
