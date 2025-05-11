
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { Loader2, Trash, AlertTriangle, RefreshCw } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/auth/useAuth';
import { useNotes } from '@/contexts/NoteContext';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

interface NoteManagementProps {
  noteId?: string;
}

export const NoteManagement = ({ noteId }: NoteManagementProps) => {
  const [isDeleting, setIsDeleting] = useState(false);
  const [diagnosticInfo, setDiagnosticInfo] = useState<string | null>(null);
  const [diagnosisRunning, setDiagnosisRunning] = useState(false);
  const navigate = useNavigate();
  const { user } = useAuth();
  const { setNotes } = useNotes();
  
  if (!user || !noteId) return null;

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
        .select('count')
        .eq('note_id', noteId)
        .single();
        
      // Check scan_data
      const { data: scanData, error: scanError } = await supabase
        .from('scan_data')
        .select('count')
        .eq('note_id', noteId)
        .single();
        
      // Check note_enrichment_usage
      const { data: usageData, error: usageError } = await supabase
        .from('note_enrichment_usage')
        .select('count')
        .eq('note_id', noteId)
        .single();
      
      let info = `Note found: ${noteData.title}\n`;
      info += `Related records:\n`;
      info += `- Tags: ${tagError ? "Error checking" : (tagData?.count || 0)}\n`;
      info += `- Scan data: ${scanError ? "Error checking" : (scanData?.count || 0)}\n`;
      info += `- Enrichment usage: ${usageError ? "Error checking" : (usageData?.count || 0)}\n`;
      
      setDiagnosticInfo(info);
    } catch (error) {
      setDiagnosticInfo(`Diagnostic error: ${error.message}`);
    } finally {
      setDiagnosisRunning(false);
    }
  };

  const handleForceDelete = async () => {
    try {
      setIsDeleting(true);
      toast.loading("Force deleting note...");
      
      // Call the edge function directly to delete the note with admin privileges
      const { data, error } = await supabase.functions.invoke('delete-note', {
        body: { noteId }
      });
      
      if (error) {
        console.error("Error in edge function:", error);
        toast.dismiss();
        toast.error(`Failed to delete note: ${error.message || "Unknown error"}`);
        throw error;
      }
      
      // Update local state to remove the deleted note
      setNotes(prev => prev.filter(note => note.id !== noteId));
      
      toast.dismiss();
      toast.success('Note has been permanently deleted');
      
      // Navigate back to notes list
      navigate('/notes');
    } catch (error) {
      console.error('Error deleting note:', error);
      toast.dismiss();
      toast.error(`Failed to delete note: ${error.message || "Unknown error"}`);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="mt-4 border border-red-200 rounded-md p-4 bg-red-50">
      <div className="flex items-start space-x-2 mb-3">
        <AlertTriangle className="h-5 w-5 text-red-600 mt-0.5 flex-shrink-0" />
        <div>
          <h4 className="text-red-600 font-medium">Troubleshooting Options</h4>
          <p className="text-sm text-gray-600 mb-4">
            If you're having trouble deleting this note through normal methods, you can run diagnostics or force delete it.
            <strong className="text-red-600"> Force deletion cannot be undone.</strong>
          </p>
        </div>
      </div>
      
      <div className="flex flex-wrap gap-2 mb-4">
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
        
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button 
              variant="destructive" 
              disabled={isDeleting}
              className="flex items-center gap-2"
            >
              {isDeleting ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Trash className="h-4 w-4" />
              )}
              {isDeleting ? 'Deleting...' : 'Force Delete Note'}
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle className="text-red-600">Confirm Force Delete</AlertDialogTitle>
              <AlertDialogDescription>
                <p className="mb-2">This will permanently delete this note and all associated data from the database using administrative privileges.</p>
                <p className="font-bold text-red-600">This action cannot be undone under any circumstances.</p>
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={handleForceDelete}
                className="bg-red-600 hover:bg-red-700 focus:ring-red-600"
              >
                Yes, Permanently Delete Note
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
      
      {diagnosticInfo && (
        <div className="mt-3 bg-white p-3 rounded border border-red-100">
          <h5 className="text-sm font-medium mb-1">Diagnostic Information</h5>
          <pre className="text-xs whitespace-pre-wrap font-mono bg-gray-50 p-2 rounded">
            {diagnosticInfo}
          </pre>
        </div>
      )}
      
      <div className="mt-3 text-xs text-gray-600">
        <p className="font-medium">Note ID: <span className="font-mono bg-gray-100 px-1">{noteId}</span></p>
      </div>
    </div>
  );
};
