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
  transcription?: string;
  metadata?: {
    videoId: string | null;
    title: string | null;
    audioUrl: string;
    language: string;
    confidence: number | null;
    segments: Array<{
      text: string;
      start: number;
      end: number;
    }> | null;
    timestamp: string;
  };
  error?: string;
}

export const YouTubeTranscription = () => {
  const [youtubeUrl, setYoutubeUrl] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [currentStep, setCurrentStep] = useState<'idle' | 'fetching-audio' | 'transcribing' | 'complete'>('idle');
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
    setCurrentStep('fetching-audio');
    setResult(null);

    try {
      // Step 1: Call Apify to get audio URL
      // Note: You'll need to implement your Apify API key and actor call here
      // This is a placeholder for the Apify integration
      console.log('Step 1: Calling Apify actor to get audio URL...');
      
      // For demonstration, I'm showing the structure you would use:
      // const apifyResponse = await fetch('https://api.apify.com/v2/acts/transcriptdl~transcript-downloader-youtube-audio-scraper/run-sync-get-dataset-items', {
      //   method: 'POST',
      //   headers: {
      //     'Authorization': `Bearer YOUR_APIFY_TOKEN`,
      //     'Content-Type': 'application/json'
      //   },
      //   body: JSON.stringify({
      //     youtubeUrls: [{ url: youtubeUrl }],
      //     format: 'mp3'
      //   })
      // });

      // For now, we'll simulate this step and show how to call the Supabase function
      // In real implementation, you would extract the audioUrl from Apify response
      
      toast({
        title: "Apify Integration Required",
        description: "Please implement Apify actor call to get audioUrl. See console for example code.",
        variant: "default"
      });

      // Example of what the audioUrl would look like from Apify:
      // const apifyResult = await apifyResponse.json();
      // const audioUrl = apifyResult[0]?.audioUrl;

      // For demonstration, let's simulate having an audioUrl:
      setCurrentStep('transcribing');

      // Step 2: Call our Supabase Edge Function with the audio URL
      console.log('Step 2: Calling Supabase Edge Function for transcription...');
      
      // This is where you would use the real audioUrl from Apify
      const { data, error } = await supabase.functions.invoke('youtube-transcription', {
        body: {
          // audioUrl: audioUrl, // This would come from Apify
          videoId: videoId,
          title: `YouTube Video ${videoId}`, // You can get this from Apify too
          language: 'english'
        }
      });

      if (error) {
        throw new Error(error.message || 'Failed to transcribe audio');
      }

      setResult(data as TranscriptionResult);
      setCurrentStep('complete');

      if (data.success) {
        toast({
          title: "Transcription Complete",
          description: "YouTube video has been successfully transcribed!",
          variant: "default"
        });
      } else {
        throw new Error(data.error || 'Transcription failed');
      }

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
      case 'fetching-audio':
        return <Youtube className="h-4 w-4" />;
      case 'transcribing':
        return <FileText className="h-4 w-4" />;
      case 'complete':
        return <CheckCircle className="h-4 w-4" />;
      default:
        return <Play className="h-4 w-4" />;
    }
  };

  const getStepText = (step: string) => {
    switch (step) {
      case 'fetching-audio':
        return 'Extracting audio from YouTube...';
      case 'transcribing':
        return 'Transcribing with Gladia...';
      case 'complete':
        return 'Transcription complete!';
      default:
        return 'Ready to transcribe';
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
            {result.success && result.transcription ? (
              <div className="space-y-4">
                {/* Metadata */}
                {result.metadata && (
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    {result.metadata.title && (
                      <div>
                        <span className="font-medium">Title:</span> {result.metadata.title}
                      </div>
                    )}
                    {result.metadata.videoId && (
                      <div>
                        <span className="font-medium">Video ID:</span> {result.metadata.videoId}
                      </div>
                    )}
                    <div>
                      <span className="font-medium">Language:</span> {result.metadata.language}
                    </div>
                    {result.metadata.confidence && (
                      <div>
                        <span className="font-medium">Confidence:</span> {Math.round(result.metadata.confidence * 100)}%
                      </div>
                    )}
                  </div>
                )}

                {/* Transcription Text */}
                <div>
                  <label className="text-sm font-medium">Transcription:</label>
                  <Textarea
                    value={result.transcription}
                    readOnly
                    className="mt-1 min-h-32"
                    placeholder="Transcription will appear here..."
                  />
                </div>

                {/* Segments (if available) */}
                {result.metadata?.segments && result.metadata.segments.length > 0 && (
                  <div>
                    <label className="text-sm font-medium">Timestamped Segments:</label>
                    <div className="mt-2 space-y-2 max-h-60 overflow-y-auto">
                      {result.metadata.segments.map((segment, index) => (
                        <div key={index} className="p-2 bg-muted rounded text-sm">
                          <div className="text-xs text-muted-foreground mb-1">
                            {Math.floor(segment.start / 60)}:{(segment.start % 60).toFixed(1).padStart(4, '0')} - 
                            {Math.floor(segment.end / 60)}:{(segment.end % 60).toFixed(1).padStart(4, '0')}
                          </div>
                          <div>{segment.text}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-destructive">
                <strong>Error:</strong> {result.error}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Instructions */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Implementation Notes</CardTitle>
        </CardHeader>
        <CardContent className="text-sm space-y-2 text-muted-foreground">
          <p>
            <strong>Step 1:</strong> Implement Apify API call to <code>transcriptdl/transcript-downloader-youtube-audio-scraper</code>
          </p>
          <p>
            <strong>Step 2:</strong> Extract <code>audioUrl</code> from Apify response
          </p>
          <p>
            <strong>Step 3:</strong> Pass <code>audioUrl</code> to the Supabase Edge Function
          </p>
          <p>
            <strong>Step 4:</strong> Edge Function forwards audio to Gladia for transcription
          </p>
          <p className="text-xs pt-2 border-t">
            The Supabase Edge Function is ready and deployed. You need to implement the Apify integration 
            to complete the full workflow.
          </p>
        </CardContent>
      </Card>
    </div>
  );
};