import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, Video, FileText, Play, CheckCircle, AlertCircle, RefreshCw } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { Note } from '@/types/note';
import { YouTubeVideoPlayer } from '../../display/YouTubeVideoPlayer';

interface YouTubeImportTabProps {
  onImport: (noteData: Omit<Note, 'id'>) => Promise<boolean>;
}

interface TranscriptionState {
  status: 'idle' | 'processing' | 'completed' | 'error';
  progress: number;
  message: string;
  requestId?: string;
  videoTitle?: string;
  transcript?: string;
  summary?: string;
  videoMetadata?: any;
  error?: string;
  errorType?: string;
}

export const YouTubeImportTab = ({ onImport }: YouTubeImportTabProps) => {
  const [youtubeUrl, setYoutubeUrl] = useState('');
  const [noteTitle, setNoteTitle] = useState('');
  const [noteContent, setNoteContent] = useState('');
  const [transcriptionState, setTranscriptionState] = useState<TranscriptionState>({
    status: 'idle',
    progress: 0,
    message: ''
  });

  const isValidYouTubeUrl = (url: string) => {
    const regex = /^(https?:\/\/)?(www\.)?(youtube\.com\/watch\?v=|youtu\.be\/)[a-zA-Z0-9_-]{11}/;
    return regex.test(url);
  };

  // Polling function for async processing
  const pollTranscriptionStatus = async (requestId: string) => {
    const maxAttempts = 30; // 5 minutes at 10-second intervals
    let attempts = 0;

    const poll = async () => {
      try {
        const { data, error } = await supabase.functions.invoke('youtube-transcription-status', {
          body: { requestId }
        });

        if (error) throw error;

        console.log('📊 Polling response:', data);

        if (data.processingStatus === 'completed' && data.transcript) {
          // Processing completed
          setTranscriptionState({
            status: 'completed',
            progress: 100,
            message: '🎉 Transcription completed successfully!',
            videoTitle: data.videoTitle,
            transcript: data.transcript,
            summary: data.summary,
            videoMetadata: data.videoMetadata
          });

          // Auto-populate note fields
          setNoteTitle(data.videoTitle || 'YouTube Video Transcript');
          setNoteContent(formatTranscriptContent(data));

        } else if (data.processingStatus === 'processing') {
          // Still processing - update progress
          const progressPercent = Math.min(20 + (attempts * 2), 90);
          setTranscriptionState(prev => ({
            ...prev,
            progress: progressPercent,
            message: `Processing video... (${Math.floor(attempts / 6) + 1} minute${Math.floor(attempts / 6) === 0 ? '' : 's'} elapsed)`
          }));

          // Continue polling
          attempts++;
          if (attempts < maxAttempts) {
            setTimeout(poll, 10000); // Poll every 10 seconds
          } else {
            throw new Error('Processing timed out. Please try again with a shorter video.');
          }
        } else if (data.processingStatus === 'error') {
          throw new Error(data.error || 'Processing failed');
        }

      } catch (error) {
        console.error('Polling error:', error);
        setTranscriptionState({
          status: 'error',
          progress: 0,
          message: error.message || 'Failed to check processing status',
          error: error.message,
          errorType: 'polling_failed'
        });
      }
    };

    // Start polling
    setTimeout(poll, 5000); // First poll after 5 seconds
  };

  const handleTranscribe = async () => {
    if (!youtubeUrl.trim()) {
      setTranscriptionState({
        status: 'error',
        progress: 0,
        message: 'Please enter a YouTube URL',
        error: 'YouTube URL is required'
      });
      return;
    }

    if (!isValidYouTubeUrl(youtubeUrl)) {
      setTranscriptionState({
        status: 'error',
        progress: 0,
        message: 'Please enter a valid YouTube URL',
        error: 'Invalid YouTube URL format'
      });
      return;
    }

    try {
      setTranscriptionState({
        status: 'processing',
        progress: 10,
        message: 'Starting transcription process...'
      });

      const { data, error } = await supabase.functions.invoke('youtube-transcription', {
        body: { 
          youtubeUrl: youtubeUrl.trim(),
          userId: 'user-id', // Get from auth context
          noteTitle: noteTitle || undefined
        }
      });

      if (error) {
        throw new Error(error.message || 'Failed to start transcription');
      }

      if (!data.success) {
        throw new Error(data.error || 'Transcription failed');
      }

      if (data.processingStatus === 'completed') {
        // Immediate completion (fast processing)
        setTranscriptionState({
          status: 'completed',
          progress: 100,
          message: '🎉 Transcription completed!',
          videoTitle: data.videoTitle,
          transcript: data.transcript,
          summary: data.summary,
          videoMetadata: data.videoMetadata
        });

        setNoteTitle(data.videoTitle || 'YouTube Video Transcript');
        setNoteContent(formatTranscriptContent(data));

      } else if (data.processingStatus === 'processing') {
        // Async processing started
        setTranscriptionState({
          status: 'processing',
          progress: 20,
          message: 'Your video is being processed... This will take 1-5 minutes.',
          requestId: data.requestId
        });

        // Start polling for results
        pollTranscriptionStatus(data.requestId);
      }

    } catch (error) {
      console.error('Transcription error:', error);
      
      setTranscriptionState({
        status: 'error',
        progress: 0,
        message: error.message || 'Transcription failed',
        error: error.message,
        errorType: 'transcription_failed'
      });
    }
  };

  const formatTranscriptContent = (data: any) => {
    let content = '';
    
    // Video metadata
    content += `# ${data.videoTitle}\n\n`;
    content += `**YouTube URL:** ${youtubeUrl}\n`;
    if (data.videoMetadata?.channel) {
      content += `**Channel:** ${data.videoMetadata.channel}\n`;
    }
    if (data.videoMetadata?.duration) {
      content += `**Duration:** ${Math.round(data.videoMetadata.duration / 60)} minutes\n`;
    }
    content += `**Transcribed:** ${new Date().toLocaleDateString()}\n\n`;
    
    // AI-generated summary (already available from n8n)
    if (data.summary) {
      content += `## 📋 Summary\n${data.summary}\n\n`;
    }
    
    // Full transcript
    if (data.transcript) {
      content += `## 📝 Transcript\n\n${data.transcript}`;
    }
    
    return content;
  };

  const handleSaveNote = async () => {
    if (!noteTitle.trim() || !noteContent.trim()) {
      alert('Please provide both title and content for the note');
      return;
    }

    const noteData: Omit<Note, 'id'> = {
      title: noteTitle,
      content: noteContent,
      description: transcriptionState.summary || 'YouTube video transcript',
      date: new Date().toISOString(),
      subject: 'YouTube Videos',
      sourceType: 'youtube',
      video_url: youtubeUrl,
      video_metadata: transcriptionState.videoMetadata || {},
      summary: transcriptionState.summary,
      summary_status: transcriptionState.summary ? 'completed' : 'pending'
    };

    const success = await onImport(noteData);
    
    if (success) {
      // Reset form
      setYoutubeUrl('');
      setNoteTitle('');
      setNoteContent('');
      setTranscriptionState({
        status: 'idle',
        progress: 0,
        message: ''
      });
    }
  };

  const handleRetry = () => {
    setTranscriptionState({
      status: 'idle',
      progress: 0,
      message: ''
    });
  };

  const renderStatus = () => {
    const { status, progress, message, error, errorType } = transcriptionState;

    if (status === 'idle') return null;

    if (status === 'error') {
      return (
        <Alert className="mt-4" variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            <div className="space-y-3">
              <p className="font-medium">{error || message}</p>
              
              <div className="flex gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={handleRetry}
                  className="text-xs"
                >
                  <RefreshCw className="h-3 w-3 mr-1" />
                  Try Again
                </Button>
              </div>
            </div>
          </AlertDescription>
        </Alert>
      );
    }

    if (status === 'completed') {
      return (
        <Alert className="mt-4 border-green-200 bg-green-50">
          <CheckCircle className="h-4 w-4 text-green-600" />
          <AlertDescription className="text-green-800">
            <p className="font-medium">{message}</p>
          </AlertDescription>
        </Alert>
      );
    }

    return (
      <div className="mt-4 space-y-3">
        <div className="flex items-center gap-3 text-sm text-gray-700">
          <Loader2 className="h-5 w-5 animate-spin text-mint-600" />
          <span className="font-medium">{message}</span>
        </div>
        <div className="space-y-2">
          <Progress value={progress} className="w-full h-2" />
          <div className="flex justify-between text-xs text-gray-500">
            <span>Processing...</span>
            <span>{progress}%</span>
          </div>
        </div>
        <div className="text-xs text-gray-500 bg-gray-50 p-2 rounded">
          💡 Processing will take 1-5 minutes. You can continue using the app while we work on your video!
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* URL Input Section */}
      <Card>
        <CardContent className="p-4">
          <div className="space-y-4">
            <div className="flex items-center gap-2 mb-3">
              <Video className="h-5 w-5 text-red-500" />
              <div>
                <h4 className="font-medium text-gray-900">YouTube Transcription via n8n</h4>
                <p className="text-xs text-gray-600 mt-1">
                  Powered by your custom n8n workflow - asynchronous processing (1-5 minutes)
                </p>
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="youtube-url">YouTube URL</Label>
              <Input
                id="youtube-url"
                value={youtubeUrl}
                onChange={(e) => setYoutubeUrl(e.target.value)}
                placeholder="https://www.youtube.com/watch?v=..."
                disabled={transcriptionState.status === 'processing'}
              />
            </div>
            
            <Button
              onClick={handleTranscribe}
              disabled={!youtubeUrl.trim() || transcriptionState.status === 'processing'}
              className="w-full bg-gradient-to-r from-mint-600 to-mint-700 hover:from-mint-700 hover:to-mint-800"
              size="lg"
            >
              {transcriptionState.status === 'processing' ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  <Play className="mr-2 h-4 w-4" />
                  Start n8n Transcription
                </>
              )}
            </Button>
            
            {renderStatus()}
          </div>
        </CardContent>
      </Card>

      {/* Video Preview */}
      {youtubeUrl && isValidYouTubeUrl(youtubeUrl) && (
        <Card>
          <CardContent className="p-4">
            <div className="space-y-3">
              <h4 className="font-medium text-gray-900 flex items-center gap-2">
                <Video className="h-4 w-4 text-red-500" />
                Video Preview
              </h4>
              <YouTubeVideoPlayer videoUrl={youtubeUrl} />
            </div>
          </CardContent>
        </Card>
      )}

      {/* Note Preview Section */}
      {transcriptionState.status === 'completed' && (
        <Card>
          <CardContent className="p-4">
            <div className="space-y-4">
              <div className="flex items-center gap-2 mb-3">
                <FileText className="h-5 w-5 text-mint-500" />
                <h4 className="font-medium text-gray-900">Save as Note</h4>
              </div>
              
              <div className="space-y-4">
                <div>
                  <Label htmlFor="note-title">Note Title</Label>
                  <Input
                    id="note-title"
                    value={noteTitle}
                    onChange={(e) => setNoteTitle(e.target.value)}
                    placeholder="Enter note title"
                  />
                </div>
                
                <div>
                  <Label htmlFor="note-content">Note Content</Label>
                  <Textarea
                    id="note-content"
                    value={noteContent}
                    onChange={(e) => setNoteContent(e.target.value)}
                    placeholder="Note content will appear here..."
                    rows={8}
                    className="resize-vertical"
                  />
                </div>
                
                <Button
                  onClick={handleSaveNote}
                  disabled={!noteTitle.trim() || !noteContent.trim()}
                  className="w-full bg-mint-600 hover:bg-mint-700"
                >
                  <FileText className="mr-2 h-4 w-4" />
                  Save YouTube Note
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};