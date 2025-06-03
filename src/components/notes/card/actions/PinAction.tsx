
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
      className="flex items-center cursor-pointer p-2.5 rounded-md hover:bg-mint-50 transition-colors duration-150" 
      onClick={handlePin}
    >
      <div className="flex items-center justify-center w-6 h-6 bg-mint-100 rounded-md mr-3">
        <Pin className="h-3.5 w-3.5 text-mint-600" />
      </div>
      <span className="text-sm font-medium text-gray-900">
        {isPinned ? "Unpin note" : "Pin note"}
      </span>
    </DropdownMenuItem>
  );
};
