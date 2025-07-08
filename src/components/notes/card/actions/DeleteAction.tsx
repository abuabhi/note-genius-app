
import React from "react";
import { DropdownMenuItem } from "@/components/ui/dropdown-menu";
import { Trash2 } from "lucide-react";

interface DeleteActionProps {
  noteId: string;
  onDelete: (id: string) => Promise<void>;
}

export const DeleteAction = ({ noteId, onDelete }: DeleteActionProps) => {
  const handleDelete = async (e: React.MouseEvent) => {
    e.stopPropagation();
    console.log("🗑️ [DELETE ACTION] Starting delete for note ID:", noteId);
    console.log("🗑️ [DELETE ACTION] Event details:", { type: e.type, target: e.target });
    
    // Show confirmation dialog
    console.log("🗑️ [DELETE ACTION] Showing confirmation dialog...");
    const confirmed = window.confirm("Are you sure you want to delete this note? This action cannot be undone.");
    console.log("🗑️ [DELETE ACTION] User confirmation result:", confirmed);
    
    if (confirmed) {
      try {
        console.log("🗑️ [DELETE ACTION] Calling onDelete function with noteId:", noteId);
        await onDelete(noteId);
        console.log("✅ [DELETE ACTION] Delete completed successfully for note ID:", noteId);
      } catch (error) {
        console.error("❌ [DELETE ACTION] Delete failed for note ID:", noteId);
        console.error("❌ [DELETE ACTION] Error details:", error);
        console.error("❌ [DELETE ACTION] Error message:", error instanceof Error ? error.message : 'Unknown error');
        console.error("❌ [DELETE ACTION] Error stack:", error instanceof Error ? error.stack : 'No stack');
        throw error;
      }
    } else {
      console.log("🚫 [DELETE ACTION] User cancelled deletion for note ID:", noteId);
    }
  };

  return (
    <DropdownMenuItem 
      onClick={handleDelete}
      className="flex items-center cursor-pointer px-3 py-3 rounded-lg hover:bg-red-50 transition-colors duration-200 group"
    >
      <div className="flex items-center justify-center w-8 h-8 bg-red-100 rounded-lg mr-3 group-hover:bg-red-200 transition-colors duration-200">
        <Trash2 className="h-4 w-4 text-red-600" />
      </div>
      <span className="text-sm font-medium text-red-700">Delete Note</span>
    </DropdownMenuItem>
  );
};
