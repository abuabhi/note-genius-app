
import React from "react";
import { Pin } from "lucide-react";
import { DropdownMenuItem } from "@/components/ui/dropdown-menu";

interface PinActionProps {
  isPinned: boolean;
  onPin: (id: string, isPinned: boolean) => void;
  noteId: string;
}

export const PinAction = ({ isPinned, onPin, noteId }: PinActionProps) => {
  const handlePin = (e: React.MouseEvent) => {
    e.stopPropagation();
    onPin(noteId, isPinned);
  };

  return (
    <DropdownMenuItem 
      className="flex items-center cursor-pointer" 
      onClick={handlePin}
    >
      <Pin className="mr-2 h-4 w-4" />
      <span>{isPinned ? "Unpin note" : "Pin note"}</span>
    </DropdownMenuItem>
  );
};
