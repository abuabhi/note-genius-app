
import React from "react";
import { Trash2 } from "lucide-react";
import { DropdownMenuItem } from "@/components/ui/dropdown-menu";

interface DeleteActionProps {
  onDelete: (id: string) => void;
  noteId: string;
}

export const DeleteAction = ({ onDelete, noteId }: DeleteActionProps) => {
  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    onDelete(noteId);
  };

  return (
    <DropdownMenuItem 
      className="flex items-center cursor-pointer text-red-600 hover:text-red-800 focus:text-red-800" 
      onClick={handleDelete}
    >
      <Trash2 className="mr-2 h-4 w-4" />
      <span>Delete note</span>
    </DropdownMenuItem>
  );
};
