import { AlertTriangle } from 'lucide-react';
import { useAuth } from '@/hooks/auth/useAuth';
import { NoteDiagnostics } from './management/NoteDiagnostics';
// Keep the import but we won't render the component
import { ForceDeleteNote } from './management/ForceDeleteNote';

interface NoteManagementProps {
  noteId?: string;
}

export const NoteManagement = ({ noteId }: NoteManagementProps) => {
  const { user } = useAuth();
  
  if (!user || !noteId) return null;

  // We're keeping this component simple by just showing diagnostics
  // ForceDeleteNote is maintained in the codebase but not displayed
  return (
    <div className="mt-4 border border-red-200 rounded-md p-4 bg-red-50">
      <div className="flex items-start space-x-2 mb-3">
        <AlertTriangle className="h-5 w-5 text-red-600 mt-0.5 flex-shrink-0" />
        <div>
          <h4 className="text-red-600 font-medium">Troubleshooting Options</h4>
          <p className="text-sm text-gray-600 mb-4">
            If you're having trouble with this note, you can run diagnostics to help identify issues.
          </p>
        </div>
      </div>
      
      <div className="flex flex-wrap gap-2 mb-4">
        <NoteDiagnostics noteId={noteId} />
        {/* ForceDeleteNote component removed from UI but kept in codebase */}
      </div>
      
      <div className="mt-3 text-xs text-gray-600">
        <p className="font-medium">Note ID: <span className="font-mono bg-gray-100 px-1">{noteId}</span></p>
      </div>
    </div>
  );
};
