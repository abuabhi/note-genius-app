
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Loader2, Youtube, Play, Clock, AlertTriangle, Info, CheckCircle, Zap } from 'lucide-react';
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

interface TranscriptionCapability {
  hasCaption: boolean;
  transcriptionMethod: 'captions' | 'supadata';
}

export const YouTubeImportTab = ({ onImport }: YouTubeImportTabProps) => {
  const [youtubeUrl, setYoutubeUrl] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [isCheckingCaption, setIsCheckingCaption] = useState(false);
  const [videoMetadata, setVideoMetadata] = useState<VideoMetadata | null>(null);
  const [transcriptionInfo, setTranscriptionInfo] = useState<TranscriptionCapability | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [processingStep, setProcessingStep] = useState<string>('');

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
    setTranscriptionInfo(null);
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

  const checkTranscriptionCapability = async (videoId: string): Promise<TranscriptionCapability | null> => {
    try {
      const { data, error } = await supabase.functions.invoke('youtube-transcribe', {
        body: { 
          action: 'check_captions',
          videoId 
        }
      });

      if (error) throw error;
      return {
        hasCaption: data.hasCaption,
        transcriptionMethod: data.transcriptionMethod
      };
    } catch (error) {
      console.error('Error checking transcription capability:', error);
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
    setIsCheckingCaption(true);
    setError(null);

    try {
      // Fetch metadata and transcription capability in parallel
      const [metadata, transcriptionCapability] = await Promise.all([
        fetchVideoMetadata(videoId),
        checkTranscriptionCapability(videoId)
      ]);

      if (metadata) {
        setVideoMetadata(metadata);
      } else {
        setError('Could not fetch video information. Please check the URL and try again.');
        return;
      }

      if (transcriptionCapability) {
        setTranscriptionInfo(transcriptionCapability);
      }

    } catch (error) {
      setError('Failed to fetch video information');
      console.error('Preview error:', error);
    } finally {
      setIsProcessing(false);
      setIsCheckingCaption(false);
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
      // Show different loading messages based on transcription method
      if (transcriptionInfo?.transcriptionMethod === 'supadata') {
        setProcessingStep('Using Supadata.ai transcription service...');
        toast.loading('Processing video with Supadata.ai transcription - this may take 2-5 minutes');
      } else {
        setProcessingStep('Processing video captions...');
        toast.loading('Processing video content...');
      }

      const { data, error } = await supabase.functions.invoke('youtube-transcribe', {
        body: { 
          action: 'transcribe',
          videoId,
          url: youtubeUrl,
          metadata: videoMetadata
        }
      });

      if (error) {
        // Handle specific credit limit error
        if (error.message?.includes('Monthly credit limit')) {
          throw new Error('Monthly Supadata.ai credit limit reached (100/month). Please try again next month.');
        }
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
          transcriptionMethod: data.transcriptionMethod || transcriptionInfo?.transcriptionMethod
        },
        subject_id: data.subject_id
      };

      onImport(noteData);
      toast.dismiss();
      
      // Show success message based on method used
      if (data.transcriptionMethod === 'supadata') {
        toast.success('Video transcribed and imported successfully using Supadata.ai!');
      } else if (data.transcriptionMethod === 'metadata_only') {
        toast.success('Video information imported successfully! Note: Full transcription was not available.');
      } else {
        toast.success('Video content imported successfully!');
      }
      
      // Reset form
      setYoutubeUrl('');
      setVideoMetadata(null);
      setTranscriptionInfo(null);
    } catch (error: any) {
      console.error('Transcription error:', error);
      toast.dismiss();
      setError(`Failed to process video: ${error.message}`);
      toast.error('Failed to process video. Please try again.');
    } finally {
      setIsProcessing(false);
      setProcessingStep('');
    }
  };

  const getTranscriptionMethodBadge = () => {
    if (!transcriptionInfo) return null;

    if (transcriptionInfo.hasCaption) {
      return (
        <Badge variant="outline" className="bg-green-50 text-green-700 border-green-300">
          <CheckCircle className="h-3 w-3 mr-1" />
          Captions Available (Free)
        </Badge>
      );
    } else {
      return (
        <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-300">
          <Zap className="h-3 w-3 mr-1" />
          Supadata.ai Transcription Required
        </Badge>
      );
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
            {isCheckingCaption ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Play className="h-4 w-4" />
            )}
            {isCheckingCaption ? 'Checking...' : 'Preview'}
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
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                    <Clock className="h-3 w-3" />
                    {videoMetadata.duration}
                  </div>
                  {getTranscriptionMethodBadge()}
                </div>
              </div>
            </div>
            
            {videoMetadata.description && (
              <p className="text-xs text-muted-foreground line-clamp-2">
                {videoMetadata.description}
              </p>
            )}

            {processingStep && (
              <div className="flex items-center gap-2 text-sm text-blue-600">
                <Loader2 className="h-4 w-4 animate-spin" />
                {processingStep}
              </div>
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
          <strong>Enhanced transcription:</strong> This feature now automatically detects if videos have captions (free) 
          or uses advanced Supadata.ai transcription for videos without captions. Processing time may vary based on video length 
          and transcription method. Monthly limit: 100 Supadata.ai transcriptions.
        </AlertDescription>
      </Alert>
    </div>
  );
};
