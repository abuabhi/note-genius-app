import React, { useState, useEffect, useRef } from 'react';
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
import { SubjectSelector } from '../components/SubjectSelector';

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
  const [selectedSubject, setSelectedSubject] = useState<string>("YouTube Videos");
  const [transcriptionState, setTranscriptionState] = useState<TranscriptionState>({
    status: 'idle',
    message: ''
  });
  const saveNoteRef = useRef<HTMLDivElement>(null);

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

    const videoId = extractVideoId(youtubeUrl);
    if (!videoId) {
      setTranscriptionState({
        status: 'error',
        message: 'Could not extract video ID from URL',
        error: 'Invalid YouTube URL format'
      });
      return;
    }

    try {
      setTranscriptionState({
        status: 'processing',
        message: 'Extracting transcript from YouTube...'
      });

      // Extract transcript directly using Apify
      const transcriptResponse = await supabase.functions.invoke('youtube-transcript-extraction', {
        body: {
          youtubeUrl: youtubeUrl.trim(),
          enhanceWithGladia: true
        }
      });

      if (transcriptResponse.error) {
        throw new Error(`Transcript extraction failed: ${transcriptResponse.error.message}`);
      }

      const transcriptData = transcriptResponse.data;
      if (!transcriptData?.success || !transcriptData?.result) {
        throw new Error('No transcript data returned from extraction');
      }

      const result = transcriptData.result;
      
      if (!result.transcript) {
        throw new Error('No transcript text found in response');
      }

      // Process completed response
      setTranscriptionState({
        status: 'completed',
        message: '🎉 Transcript extraction completed!',
        videoTitle: result.title,
        transcript: result.transcript,
        videoMetadata: {
          videoId: result.videoId,
          title: result.title,
          duration: result.duration,
          thumbnail: result.thumbnail,
          enhanced: result.enhanced
        }
      });

      setNoteTitle(result.title || 'YouTube Video Transcript');
      setNoteContent(formatTranscriptContent({
        videoTitle: result.title,
        transcript: result.transcript,
        videoMetadata: {
          videoId: result.videoId,
          title: result.title,
          duration: result.duration,
          enhanced: result.enhanced
        }
      }));

      // Auto-scroll to save section
      setTimeout(() => {
        saveNoteRef.current?.scrollIntoView({ 
          behavior: 'smooth', 
          block: 'center' 
        });
      }, 500);

    } catch (error) {
      console.error('Transcription error:', error);
      
      setTranscriptionState({
        status: 'error',
        message: error.message || 'Transcription failed',
        error: error.message
      });
    }
  };

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

  const formatTranscriptContent = (data: any) => {
    let content = '';
    
    // YouTube URL as clickable link
    content += `**YouTube URL:** [YouTube Video](${youtubeUrl})\n\n`;
    
    // Optional metadata (language and confidence if available)
    if (data.videoMetadata?.language) {
      content += `**Language:** ${data.videoMetadata.language}\n`;
    }
    if (data.videoMetadata?.confidence) {
      content += `**Confidence:** ${Math.round(data.videoMetadata.confidence * 100)}%\n`;
    }
    if (data.videoMetadata?.enhanced) {
      content += `**Enhanced:** Yes (Gladia AI)\n`;
    }
    
    // Add spacing before transcript if we have metadata
    if (data.videoMetadata?.language || data.videoMetadata?.confidence || data.videoMetadata?.enhanced) {
      content += '\n';
    }
    
    // Full transcript
    if (data.transcript) {
      content += `## 📝 Full Transcript\n\n${data.transcript}`;
    }
    
    return content;
  };

  const handleSaveNote = async () => {
    if (!noteTitle.trim() || !noteContent.trim()) {
      toast.error('Please provide both title and content for the note');
      return;
    }

    const noteData: Omit<Note, 'id'> = {
      title: noteTitle,
      content: noteContent,
      description: `YouTube video transcript: ${transcriptionState.videoTitle}`,
      date: new Date().toISOString(),
      subject: selectedSubject,
      sourceType: 'youtube',
      video_url: youtubeUrl,
      video_metadata: transcriptionState.videoMetadata || {},
      summary_status: 'completed'
    };

    const success = await onImport(noteData);
    
    if (success) {
      // Reset form
      setYoutubeUrl('');
      setNoteTitle('');
      setNoteContent('');
      setSelectedSubject("YouTube Videos");
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
            <div className="space-y-2">
              <p className="font-medium">{message}</p>
              <p className="text-sm">
                ✅ Ready to save! Scroll down to customize and save your note.
              </p>
            </div>
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
    <div className="space-y-6">
      {/* Top Section - Input and Controls */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left Column - URL Input */}
        <div className="space-y-6">
        {/* URL Input Section */}
        <Card>
          <CardContent className="p-4">
            <div className="space-y-4">
              <div className="flex items-center gap-2 mb-3">
                <Video className="h-5 w-5 text-red-500" />
                <div>
                   <h4 className="font-medium text-gray-900">YouTube Transcription</h4>
                   <p className="text-xs text-gray-600 mt-1">
                     Direct transcript extraction with optional AI enhancement
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
                className="w-full bg-mint-500 hover:bg-mint-600"
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
                    Start Transcription
                  </>
                )}
              </Button>
              
              {renderStatus()}
            </div>
          </CardContent>
        </Card>

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

      {/* Bottom Section - Save Note (Full Width for Better Visibility) */}
      {transcriptionState.status === 'completed' && (
        <div ref={saveNoteRef} className="border-t-2 border-mint-200 pt-6">
          <Card className="ring-2 ring-mint-200 ring-opacity-50 shadow-lg">
            <CardContent className="p-6">
              <div className="space-y-6">
                <div className="text-center">
                  <div className="flex items-center justify-center gap-3 mb-2">
                    <div className="w-10 h-10 bg-mint-500 rounded-full flex items-center justify-center">
                      <FileText className="h-5 w-5 text-white" />
                    </div>
                    <div>
                      <h3 className="text-xl font-semibold text-gray-900">Save Your YouTube Note</h3>
                      <p className="text-sm text-gray-600 mt-1">
                        Customize the note details and save to your collection
                      </p>
                    </div>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="note-title" className="text-base font-medium">Note Title</Label>
                      <Input
                        id="note-title"
                        value={noteTitle}
                        onChange={(e) => setNoteTitle(e.target.value)}
                        placeholder="Enter note title"
                        className="mt-1 text-base"
                      />
                    </div>
                    
                    <div>
                      <Label className="text-base font-medium">Subject</Label>
                      <div className="mt-1">
                        <SubjectSelector
                          value={selectedSubject}
                          onValueChange={setSelectedSubject}
                          required
                        />
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <Label htmlFor="note-content" className="text-base font-medium">Note Content Preview</Label>
                    <Textarea
                      id="note-content"
                      value={noteContent}
                      onChange={(e) => setNoteContent(e.target.value)}
                      placeholder="Note content will appear here..."
                      rows={6}
                      className="mt-1 resize-vertical text-sm"
                    />
                  </div>
                </div>
                
                <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t border-gray-200">
                  <Button
                    onClick={handleSaveNote}
                    disabled={!noteTitle.trim() || !noteContent.trim()}
                    className="flex-1 h-12 text-base font-semibold bg-mint-500 hover:bg-mint-600 shadow-lg"
                    size="lg"
                  >
                    <FileText className="mr-2 h-5 w-5" />
                    Save YouTube Note
                  </Button>
                  
                  <Button
                    variant="outline"
                    onClick={() => {
                      setTranscriptionState({ status: 'idle', message: '' });
                      setYoutubeUrl('');
                      setNoteTitle('');
                      setNoteContent('');
                    }}
                    className="sm:w-auto w-full h-12 text-base"
                  >
                    Start Over
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};