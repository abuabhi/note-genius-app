import React from "react";
import { Trash2 } from "lucide-react";
import { toast } from "sonner";

interface UnifiedDeleteActionProps {
  noteId: string;
  noteTitle: string;
  onDelete: (id: string) => Promise<void>;
  className?: string;
  children?: React.ReactNode;
  variant?: 'dropdown' | 'button';
}

export const UnifiedDeleteAction = ({ 
  noteId, 
  noteTitle,
  onDelete, 
  className = "",
  children,
  variant = 'dropdown'
}: UnifiedDeleteActionProps) => {
  const handleDelete = async (e: React.MouseEvent) => {
    e.stopPropagation();
    console.log("🗑️ [UNIFIED DELETE] Starting delete for note:", noteId, noteTitle);
    
    // Show confirmation dialog
    const confirmed = window.confirm(
      `Are you sure you want to delete "${noteTitle}"?\n\nThis action cannot be undone.`
    );
    
    if (!confirmed) {
      console.log("🚫 [UNIFIED DELETE] User cancelled deletion");
      return;
    }

    try {
      console.log("🗑️ [UNIFIED DELETE] Calling delete function...");
      await onDelete(noteId);
      console.log("✅ [UNIFIED DELETE] Delete completed successfully");
    } catch (error) {
      console.error("❌ [UNIFIED DELETE] Delete failed:", error);
      toast.error('Failed to delete note. Please try again.');
    }
  };

  if (variant === 'button') {
    return (
      <button
        onClick={handleDelete}
        className={`inline-flex items-center gap-2 text-red-600 hover:text-red-700 ${className}`}
        aria-label={`Delete ${noteTitle}`}
      >
        <Trash2 className="h-4 w-4" />
        {children}
      </button>
    );
  }

  // Default dropdown variant
  return (
    <div 
      onClick={handleDelete}
      className={`flex items-center cursor-pointer px-3 py-3 rounded-lg hover:bg-red-50 transition-colors duration-200 group ${className}`}
    >
      <div className="flex items-center justify-center w-8 h-8 bg-red-100 rounded-lg mr-3 group-hover:bg-red-200 transition-colors duration-200">
        <Trash2 className="h-4 w-4 text-red-600" />
      </div>
      <span className="text-sm font-medium text-red-700">Delete Note</span>
    </div>
  );
};