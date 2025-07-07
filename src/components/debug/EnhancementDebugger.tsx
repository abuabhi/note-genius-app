import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { CheckCircle, XCircle, Loader2, AlertTriangle } from 'lucide-react';

interface DebugResult {
  step: string;
  status: 'pending' | 'success' | 'error';
  message: string;
  details?: any;
}

export const EnhancementDebugger = () => {
  const [isDebugging, setIsDebugging] = useState(false);
  const [debugResults, setDebugResults] = useState<DebugResult[]>([]);

  const addResult = (step: string, status: 'pending' | 'success' | 'error', message: string, details?: any) => {
    setDebugResults(prev => [
      ...prev.filter(r => r.step !== step),
      { step, status, message, details }
    ]);
  };

  const runDiagnostics = async () => {
    setIsDebugging(true);
    setDebugResults([]);

    try {
      // Step 1: Check Authentication
      addResult('auth', 'pending', 'Checking authentication...');
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      
      if (authError || !user) {
        addResult('auth', 'error', 'Authentication failed', authError);
        return;
      }
      addResult('auth', 'success', `Authenticated as ${user.email}`);

      // Step 2: Check User Tier
      addResult('tier', 'pending', 'Checking user tier...');
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('user_tier')
        .eq('id', user.id)
        .single();
      
      if (profileError) {
        addResult('tier', 'error', 'Failed to fetch user tier', profileError);
        return;
      }
      
      if (!['MASTER', 'DEAN'].includes(profile.user_tier)) {
        addResult('tier', 'error', `Tier ${profile.user_tier} does not have enhancement access`, { tier: profile.user_tier });
        return;
      }
      addResult('tier', 'success', `User tier: ${profile.user_tier} (Enhancement enabled)`);

      // Step 3: Test Edge Function with minimal payload
      addResult('edge_function', 'pending', 'Testing edge function...');
      
      const testPayload = {
        noteId: 'test-debug-note-id',
        noteTitle: 'Debug Test Note',
        noteContent: 'This is a simple test note for debugging the enhancement system. It contains basic text that should be easy to process.',
        enhancementType: 'summarize'
      };

      console.log('🧪 Sending test payload to edge function:', testPayload);
      
      const { data, error } = await supabase.functions.invoke('enrich-note', {
        body: testPayload
      });

      if (error) {
        addResult('edge_function', 'error', `Edge function error: ${error.message}`, error);
        return;
      }

      if (!data?.enhancedContent) {
        addResult('edge_function', 'error', 'Edge function returned no content', data);
        return;
      }

      addResult('edge_function', 'success', `Edge function successful! Generated ${data.enhancedContent.length} characters`, {
        contentLength: data.enhancedContent.length,
        tokenUsage: data.tokenUsage,
        preview: data.enhancedContent.substring(0, 100) + '...'
      });

      toast.success('All diagnostics passed! Enhancement system is working correctly.');

    } catch (error) {
      console.error('🚨 Diagnostic error:', error);
      addResult('unexpected', 'error', `Unexpected error: ${error.message}`, error);
      toast.error('Diagnostic failed with unexpected error');
    } finally {
      setIsDebugging(false);
    }
  };

  const getStatusIcon = (status: DebugResult['status']) => {
    switch (status) {
      case 'pending':
        return <Loader2 className="h-4 w-4 animate-spin text-blue-500" />;
      case 'success':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'error':
        return <XCircle className="h-4 w-4 text-red-500" />;
    }
  };

  return (
    <Card className="w-full max-w-2xl">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <AlertTriangle className="h-5 w-5 text-orange-500" />
          <span>Enhancement System Debugger</span>
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          Test the enhancement system to identify any issues
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        <Button 
          onClick={runDiagnostics} 
          disabled={isDebugging}
          className="w-full"
        >
          {isDebugging ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Running Diagnostics...
            </>
          ) : (
            'Run Diagnostics'
          )}
        </Button>

        {debugResults.length > 0 && (
          <div className="space-y-3">
            <h4 className="font-medium text-sm">Diagnostic Results:</h4>
            {debugResults.map((result, index) => (
              <div key={index} className="flex items-start space-x-3 p-3 bg-muted/50 rounded-lg">
                {getStatusIcon(result.status)}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center space-x-2">
                    <span className="font-medium text-sm capitalize">{result.step}</span>
                  </div>
                  <p className="text-sm text-muted-foreground mt-1">{result.message}</p>
                  {result.details && (
                    <details className="mt-2">
                      <summary className="text-xs text-muted-foreground cursor-pointer">
                        View Details
                      </summary>
                      <pre className="text-xs bg-background p-2 rounded mt-1 overflow-auto">
                        {JSON.stringify(result.details, null, 2)}
                      </pre>
                    </details>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};