import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Loader2, Youtube, FileText, Play, CheckCircle } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface TranscriptionResult {
  success: boolean;
  result?: {
    transcript: string;
    videoId: string;
    title: string;
    duration?: number;
    thumbnail?: string;
    enhanced?: boolean;
  };
  timestamp?: string;
  error?: string;
}

export const YouTubeTranscription = () => {
  const [youtubeUrl, setYoutubeUrl] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [currentStep, setCurrentStep] = useState<'idle' | 'extracting' | 'complete'>('idle');
  const [result, setResult] = useState<TranscriptionResult | null>(null);

  const extractVideoId = (url: string): string | null => {
    const patterns = [
      /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)/,
      /youtube\.com\/watch\?.*v=([^&\n?#]+)/
    ];
    
    for (const pattern of patterns) {
      const match = url.match(pattern);
      if (match) return match[1];
    }
    return null;
  };

  const handleTranscribe = async () => {
    if (!youtubeUrl.trim()) {
      toast({
        title: "URL Required",
        description: "Please enter a YouTube URL",
        variant: "destructive"
      });
      return;
    }

    const videoId = extractVideoId(youtubeUrl);
    if (!videoId) {
      toast({
        title: "Invalid URL",
        description: "Please enter a valid YouTube URL",
        variant: "destructive"
      });
      return;
    }

    setIsProcessing(true);
    setCurrentStep('extracting');
    setResult(null);

    try {
      // Extract transcript directly from YouTube
      console.log('Extracting transcript from YouTube...');
      
      const transcriptResponse = await supabase.functions.invoke('youtube-transcript-extraction', {
        body: {
          youtubeUrl: youtubeUrl,
          enhanceWithGladia: true
        }
      });

      if (transcriptResponse.error) {
        throw new Error(`Transcript extraction failed: ${transcriptResponse.error.message}`);
      }

      const data = transcriptResponse.data;
      if (!data?.success || !data?.result) {
        throw new Error('No transcript data returned');
      }

      setResult(data as TranscriptionResult);
      setCurrentStep('complete');

      toast({
        title: "Transcription Complete",
        description: "YouTube video transcript has been successfully extracted!",
        variant: "default"
      });

    } catch (error) {
      console.error('Transcription error:', error);
      setResult({
        success: false,
        error: error instanceof Error ? error.message : 'An unknown error occurred'
      });
      
      toast({
        title: "Transcription Failed",
        description: error instanceof Error ? error.message : 'An unknown error occurred',
        variant: "destructive"
      });
    } finally {
      setIsProcessing(false);
      if (currentStep !== 'complete') {
        setCurrentStep('idle');
      }
    }
  };

  const getStepIcon = (step: string) => {
    switch (step) {
      case 'extracting':
        return <FileText className="h-4 w-4" />;
      case 'complete':
        return <CheckCircle className="h-4 w-4" />;
      default:
        return <Play className="h-4 w-4" />;
    }
  };

  const getStepText = (step: string) => {
    switch (step) {
      case 'extracting':
        return 'Extracting transcript from YouTube...';
      case 'complete':
        return 'Transcript extraction complete!';
      default:
        return 'Ready to extract transcript';
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Youtube className="h-5 w-5 text-red-500" />
            YouTube Transcription
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <Input
              type="url"
              placeholder="https://www.youtube.com/watch?v=..."
              value={youtubeUrl}
              onChange={(e) => setYoutubeUrl(e.target.value)}
              className="flex-1"
              disabled={isProcessing}
            />
            <Button 
              onClick={handleTranscribe}
              disabled={isProcessing || !youtubeUrl.trim()}
              className="min-w-32"
            >
              {isProcessing ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  Processing
                </>
              ) : (
                <>
                  <Play className="h-4 w-4 mr-2" />
                  Transcribe
                </>
              )}
            </Button>
          </div>

          {/* Progress Steps */}
          {isProcessing && (
            <div className="flex items-center gap-2 p-3 bg-muted rounded-lg">
              {getStepIcon(currentStep)}
              <span className="text-sm">{getStepText(currentStep)}</span>
              {currentStep !== 'complete' && <Loader2 className="h-3 w-3 animate-spin ml-auto" />}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Results */}
      {result && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Transcription Result
              {result.success && <Badge variant="default">Success</Badge>}
              {!result.success && <Badge variant="destructive">Failed</Badge>}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {result.success && result.result ? (
              <div className="space-y-4">
                {/* Metadata */}
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="font-medium">Title:</span> {result.result.title}
                  </div>
                  <div>
                    <span className="font-medium">Video ID:</span> {result.result.videoId}
                  </div>
                  {result.result.duration && (
                    <div>
                      <span className="font-medium">Duration:</span> {Math.floor(result.result.duration / 60)}:{(result.result.duration % 60).toString().padStart(2, '0')}
                    </div>
                  )}
                  <div>
                    <span className="font-medium">Enhanced:</span> {result.result.enhanced ? 'Yes (Gladia AI)' : 'No'}
                  </div>
                </div>

                {/* Transcription Text */}
                <div>
                  <label className="text-sm font-medium">Transcript:</label>
                  <Textarea
                    value={result.result.transcript}
                    readOnly
                    className="mt-1 min-h-32"
                    placeholder="Transcript will appear here..."
                  />
                </div>
              </div>
            ) : (
              <div className="text-destructive">
                <strong>Error:</strong> {result.error}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Status */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm flex items-center gap-2">
            <CheckCircle className="h-4 w-4 text-green-500" />
            Integration Status
          </CardTitle>
        </CardHeader>
        <CardContent className="text-sm space-y-2 text-muted-foreground">
          <div className="flex items-center gap-2">
            <Badge variant="default">✅ Complete</Badge>
            <span>Apify API integration with matthewjames/youtube-transcript-scraper-and-formatter</span>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="default">✅ Complete</Badge>
            <span>Direct transcript extraction (no audio processing required)</span>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="default">✅ Complete</Badge>
            <span>Optional Gladia AI enhancement for better quality</span>
          </div>
          <p className="text-xs pt-2 border-t text-green-600">
            🚀 Much faster workflow! Enter any YouTube URL above to extract the transcript directly.
          </p>
        </CardContent>
      </Card>
    </div>
  );
};