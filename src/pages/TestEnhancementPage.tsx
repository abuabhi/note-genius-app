import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import Layout from '@/components/layout/Layout';
import { Loader2, Clock, FileText, Zap } from 'lucide-react';

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

export default function TestEnhancementPage() {
  const [inputText, setInputText] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [result, setResult] = useState<TestResult | null>(null);
  const [startTime, setStartTime] = useState<number>(0);

  const handleEnhance = async () => {
    if (!inputText.trim()) {
      toast.error('Please enter some text to enhance');
      return;
    }

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

      const { data, error } = await supabase.functions.invoke('test-enhance', {
        body: { text: inputText }
      });

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
        tokensUsed: data.tokens_used
      });

      setResult({
        ...data,
        total_time: totalTime
      });

      if (data.success) {
        toast.success(`Enhancement completed in ${(totalTime / 1000).toFixed(1)}s`);
      } else {
        toast.error('Enhancement failed: ' + data.error);
      }
    } catch (error) {
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
                  className="flex items-center gap-2 border-mint-200 bg-white hover:bg-mint-50 text-mint-700 hover:text-mint-800"
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
                  <p className="text-muted-foreground">Processing enhancement...</p>
                  <p className="text-xs text-muted-foreground mt-2">
                    Elapsed: {startTime ? ((performance.now() - startTime) / 1000).toFixed(1) : 0}s
                  </p>
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