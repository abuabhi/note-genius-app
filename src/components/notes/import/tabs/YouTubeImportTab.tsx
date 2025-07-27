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
  message: string;
  videoTitle?: string;
  transcript?: string;
  summary?: string;
  videoMetadata?: any;
  error?: string;
}

export const YouTubeImportTab = ({ onImport }: YouTubeImportTabProps) => {
  const [youtubeUrl, setYoutubeUrl] = useState('');
  const [noteTitle, setNoteTitle] = useState('');
  const [noteContent, setNoteContent] = useState('');
  const [transcriptionState, setTranscriptionState] = useState<TranscriptionState>({
    status: 'idle',
    message: ''
  });

  const isValidYouTubeUrl = (url: string) => {
    const regex = /^(https?:\/\/)?(www\.)?(youtube\.com\/watch\?v=|youtu\.be\/)[a-zA-Z0-9_-]{11}/;
    return regex.test(url);
  };


  const handleTranscribe = async () => {
    if (!youtubeUrl.trim()) {
      setTranscriptionState({
        status: 'error',
        message: 'Please enter a YouTube URL',
        error: 'YouTube URL is required'
      });
      return;
    }

    if (!isValidYouTubeUrl(youtubeUrl)) {
      setTranscriptionState({
        status: 'error',
        message: 'Please enter a valid YouTube URL',
        error: 'Invalid YouTube URL format'
      });
      return;
    }

    try {
      setTranscriptionState({
        status: 'processing',
        message: 'Processing video with n8n...'
      });

      const { data, error } = await supabase.functions.invoke('youtube-transcription', {
        body: { 
          youtubeUrl: youtubeUrl.trim()
        }
      });

      if (error) {
        throw new Error(error.message || 'Failed to start transcription');
      }

      if (!data.success) {
        throw new Error(data.error || 'Transcription failed');
      }

      // Process completed response
      setTranscriptionState({
        status: 'completed',
        message: '🎉 Transcription completed!',
        videoTitle: data.videoTitle,
        transcript: data.transcript,
        summary: data.summary,
        videoMetadata: data.videoMetadata
      });

      setNoteTitle(data.videoTitle || 'YouTube Video Transcript');
      setNoteContent(formatTranscriptContent(data));

    } catch (error) {
      console.error('Transcription error:', error);
      
      setTranscriptionState({
        status: 'error',
        message: error.message || 'Transcription failed',
        error: error.message
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
        message: ''
      });
    }
  };

  const handleRetry = () => {
    setTranscriptionState({
      status: 'idle',
      message: ''
    });
  };

  const renderStatus = () => {
    const { status, message, error } = transcriptionState;

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
      </div>
    );
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Left Column - Input and Controls */}
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
                    Powered by your custom n8n workflow - instant processing
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
                      rows={6}
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

      {/* Right Column - Video Preview */}
      <div className="space-y-6">
        {youtubeUrl && isValidYouTubeUrl(youtubeUrl) && (
          <Card className="sticky top-4">
            <CardContent className="p-4">
              <div className="space-y-3">
                <h4 className="font-medium text-gray-900 flex items-center gap-2">
                  <Video className="h-4 w-4 text-red-500" />
                  Video Preview
                </h4>
                <div className="w-full">
                  <YouTubeVideoPlayer videoUrl={youtubeUrl} className="w-full" />
                </div>
                
                {/* Video Metadata */}
                {transcriptionState.videoMetadata && (
                  <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                    <h5 className="font-medium text-sm text-gray-700 mb-2">Video Info</h5>
                    <div className="space-y-1 text-xs text-gray-600">
                      {transcriptionState.videoTitle && (
                        <p><span className="font-medium">Title:</span> {transcriptionState.videoTitle}</p>
                      )}
                      {transcriptionState.videoMetadata.duration && (
                        <p><span className="font-medium">Duration:</span> {Math.round(transcriptionState.videoMetadata.duration / 60)} minutes</p>
                      )}
                      {transcriptionState.videoMetadata.channel && (
                        <p><span className="font-medium">Channel:</span> {transcriptionState.videoMetadata.channel}</p>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};