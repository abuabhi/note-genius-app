
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Loader2, RefreshCw } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

interface NoteDiagnosticsProps {
  noteId: string;
}

export const NoteDiagnostics = ({ noteId }: NoteDiagnosticsProps) => {
  const [diagnosticInfo, setDiagnosticInfo] = useState<string | null>(null);
  const [diagnosisRunning, setDiagnosisRunning] = useState(false);
  
  const runDiagnostics = async () => {
    try {
      setDiagnosisRunning(true);
      setDiagnosticInfo("Running diagnostics...");
      
      // Check for references to this note in various tables
      const { data: noteData, error: noteError } = await supabase
        .from('notes')
        .select('*')
        .eq('id', noteId)
        .single();
        
      if (noteError) {
        setDiagnosticInfo(`Note query error: ${noteError.message}`);
        return;
      }
      
      if (!noteData) {
        setDiagnosticInfo("Note not found in database");
        return;
      }
      
      // Check note_tags
      const { data: tagData, error: tagError } = await supabase
        .from('note_tags')
        .select('*')
        .eq('note_id', noteId);
        
      // Check scan_data
      const { data: scanData, error: scanError } = await supabase
        .from('scan_data')
        .select('*')
        .eq('note_id', noteId);
        
      // Check note_enrichment_usage
      const { data: usageData, error: usageError } = await supabase
        .from('note_enrichment_usage')
        .select('*')
        .eq('note_id', noteId);
      
      let info = `Note found: ${noteData.title}\n`;
      info += `Related records:\n`;
      info += `- Tags: ${tagError ? "Error checking" : (tagData?.length || 0)}\n`;
      info += `- Scan data: ${scanError ? "Error checking" : (scanData?.length || 0)}\n`;
      info += `- Enrichment usage: ${usageError ? "Error checking" : (usageData?.length || 0)}\n`;
      
      setDiagnosticInfo(info);
    } catch (error) {
      setDiagnosticInfo(`Diagnostic error: ${error.message}`);
    } finally {
      setDiagnosisRunning(false);
    }
  };

  return (
    <>
      <Button
        variant="outline"
        onClick={runDiagnostics}
        disabled={diagnosisRunning}
        className="flex items-center gap-2"
      >
        {diagnosisRunning ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <RefreshCw className="h-4 w-4" />
        )}
        Run Diagnostics
      </Button>
      
      {diagnosticInfo && (
        <div className="mt-3 bg-white p-3 rounded border border-red-100">
          <h5 className="text-sm font-medium mb-1">Diagnostic Information</h5>
          <pre className="text-xs whitespace-pre-wrap font-mono bg-gray-50 p-2 rounded">
            {diagnosticInfo}
          </pre>
        </div>
      )}
    </>
  );
};
