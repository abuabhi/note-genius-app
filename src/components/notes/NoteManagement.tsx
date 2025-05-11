
import { AlertTriangle } from 'lucide-react';
import { useAuth } from '@/hooks/auth/useAuth';
import { NoteDiagnostics } from './management/NoteDiagnostics';
import { ForceDeleteNote } from './management/ForceDeleteNote';

interface NoteManagementProps {
  noteId?: string;
}

export const NoteManagement = ({ noteId }: NoteManagementProps) => {
  const { user } = useAuth();
  
  if (!user || !noteId) return null;

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
        <NoteDiagnostics noteId={noteId} />
        <ForceDeleteNote noteId={noteId} />
      </div>
      
      <div className="mt-3 text-xs text-gray-600">
        <p className="font-medium">Note ID: <span className="font-mono bg-gray-100 px-1">{noteId}</span></p>
      </div>
    </div>
  );
};
