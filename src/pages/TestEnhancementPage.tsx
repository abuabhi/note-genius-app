import React, { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import Layout from '@/components/layout/Layout';
import { Loader2, Clock, FileText, Zap } from 'lucide-react';
import { useTabVisibility } from '@/hooks/performance/useTabVisibility';
import { useBackgroundProcessor } from '@/hooks/performance/useBackgroundProcessor';
import { useParams } from 'react-router-dom';

interface EnhancementResult {
  summary_title: string;
  summary_overview: string;
  key_points: string[];
  notable_terms: Array<{ term: string; definition: string }>;
  quote_or_stat: string;
}

interface TestResult {
  success: boolean;
  result?: EnhancementResult;
  processing_time?: number;
  total_time?: number;
  tokens_used?: number;
  error?: string;
}

const STORAGE_KEY = 'test-enhancement-state';

export default function TestEnhancementPage() {
  const { noteId } = useParams();
  const [inputText, setInputText] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [result, setResult] = useState<TestResult | null>(null);
  const [startTime, setStartTime] = useState<number>(0);
  const abortControllerRef = useRef<AbortController | null>(null);
  const isVisible = useTabVisibility();
  const { addJob, registerWorker } = useBackgroundProcessor();

  // State persistence
  useEffect(() => {
    const savedState = sessionStorage.getItem(STORAGE_KEY);
    if (savedState) {
      try {
        const state = JSON.parse(savedState);
        if (state.isProcessing) {
          // If we were processing when we left, show a recovery message
          setInputText(state.inputText || '');
          setIsProcessing(false);
          toast.info('Previous generation was interrupted. You can restart it.');
        } else {
          setInputText(state.inputText || '');
          setResult(state.result || null);
        }
      } catch (error) {
        console.error('Failed to restore state:', error);
      }
    }
  }, []);

  // Save state on changes
  useEffect(() => {
    const state = {
      inputText,
      isProcessing,
      result,
      startTime
    };
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }, [inputText, isProcessing, result, startTime]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
        console.log('🛑 Enhancement request aborted due to component unmount');
      }
    };
  }, []);

  // Background worker registration - uses optimized simple-enhance-note
  useEffect(() => {
    registerWorker('enhance-text', async (data) => {
      try {
        // Use simple-enhance-note for background processing with DB save
        const { data: result, error } = await supabase.functions.invoke('simple-enhance-note', {
          body: { 
            text: data.text,
            noteId: data.noteId,
            enhancementType: 'questions'
          }
        });
        
        if (error) throw error;
        
        // Update state with result
        setResult({
          success: result.success,
          result: result.enhancedContent ? {
            summary_title: 'Background Enhancement Complete',
            summary_overview: result.enhancedContent.substring(0, 200) + '...',
            key_points: ['Enhancement completed in background'],
            notable_terms: [],
            quote_or_stat: 'N/A'
          } : undefined,
          total_time: performance.now() - data.startTime
        });
        setIsProcessing(false);
        
        if (result.success) {
          toast.success('Enhancement completed and saved to database!');
        } else {
          toast.error('Enhancement failed: ' + result.error);
        }
      } catch (error) {
        setResult({
          success: false,
          error: error instanceof Error ? error.message : 'Background processing failed',
          total_time: performance.now() - data.startTime
        });
        setIsProcessing(false);
        toast.error('Background enhancement failed');
      }
    });
  }, [registerWorker]);

  // Handle tab visibility changes during processing
  useEffect(() => {
    if (!isVisible && isProcessing && abortControllerRef.current) {
      console.log('🔄 Tab hidden during processing, switching to background mode');
      addJob('enhance-text', { 
        text: inputText, 
        startTime: startTime,
        noteId 
      }, 'high');
      
      // Abort foreground request
      abortControllerRef.current.abort();
      toast.info('Processing moved to background');
    }
  }, [isVisible, isProcessing, inputText, startTime, noteId, addJob]);

  const handleEnhance = async () => {
    if (!inputText.trim()) {
      toast.error('Please enter some text to enhance');
      return;
    }

    // Cancel any existing request
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    // Create new abort controller
    abortControllerRef.current = new AbortController();

    console.time('🔥 Total Enhancement Time');
    const start = performance.now();
    setStartTime(start);
    setIsProcessing(true);
    setResult(null);

    try {
      console.log('📤 Sending enhancement request...', {
        textLength: inputText.length,
        timestamp: new Date().toISOString()
      });

      // Use simple-enhance-note for optimized processing with background DB save
      const { data, error } = noteId 
        ? await supabase.functions.invoke('simple-enhance-note', {
            body: { 
              text: inputText,
              noteId,
              enhancementType: 'questions'
            }
          })
        : await supabase.functions.invoke('test-enhance', {
            body: { text: inputText }
          });

      // Check if request was aborted
      if (abortControllerRef.current?.signal.aborted) {
        console.log('🛑 Request was aborted');
        return;
      }

      const totalTime = performance.now() - start;
      console.timeEnd('🔥 Total Enhancement Time');

      if (error) {
        console.error('❌ Enhancement error:', error);
        setResult({
          success: false,
          error: error.message || 'Unknown error occurred',
          total_time: totalTime
        });
        toast.error('Enhancement failed: ' + error.message);
        return;
      }

      console.log('✅ Enhancement completed:', {
        success: data.success,
        processingTime: data.processing_time,
        totalTime: totalTime,
        enhancedContent: noteId ? !!data.enhancedContent : !!data.result
      });

      // Transform response based on function used
      const result = noteId && data.enhancedContent ? {
        success: true,
        result: {
          summary_title: 'Enhanced Content Generated',
          summary_overview: data.enhancedContent.substring(0, 200) + '...',
          key_points: ['Content enhanced and saved to database'],
          notable_terms: [],
          quote_or_stat: 'N/A'
        },
        processing_time: data.processing_time,
        total_time: totalTime
      } : {
        ...data,
        total_time: totalTime
      };

      setResult(result);

      if (data.success) {
        const message = noteId 
          ? `Enhancement completed and saved in ${(totalTime / 1000).toFixed(1)}s`
          : `Enhancement completed in ${(totalTime / 1000).toFixed(1)}s`;
        toast.success(message);
      } else {
        toast.error('Enhancement failed: ' + data.error);
      }
    } catch (error) {
      // Don't show error if request was aborted
      if (abortControllerRef.current?.signal.aborted) {
        console.log('🛑 Request aborted, not showing error');
        return;
      }

      const totalTime = performance.now() - start;
      console.timeEnd('🔥 Total Enhancement Time');
      console.error('💥 Enhancement request failed:', error);
      
      setResult({
        success: false,
        error: error instanceof Error ? error.message : 'Network error',
        total_time: totalTime
      });
      toast.error('Request failed: ' + (error instanceof Error ? error.message : 'Network error'));
    } finally {
      setIsProcessing(false);
      abortControllerRef.current = null;
    }
  };

  const charCount = inputText.length;
  const estimatedTime = Math.max(3, Math.ceil(charCount / 1000) * 0.5);

  return (
    <Layout>
      <div className="container mx-auto p-6 max-w-6xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-primary mb-2">Test Enhancement</h1>
          <p className="text-muted-foreground">
            Direct testing of OpenAI enhancement with performance monitoring
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Input Section */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="w-5 h-5" />
                Input Text
              </CardTitle>
              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                <span>{charCount.toLocaleString()} characters</span>
                <span className="flex items-center gap-1">
                  <Clock className="w-4 h-4" />
                  ~{estimatedTime}s estimated
                </span>
              </div>
            </CardHeader>
            <CardContent>
              <Textarea
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                placeholder="Paste your text content here for enhancement..."
                className="min-h-[300px] resize-none"
                disabled={isProcessing}
              />
              <div className="flex justify-between items-center mt-4">
                <div className="text-xs text-muted-foreground">
                  Max: 100,000 characters
                </div>
                <Button 
                  onClick={handleEnhance}
                  disabled={isProcessing || !inputText.trim()}
                  variant="outline"
                  className="flex items-center gap-2 bg-mint-50 border-mint-200 text-mint-700 hover:bg-mint-100 hover:text-mint-800"
                >
                  {isProcessing ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    <>
                      <Zap className="w-4 h-4" />
                      Convert
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Results Section */}
          <Card>
            <CardHeader>
              <CardTitle>Enhancement Results</CardTitle>
              {result && (
                <div className="flex items-center gap-4 text-sm">
                  <span className={`px-2 py-1 rounded ${
                    result.success ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                  }`}>
                    {result.success ? 'Success' : 'Failed'}
                  </span>
                  {result.total_time && (
                    <span className="text-muted-foreground">
                      {(result.total_time / 1000).toFixed(1)}s total
                    </span>
                  )}
                  {result.processing_time && (
                    <span className="text-muted-foreground">
                      {(result.processing_time / 1000).toFixed(1)}s API
                    </span>
                  )}
                  {noteId && (
                    <span className="text-mint-600 text-xs">
                      Auto-saved to note
                    </span>
                  )}
                </div>
              )}
            </CardHeader>
            <CardContent>
              {!result && !isProcessing && (
                <div className="text-center text-muted-foreground py-8">
                  Results will appear here after enhancement
                </div>
              )}
              
              {isProcessing && (
                <div className="text-center py-8">
                  <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-primary" />
                  <p className="text-muted-foreground">
                    {isVisible ? 'Processing enhancement...' : 'Processing in background...'}
                  </p>
                  <p className="text-xs text-muted-foreground mt-2">
                    Elapsed: {startTime ? ((performance.now() - startTime) / 1000).toFixed(1) : 0}s
                  </p>
                  {!isVisible && (
                    <p className="text-xs text-mint-600 mt-1">
                      Generation continues even when you navigate away
                    </p>
                  )}
                </div>
              )}

              {result && !result.success && (
                <div className="text-red-600 p-4 bg-red-50 rounded-lg">
                  <strong>Error:</strong> {result.error}
                </div>
              )}

              {result && result.success && result.result && (
                <div className="space-y-4">
                  <div>
                    <h3 className="font-semibold text-primary mb-2">Summary Title</h3>
                    <p className="text-sm bg-muted p-3 rounded">{result.result.summary_title}</p>
                  </div>

                  <div>
                    <h3 className="font-semibold text-primary mb-2">Overview</h3>
                    <p className="text-sm bg-muted p-3 rounded">{result.result.summary_overview}</p>
                  </div>

                  <div>
                    <h3 className="font-semibold text-primary mb-2">Key Points</h3>
                    <ul className="text-sm space-y-1">
                      {result.result.key_points.map((point, index) => (
                        <li key={index} className="flex items-start gap-2">
                          <span className="text-primary mt-1">•</span>
                          <span>{point}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {result.result.notable_terms.length > 0 && (
                    <div>
                      <h3 className="font-semibold text-primary mb-2">Notable Terms</h3>
                      <div className="space-y-2">
                        {result.result.notable_terms.map((term, index) => (
                          <div key={index} className="text-sm">
                            <strong>{term.term}:</strong> {term.definition}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {result.result.quote_or_stat !== 'N/A' && (
                    <div>
                      <h3 className="font-semibold text-primary mb-2">Notable Quote/Statistic</h3>
                      <blockquote className="text-sm italic bg-muted p-3 rounded border-l-4 border-primary">
                        {result.result.quote_or_stat}
                      </blockquote>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </Layout>
  );
}