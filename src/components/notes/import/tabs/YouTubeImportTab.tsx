import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, Video, FileText, Download, Play, CheckCircle, AlertCircle } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { Note } from '@/types/note';

interface YouTubeImportTabProps {
  onImport: (noteData: Omit<Note, 'id'>) => Promise<boolean>;
}

interface TranscriptionState {
  status: 'idle' | 'extracting' | 'uploading' | 'transcribing' | 'completed' | 'error';
  progress: number;
  message: string;
  videoTitle?: string;
  transcript?: string;
  summary?: string;
  chapters?: Array<{ gist: string; headline: string; start: number; end: number }>;
  error?: string;
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
      // Step 1: Extracting audio
      setTranscriptionState({
        status: 'extracting',
        progress: 20,
        message: 'Extracting audio from YouTube video...'
      });

      // Step 2: Uploading
      setTranscriptionState(prev => ({
        ...prev,
        status: 'uploading',
        progress: 40,
        message: 'Uploading audio for transcription...'
      }));

      // Step 3: Transcribing
      setTranscriptionState(prev => ({
        ...prev,
        status: 'transcribing',
        progress: 60,
        message: 'Transcribing audio with AI...'
      }));

      const { data, error } = await supabase.functions.invoke('youtube-transcription', {
        body: { youtubeUrl: youtubeUrl.trim() }
      });

      if (error) {
        throw new Error(error.message || 'Failed to transcribe video');
      }

      if (!data.success) {
        throw new Error(data.error || 'Transcription failed');
      }

      // Step 4: Completed
      setTranscriptionState({
        status: 'completed',
        progress: 100,
        message: 'Transcription completed successfully!',
        videoTitle: data.videoTitle,
        transcript: data.transcript,
        summary: data.summary,
        chapters: data.chapters
      });

      // Auto-populate note fields
      setNoteTitle(data.videoTitle || 'YouTube Video Transcript');
      setNoteContent(formatTranscriptContent(data));

    } catch (error) {
      console.error('Transcription error:', error);
      setTranscriptionState({
        status: 'error',
        progress: 0,
        message: 'Failed to transcribe video',
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      });
    }
  };

  const formatTranscriptContent = (data: any) => {
    let content = '';
    
    if (data.summary) {
      content += `## Summary\n${data.summary}\n\n`;
    }
    
    if (data.chapters && data.chapters.length > 0) {
      content += `## Chapters\n`;
      data.chapters.forEach((chapter: any, index: number) => {
        content += `${index + 1}. **${chapter.gist}**: ${chapter.headline}\n`;
      });
      content += '\n';
    }
    
    if (data.transcript) {
      content += `## Full Transcript\n${data.transcript}`;
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
      subject: 'YouTube Imports',
      sourceType: 'import',
      importData: {
        originalFileUrl: youtubeUrl,
        fileType: 'youtube',
        importedAt: new Date().toISOString()
      }
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

  const renderStatus = () => {
    const { status, progress, message, error } = transcriptionState;

    if (status === 'idle') return null;

    if (status === 'error') {
      return (
        <Alert className="mt-4" variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            {error || message}
          </AlertDescription>
        </Alert>
      );
    }

    if (status === 'completed') {
      return (
        <Alert className="mt-4 border-green-200 bg-green-50">
          <CheckCircle className="h-4 w-4 text-green-600" />
          <AlertDescription className="text-green-800">
            {message}
          </AlertDescription>
        </Alert>
      );
    }

    return (
      <div className="mt-4 space-y-2">
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <Loader2 className="h-4 w-4 animate-spin" />
          {message}
        </div>
        <Progress value={progress} className="w-full" />
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
              <h4 className="font-medium text-gray-900">YouTube Video Transcription</h4>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="youtube-url">YouTube URL</Label>
              <Input
                id="youtube-url"
                value={youtubeUrl}
                onChange={(e) => setYoutubeUrl(e.target.value)}
                placeholder="https://www.youtube.com/watch?v=..."
                disabled={transcriptionState.status !== 'idle' && transcriptionState.status !== 'error'}
              />
            </div>
            
            <Button
              onClick={handleTranscribe}
              disabled={!youtubeUrl.trim() || (transcriptionState.status !== 'idle' && transcriptionState.status !== 'error' && transcriptionState.status !== 'completed')}
              className="w-full"
            >
              {transcriptionState.status === 'idle' || transcriptionState.status === 'error' ? (
                <>
                  <Play className="mr-2 h-4 w-4" />
                  Transcribe Video
                </>
              ) : transcriptionState.status === 'completed' ? (
                <>
                  <Download className="mr-2 h-4 w-4" />
                  Transcribe Another Video
                </>
              ) : (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Processing...
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
                <h4 className="font-medium text-gray-900">Note Preview</h4>
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
                    rows={10}
                    className="resize-vertical"
                  />
                </div>
                
                <Button
                  onClick={handleSaveNote}
                  disabled={!noteTitle.trim() || !noteContent.trim()}
                  className="w-full bg-mint-600 hover:bg-mint-700"
                >
                  <FileText className="mr-2 h-4 w-4" />
                  Save as Note
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Feature Info */}
      <div>
        <div className="flex items-center gap-2 mb-3">
          <CheckCircle className="h-4 w-4 text-mint-500" />
          <h4 className="text-sm font-medium text-gray-900">Features:</h4>
        </div>
        
        <div className="grid gap-2">
          {[
            { text: "Extract and transcribe audio from YouTube videos" },
            { text: "Generate automatic summaries of video content" },
            { text: "Create chapter breakdowns for long videos" },
            { text: "Save transcripts as searchable notes" }
          ].map((feature, index) => (
            <div 
              key={index}
              className="flex items-center gap-3 p-3 bg-white rounded-lg border border-gray-200"
            >
              <div className="p-1.5 bg-mint-50 rounded-md">
                <CheckCircle className="h-3.5 w-3.5 text-mint-600" />
              </div>
              <span className="text-sm text-gray-700">{feature.text}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
