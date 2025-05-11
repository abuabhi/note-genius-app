
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Loader2, AlertCircle } from "lucide-react";
import { useNotes } from "@/contexts/NoteContext";

export const AdminNoteDelete = () => {
  const [noteId, setNoteId] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteStatus, setDeleteStatus] = useState<string | null>(null);
  const { notes, setNotes } = useNotes();
  
  const handleDeleteNote = async () => {
    if (!noteId.trim()) {
      toast.error("Please enter a note ID");
      return;
    }
    
    try {
      setIsDeleting(true);
      setDeleteStatus("Attempting to delete note...");
      
      const { data, error } = await supabase.functions.invoke("delete-note", {
        body: { noteId: noteId.trim() }
      });
      
      if (error) {
        setDeleteStatus(`Error: ${error.message}`);
        throw new Error(error.message);
      }
      
      // Update local state to remove the deleted note
      setNotes(prevNotes => prevNotes.filter(note => note.id !== noteId.trim()));
      
      setDeleteStatus("Success: Note deleted successfully");
      toast.success(data?.message || "Note deleted successfully");
      setNoteId("");
    } catch (error) {
      console.error("Failed to delete note:", error);
      setDeleteStatus(`Failed: ${error.message}`);
      toast.error(`Failed to delete note: ${error.message}`);
    } finally {
      setIsDeleting(false);
    }
  };
  
  return (
    <div className="border border-red-200 rounded-lg p-4 bg-red-50">
      <div className="flex items-start space-x-2 mb-3">
        <AlertCircle className="h-5 w-5 text-red-600 mt-0.5" />
        <div>
          <h2 className="text-lg font-semibold text-red-700 mb-1">Admin: Force Delete Note</h2>
          <p className="text-sm text-red-600 mb-3">
            Use this tool to force delete problematic notes that cannot be deleted through normal means.
          </p>
        </div>
      </div>
      
      <div className="flex gap-2 mb-2">
        <Input
          placeholder="Enter note ID"
          value={noteId}
          onChange={(e) => setNoteId(e.target.value)}
          className="flex-1"
        />
        <Button 
          variant="destructive"
          disabled={isDeleting || !noteId.trim()} 
          onClick={handleDeleteNote}
        >
          {isDeleting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" /> 
              Deleting...
            </>
          ) : (
            "Delete Note"
          )}
        </Button>
      </div>
      
      {deleteStatus && (
        <div className={`text-sm mt-2 ${
          deleteStatus.startsWith("Success") 
            ? "text-green-600" 
            : deleteStatus.startsWith("Error") || deleteStatus.startsWith("Failed")
              ? "text-red-600"
              : "text-blue-600"
        }`}>
          {deleteStatus}
        </div>
      )}
      
      <div className="mt-3 text-xs text-gray-600">
        <p>Steps to find a note ID:</p>
        <ol className="list-decimal list-inside ml-2 mt-1">
          <li>Open the note details</li>
          <li>Check the URL for the ID portion (e.g., /notes/study/<span className="font-mono bg-gray-100 px-1">note-id-here</span>)</li>
        </ol>
      </div>
    </div>
  );
};
