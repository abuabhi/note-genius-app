
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, Youtube, Play, Clock, AlertTriangle, Info } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface YouTubeImportTabProps {
  onImport: (noteData: any) => void;
}

interface VideoMetadata {
  title: string;
  description: string;
  duration: string;
  thumbnailUrl: string;
  channelTitle: string;
}

export const YouTubeImportTab = ({ onImport }: YouTubeImportTabProps) => {
  const [youtubeUrl, setYoutubeUrl] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [videoMetadata, setVideoMetadata] = useState<VideoMetadata | null>(null);
  const [error, setError] = useState<string | null>(null);

  const extractVideoId = (url: string): string | null => {
    const patterns = [
      /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)/,
      /youtube\.com\/watch\?.*v=([^&\n?#]+)/,
    ];
    
    for (const pattern of patterns) {
      const match = url.match(pattern);
      if (match) return match[1];
    }
    return null;
  };

  const validateYouTubeUrl = (url: string): boolean => {
    return extractVideoId(url) !== null;
  };

  const handleUrlChange = (value: string) => {
    setYoutubeUrl(value);
    setError(null);
    setVideoMetadata(null);
  };

  const fetchVideoMetadata = async (videoId: string): Promise<VideoMetadata | null> => {
    try {
      const { data, error } = await supabase.functions.invoke('youtube-transcribe', {
        body: { 
          action: 'get_metadata',
          videoId 
        }
      });

      if (error) throw error;
      return data.metadata;
    } catch (error) {
      console.error('Error fetching video metadata:', error);
      return null;
    }
  };

  const handlePreview = async () => {
    if (!youtubeUrl.trim()) {
      setError('Please enter a YouTube URL');
      return;
    }

    if (!validateYouTubeUrl(youtubeUrl)) {
      setError('Please enter a valid YouTube URL');
      return;
    }

    const videoId = extractVideoId(youtubeUrl);
    if (!videoId) {
      setError('Could not extract video ID from URL');
      return;
    }

    setIsProcessing(true);
    setError(null);

    try {
      const metadata = await fetchVideoMetadata(videoId);
      if (metadata) {
        setVideoMetadata(metadata);
      } else {
        setError('Could not fetch video information. Please check the URL and try again.');
      }
    } catch (error) {
      setError('Failed to fetch video information');
      console.error('Preview error:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleTranscribe = async () => {
    if (!youtubeUrl.trim() || !videoMetadata) {
      setError('Please preview the video first');
      return;
    }

    const videoId = extractVideoId(youtubeUrl);
    if (!videoId) {
      setError('Invalid video URL');
      return;
    }

    setIsProcessing(true);
    setError(null);

    try {
      toast.loading('Processing video... This may take a few minutes');

      const { data, error } = await supabase.functions.invoke('youtube-transcribe', {
        body: { 
          action: 'transcribe',
          videoId,
          url: youtubeUrl,
          metadata: videoMetadata
        }
      });

      if (error) {
        throw new Error(error.message || 'Transcription failed');
      }

      const noteData = {
        title: data.title,
        description: data.description || `Imported from YouTube video: ${videoMetadata.title}`,
        content: data.content,
        category: data.subject || 'General',
        sourceType: 'import' as const,
        importData: {
          originalFileUrl: youtubeUrl,
          fileType: 'youtube',
          importedAt: new Date().toISOString(),
        },
        subject_id: data.subject_id
      };

      onImport(noteData);
      toast.dismiss();
      toast.success('Video content imported successfully!');
      
      // Reset form
      setYoutubeUrl('');
      setVideoMetadata(null);
    } catch (error: any) {
      console.error('Transcription error:', error);
      toast.dismiss();
      
      // Handle specific error cases
      if (error.message?.includes('captions')) {
        setError('This video does not have captions available. Please try a video with captions or subtitles.');
        toast.error('Video does not have captions available');
      } else if (error.message?.includes('Audio transcription')) {
        setError('Audio transcription is not yet available. Please use videos with existing captions.');
        toast.error('Audio transcription not yet supported');
      } else {
        setError(`Failed to process video: ${error.message}`);
        toast.error('Failed to process video. Please try again.');
      }
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="youtube-url">YouTube Video URL</Label>
        <div className="flex gap-2">
          <Input
            id="youtube-url"
            placeholder="https://www.youtube.com/watch?v=..."
            value={youtubeUrl}
            onChange={(e) => handleUrlChange(e.target.value)}
            disabled={isProcessing}
          />
          <Button 
            onClick={handlePreview}
            disabled={isProcessing || !youtubeUrl.trim()}
            variant="outline"
          >
            {isProcessing ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Play className="h-4 w-4" />
            )}
            Preview
          </Button>
        </div>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {videoMetadata && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Youtube className="h-5 w-5 text-red-500" />
              Video Preview
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex gap-3">
              <img 
                src={videoMetadata.thumbnailUrl} 
                alt="Video thumbnail"
                className="w-24 h-18 object-cover rounded"
              />
              <div className="flex-1 space-y-1">
                <h4 className="font-medium text-sm">{videoMetadata.title}</h4>
                <p className="text-xs text-muted-foreground">by {videoMetadata.channelTitle}</p>
                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                  <Clock className="h-3 w-3" />
                  {videoMetadata.duration}
                </div>
              </div>
            </div>
            {videoMetadata.description && (
              <p className="text-xs text-muted-foreground line-clamp-2">
                {videoMetadata.description}
              </p>
            )}
            <Button 
              onClick={handleTranscribe} 
              disabled={isProcessing}
              className="w-full"
            >
              {isProcessing ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  <Youtube className="h-4 w-4 mr-2" />
                  Import Video Content
                </>
              )}
            </Button>
          </CardContent>
        </Card>
      )}

      <Alert>
        <Info className="h-4 w-4" />
        <AlertDescription>
          <strong>Current limitations:</strong> This feature works best with videos that have captions or subtitles. 
          Audio transcription for videos without captions is not yet available but will be implemented in a future update.
        </AlertDescription>
      </Alert>
    </div>
  );
};
