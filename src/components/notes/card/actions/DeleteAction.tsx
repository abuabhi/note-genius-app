
import React, { useState } from "react";
import { Trash2 } from "lucide-react";
import { DropdownMenuItem } from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface DeleteActionProps {
  onDelete: (id: string) => Promise<void>;
  noteId: string;
}

export const DeleteAction = ({ onDelete, noteId }: DeleteActionProps) => {
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDeleteClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    console.log("DeleteAction - Opening confirmation dialog for note:", noteId);
    setShowConfirmDialog(true);
  };

  const handleConfirmDelete = async () => {
    console.log("DeleteAction - Confirmed delete for note:", noteId);
    setIsDeleting(true);
    try {
      await onDelete(noteId);
      console.log("DeleteAction - Delete successful for note:", noteId);
      setShowConfirmDialog(false);
    } catch (error) {
      console.error('DeleteAction - Delete failed:', error);
      // Keep dialog open on error so user can try again
    } finally {
      setIsDeleting(false);
    }
  };

  const handleCancelDelete = () => {
    console.log("DeleteAction - Cancelled delete for note:", noteId);
    setShowConfirmDialog(false);
  };

  return (
    <>
      <DropdownMenuItem 
        className="flex items-center cursor-pointer p-2.5 rounded-md hover:bg-red-50 transition-colors duration-150 text-red-600 hover:text-red-700" 
        onClick={handleDeleteClick}
        onSelect={(e) => {
          e.preventDefault();
        }}
      >
        <div className="flex items-center justify-center w-6 h-6 bg-red-100 rounded-md mr-3">
          <Trash2 className="h-3.5 w-3.5 text-red-600" />
        </div>
        <span className="text-sm font-medium">Delete note</span>
      </DropdownMenuItem>

      <AlertDialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
        <AlertDialogContent className="bg-white border border-red-200 rounded-lg shadow-lg">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-lg font-semibold text-gray-900">Confirm Delete</AlertDialogTitle>
            <AlertDialogDescription className="text-sm text-gray-600 mt-2">
              Are you sure you want to delete this note? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="flex gap-2 mt-6">
            <AlertDialogCancel 
              onClick={handleCancelDelete} 
              disabled={isDeleting}
              className="bg-gray-100 hover:bg-gray-200 text-gray-900 border-0 font-medium"
            >
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleConfirmDelete}
              className="bg-red-500 hover:bg-red-600 text-white border-0 font-medium"
              disabled={isDeleting}
            >
              {isDeleting ? 'Deleting...' : 'Delete'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};
