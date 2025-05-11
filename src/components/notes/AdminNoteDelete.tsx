
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Loader2 } from "lucide-react";

export const AdminNoteDelete = () => {
  const [noteId, setNoteId] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);
  
  const handleDeleteNote = async () => {
    if (!noteId.trim()) {
      toast.error("Please enter a note ID");
      return;
    }
    
    try {
      setIsDeleting(true);
      
      const { data, error } = await supabase.functions.invoke("delete-note", {
        body: { noteId: noteId.trim() }
      });
      
      if (error) {
        throw new Error(error.message);
      }
      
      toast.success(data.message || "Note deleted successfully");
      setNoteId("");
    } catch (error) {
      console.error("Failed to delete note:", error);
      toast.error(`Failed to delete note: ${error.message}`);
    } finally {
      setIsDeleting(false);
    }
  };
  
  return (
    <div className="border border-red-200 rounded-lg p-4 bg-red-50">
      <h2 className="text-lg font-semibold text-red-700 mb-2">Admin: Delete Problematic Note</h2>
      <p className="text-sm text-red-600 mb-4">
        If a note can't be deleted through the UI, enter its ID below to force delete it from the database.
      </p>
      
      <div className="flex gap-2">
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
    </div>
  );
};
