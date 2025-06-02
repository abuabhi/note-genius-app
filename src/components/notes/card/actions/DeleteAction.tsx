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
        className="flex items-center cursor-pointer text-red-600 hover:text-red-800 focus:text-red-800" 
        onClick={handleDeleteClick}
        onSelect={(e) => {
          e.preventDefault();
        }}
      >
        <Trash2 className="mr-2 h-4 w-4" />
        <span>Delete note</span>
      </DropdownMenuItem>

      <AlertDialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirm Delete</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this note? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={handleCancelDelete} disabled={isDeleting}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleConfirmDelete}
              className="bg-red-500 hover:bg-red-600"
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
