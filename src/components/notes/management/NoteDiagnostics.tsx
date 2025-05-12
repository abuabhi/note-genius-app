
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { Loader2, Database } from 'lucide-react';

interface NoteDiagnosticsProps {
  noteId: string;
}

export const NoteDiagnostics = ({ noteId }: NoteDiagnosticsProps) => {
  const [isRunning, setIsRunning] = useState(false);
  const [diagnosticResults, setDiagnosticResults] = useState<any>(null);

  const runDiagnostics = async () => {
    try {
      setIsRunning(true);
      toast.loading("Running diagnostics...");
      
      // Get note information
      const { data: noteData, error: noteError } = await supabase
        .from('notes')
        .select('*')
        .eq('id', noteId)
        .single();
      
      // Get related tags
      const { data: tagData, error: tagError } = await supabase
        .from('note_tags')
        .select('*')
        .eq('note_id', noteId);
        
      // Get related scan data
      const { data: scanData, error: scanError } = await supabase
        .from('scan_data')
        .select('*')
        .eq('note_id', noteId);
      
      // Get related enrichment usage
      const { data: usageData, error: usageError } = await supabase
        .from('note_enrichment_usage')
        .select('*')
        .eq('note_id', noteId);
      
      const results = {
        note: { data: noteData, error: noteError },
        tags: { data: tagData, error: tagError },
        scan: { data: scanData, error: scanError },
        usage: { data: usageData, error: usageError }
      };
      
      setDiagnosticResults(results);
      
      toast.dismiss();
      
      if (noteError) {
        toast.error("Note not found in database, may have been deleted already");
      } else {
        toast.success("Diagnostics completed");
      }
      
      console.log("Note diagnostics results:", results);
    } catch (error) {
      console.error('Error running diagnostics:', error);
      toast.dismiss();
      toast.error(`Failed to run diagnostics: ${error.message}`);
    } finally {
      setIsRunning(false);
    }
  };

  return (
    <Button
      variant="outline"
      onClick={runDiagnostics}
      disabled={isRunning}
      className="flex items-center gap-2"
    >
      {isRunning ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : (
        <Database className="h-4 w-4" />
      )}
      {isRunning ? 'Running Diagnostics...' : 'Run Diagnostics'}
    </Button>
  );
};
