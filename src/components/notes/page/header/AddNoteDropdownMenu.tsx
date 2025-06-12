
import React from "react";
import { Button } from "@/components/ui/button";
import { ChevronDown, FileText, Camera, Import } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";

interface AddNoteDropdownMenuProps {
  onOpenManualDialog: () => void;
  onOpenScanDialog: () => void;
  onOpenImportDialog: () => void;
}

export const AddNoteDropdownMenu = ({
  onOpenManualDialog,
  onOpenScanDialog,
  onOpenImportDialog
}: AddNoteDropdownMenuProps) => {
  return (
    <div data-guide="add-note-button">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            className="rounded-e-lg shadow-none bg-mint-500 hover:bg-mint-600 text-white border-l border-mint-400/30 transition-all duration-200 hover:shadow-md"
            size="icon"
            aria-label="Add Note Options"
          >
            <ChevronDown size={16} strokeWidth={2} aria-hidden="true" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent
          className="w-72 bg-white border border-mint-100 shadow-lg rounded-lg p-1"
          side="bottom"
          sideOffset={6}
          align="end"
        >
          <DropdownMenuItem 
            onClick={onOpenManualDialog} 
            className="cursor-pointer p-3 rounded-md hover:bg-mint-50 transition-colors duration-150"
          >
            <div className="flex items-center w-full">
              <div className="flex items-center justify-center w-8 h-8 bg-mint-100 rounded-md mr-3">
                <FileText className="h-4 w-4 text-mint-600" />
              </div>
              <div className="flex flex-col flex-1 min-w-0">
                <span className="text-sm font-medium text-gray-900">Manual Entry</span>
                <span className="text-xs text-gray-500 mt-0.5">Create a note by typing content manually</span>
              </div>
            </div>
          </DropdownMenuItem>
          
          <DropdownMenuItem 
            onClick={onOpenScanDialog} 
            className="cursor-pointer p-3 rounded-md hover:bg-mint-50 transition-colors duration-150"
          >
            <div className="flex items-center w-full">
              <div className="flex items-center justify-center w-8 h-8 bg-blue-100 rounded-md mr-3">
                <Camera className="h-4 w-4 text-blue-600" />
              </div>
              <div className="flex flex-col flex-1 min-w-0">
                <span className="text-sm font-medium text-gray-900">Scan Note</span>
                <span className="text-xs text-gray-500 mt-0.5">Create a note by scanning physical documents</span>
              </div>
            </div>
          </DropdownMenuItem>
          
          <DropdownMenuItem 
            onClick={onOpenImportDialog} 
            className="cursor-pointer p-3 rounded-md hover:bg-mint-50 transition-colors duration-150"
          >
            <div className="flex items-center w-full">
              <div className="flex items-center justify-center w-8 h-8 bg-purple-100 rounded-md mr-3">
                <Import className="h-4 w-4 text-purple-600" />
              </div>
              <div className="flex flex-col flex-1 min-w-0">
                <span className="text-sm font-medium text-gray-900">Import Document</span>
                <span className="text-xs text-gray-500 mt-0.5">Create a note by importing a document</span>
              </div>
            </div>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
};
