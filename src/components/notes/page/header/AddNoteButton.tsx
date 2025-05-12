
import React from "react";
import { Button } from "@/components/ui/button";
import { PlusCircle } from "lucide-react";

interface AddNoteButtonProps {
  onOpenDialog: () => void;
}

export const AddNoteButton = ({ onOpenDialog }: AddNoteButtonProps) => {
  return (
    <Button 
      className="rounded-s-lg bg-mint-500 hover:bg-mint-600 text-white"
      onClick={onOpenDialog}
    >
      <PlusCircle className="mr-2 h-4 w-4" />
      Add Note
    </Button>
  );
};
