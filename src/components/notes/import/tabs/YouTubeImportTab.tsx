
import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, Video, FileText, Download, Play, CheckCircle, AlertCircle, HelpCircle, Upload, RefreshCw } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { Note } from '@/types/note';

interface YouTubeImportTabProps {
  onImport: (noteData: Omit<Note, 'id'>) => Promise<boolean>;
}

interface TranscriptionState {
  status: 'idle' | 'checking' | 'extracting' | 'uploading' | 'transcribing' | 'completed' | 'error';
  progress: number;
  message: string;
  videoTitle?: string;
  transcript?: string;
  summary?: string;
  chapters?: Array<{ gist: string; headline: string; start: number; end: number }>;
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
      // Step 1: Checking video accessibility
      setTranscriptionState({
        status: 'checking',
        progress: 10,
        message: 'Checking video accessibility and permissions...'
      });

      // Step 2: Audio extraction
      setTranscriptionState(prev => ({
        ...prev,
        status: 'extracting',
        progress: 25,
        message: 'Extracting high-quality audio with enhanced methods...'
      }));

      // Step 3: Processing and upload
      setTranscriptionState(prev => ({
        ...prev,
        status: 'uploading',
        progress: 50,
        message: 'Processing audio and uploading for transcription...'
      }));

      // Step 4: AI transcription
      setTranscriptionState(prev => ({
        ...prev,
        status: 'transcribing',
        progress: 75,
        message: 'AI is transcribing audio with advanced language processing...'
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

      // Step 5: Completed with enhanced data
      setTranscriptionState({
        status: 'completed',
        progress: 100,
        message: `🎉 Transcription completed! Processed ${data.wordCount} words in ${Math.round(data.processingTime / 60)} minutes of content.`,
        videoTitle: data.videoTitle,
        transcript: data.transcript,
        summary: data.summary,
        chapters: data.chapters
      });

      // Auto-populate note fields with enhanced content
      setNoteTitle(data.videoTitle || 'YouTube Video Transcript');
      setNoteContent(formatEnhancedTranscriptContent(data));

    } catch (error) {
      console.error('Transcription error:', error);
      
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      let errorType = 'unknown';
      
      // Determine error type for better user guidance
      if (errorMessage.includes('YouTube is blocking') || errorMessage.includes('blocked')) {
        errorType = 'blocked';
      } else if (errorMessage.includes('Video is not accessible') || errorMessage.includes('inaccessible')) {
        errorType = 'inaccessible';
      } else if (errorMessage.includes('Audio extraction failed') || errorMessage.includes('extraction_failed')) {
        errorType = 'extraction_failed';
      } else if (errorMessage.includes('transcription failed') || errorMessage.includes('AssemblyAI')) {
        errorType = 'transcription_failed';
      }
      
      setTranscriptionState({
        status: 'error',
        progress: 0,
        message: errorMessage,
        error: errorMessage,
        errorType
      });
    }
  };

  const formatEnhancedTranscriptContent = (data: any) => {
    let content = '';
    
    // Video metadata
    content += `# ${data.videoTitle}\n\n`;
    if (data.videoUploader) {
      content += `**Channel:** ${data.videoUploader}\n`;
    }
    if (data.videoDuration) {
      content += `**Duration:** ${Math.round(data.videoDuration / 60)} minutes\n`;
    }
    if (data.languageDetected) {
      content += `**Language:** ${data.languageDetected.toUpperCase()}\n`;
    }
    content += `**Transcribed:** ${new Date().toLocaleDateString()}\n\n`;
    
    // AI-generated summary
    if (data.summary) {
      content += `## 📋 AI Summary\n${data.summary}\n\n`;
    }
    
    // Key highlights
    if (data.highlights && data.highlights.length > 0) {
      content += `## ✨ Key Highlights\n`;
      data.highlights.slice(0, 5).forEach((highlight: any, index: number) => {
        content += `${index + 1}. **${highlight.text}** (${highlight.rank} relevance)\n`;
      });
      content += '\n';
    }
    
    // Chapter breakdown
    if (data.chapters && data.chapters.length > 0) {
      content += `## 📚 Chapters\n`;
      data.chapters.forEach((chapter: any, index: number) => {
        const startTime = Math.floor(chapter.start / 1000);
        const minutes = Math.floor(startTime / 60);
        const seconds = startTime % 60;
        content += `${index + 1}. **[${minutes}:${seconds.toString().padStart(2, '0')}] ${chapter.gist}**\n   ${chapter.headline}\n\n`;
      });
    }
    
    // Speaker analysis (if multiple speakers detected)
    if (data.speakers && data.speakers.length > 0) {
      const speakerCount = new Set(data.speakers.map((s: any) => s.speaker)).size;
      if (speakerCount > 1) {
        content += `## 🎙️ Speaker Analysis\n`;
        content += `This video contains ${speakerCount} different speakers.\n\n`;
      }
    }
    
    // Sentiment analysis summary
    if (data.sentiment && data.sentiment.length > 0) {
      const avgSentiment = data.sentiment.reduce((sum: number, item: any) => 
        sum + (item.sentiment === 'POSITIVE' ? 1 : item.sentiment === 'NEGATIVE' ? -1 : 0), 0
      ) / data.sentiment.length;
      
      content += `## 😊 Sentiment Analysis\n`;
      content += `Overall tone: ${avgSentiment > 0.1 ? 'Positive' : avgSentiment < -0.1 ? 'Negative' : 'Neutral'}\n\n`;
    }
    
    // Full transcript
    if (data.transcript) {
      content += `## 📝 Full Transcript\n\n${data.transcript}`;
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
              
              {/* Specific troubleshooting based on error type */}
              {errorType === 'blocked' && (
                <div className="text-sm space-y-2">
                  <p className="font-medium">Why this happens:</p>
                  <ul className="list-disc list-inside space-y-1 text-xs">
                    <li>YouTube's bot detection system</li>
                    <li>Age-restricted or region-locked content</li>
                    <li>Popular videos with strict access controls</li>
                  </ul>
                  <p className="font-medium">Try these solutions:</p>
                  <ul className="list-disc list-inside space-y-1 text-xs">
                    <li>Use a different, less popular video</li>
                    <li>Try educational or tutorial content</li>
                    <li>Download the video and upload the audio file directly</li>
                  </ul>
                </div>
              )}
              
              {errorType === 'inaccessible' && (
                <div className="text-sm space-y-2">
                  <p className="font-medium">Possible causes:</p>
                  <ul className="list-disc list-inside space-y-1 text-xs">
                    <li>Video is private or deleted</li>
                    <li>Geographic restrictions</li>
                    <li>Channel restrictions</li>
                  </ul>
                </div>
              )}
              
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
            <div className="space-y-1">
              <p className="font-medium">🎉 Transcription Complete!</p>
              <p className="text-sm">{message}</p>
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
        <div className="space-y-2">
          <Progress value={progress} className="w-full h-2" />
          <div className="flex justify-between text-xs text-gray-500">
            <span>Processing...</span>
            <span>{progress}%</span>
          </div>
        </div>
        <div className="text-xs text-gray-500 bg-gray-50 p-2 rounded">
          💡 Tip: This may take 2-5 minutes depending on video length. Feel free to continue using the app!
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
                <h4 className="font-medium text-gray-900">Enhanced YouTube Transcription</h4>
                <p className="text-xs text-gray-600 mt-1">
                  Advanced AI with multiple extraction methods and bot detection handling
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
                disabled={transcriptionState.status !== 'idle' && transcriptionState.status !== 'error'}
              />
            </div>
            
            <Button
              onClick={handleTranscribe}
              disabled={!youtubeUrl.trim() || (transcriptionState.status !== 'idle' && transcriptionState.status !== 'error' && transcriptionState.status !== 'completed')}
              className="w-full bg-gradient-to-r from-mint-600 to-mint-700 hover:from-mint-700 hover:to-mint-800"
              size="lg"
            >
              {transcriptionState.status === 'idle' || transcriptionState.status === 'error' ? (
                <>
                  <Play className="mr-2 h-4 w-4" />
                  Start Enhanced Transcription
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

      {/* Enhanced Feature Info */}
      <div>
        <div className="flex items-center gap-2 mb-3">
          <CheckCircle className="h-4 w-4 text-mint-500" />
          <h4 className="text-sm font-medium text-gray-900">Enhanced Features:</h4>
        </div>
        
        <div className="grid gap-2">
          {[
            { text: "Multiple extraction methods with bot detection handling", icon: RefreshCw },
            { text: "Enhanced error categorization and troubleshooting", icon: HelpCircle },
            { text: "Automatic video accessibility checking", icon: CheckCircle },
            { text: "Advanced AI transcription with summaries and chapters", icon: Video },
            { text: "Improved retry logic and timeout handling", icon: RefreshCw },
            { text: "Fallback options for restricted content", icon: Upload }
          ].map((feature, index) => (
            <div 
              key={index}
              className="flex items-center gap-3 p-3 bg-white rounded-lg border border-gray-200"
            >
              <div className="p-1.5 bg-mint-50 rounded-md">
                <feature.icon className="h-3.5 w-3.5 text-mint-600" />
              </div>
              <span className="text-sm text-gray-700">{feature.text}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
