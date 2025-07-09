import React from "react";
import { Button } from "@/components/ui/button";
import { PlusCircle, Import } from "lucide-react";

interface SimplifiedNotesHeaderProps {
  onOpenManualDialog: () => void;
  onOpenImportDialog: () => void;
}

export const SimplifiedNotesHeader = ({
  onOpenManualDialog,
  onOpenImportDialog
}: SimplifiedNotesHeaderProps) => {
  return (
    <div className="space-y-4">
      {/* Top Row: Title and Action Buttons */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">My Notes</h1>
          <p className="text-sm text-gray-600 mt-1">
            Create, organize and enhance your notes
          </p>
        </div>
        
        <div className="flex gap-3">
          <Button 
            className="bg-mint-600 hover:bg-mint-700 text-white shadow-sm hover:shadow-md transition-all duration-200 font-medium border-0"
            onClick={onOpenManualDialog}
          >
            <PlusCircle className="mr-2 h-4 w-4" />
            Add Note
          </Button>
          
          <Button 
            className="bg-purple-600 hover:bg-purple-700 text-white shadow-sm hover:shadow-md transition-all duration-200 font-medium border-0"
            onClick={onOpenImportDialog}
          >
            <Import className="mr-2 h-4 w-4" />
            Import
          </Button>
        </div>
      </div>
    </div>
  );
};