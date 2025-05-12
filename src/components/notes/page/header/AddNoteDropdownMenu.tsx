
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
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          className="rounded-none shadow-none first:rounded-s-lg last:rounded-e-lg focus-visible:z-10 bg-mint-500 hover:bg-mint-600 text-white"
          size="icon"
          aria-label="Add Note Options"
        >
          <ChevronDown size={16} strokeWidth={2} aria-hidden="true" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        className="max-w-64 md:max-w-xs bg-white"
        side="bottom"
        sideOffset={4}
        align="end"
      >
        <DropdownMenuItem onClick={onOpenManualDialog} className="cursor-pointer">
          <FileText className="mr-2 h-4 w-4" />
          <div className="flex flex-col gap-1">
            <span className="text-sm font-medium">Manual Entry</span>
            <span className="text-xs text-muted-foreground">Create a note by typing content manually</span>
          </div>
        </DropdownMenuItem>
        <DropdownMenuItem onClick={onOpenScanDialog} className="cursor-pointer">
          <Camera className="mr-2 h-4 w-4" />
          <div className="flex flex-col gap-1">
            <span className="text-sm font-medium">Scan Note</span>
            <span className="text-xs text-muted-foreground">Create a note by scanning physical documents</span>
          </div>
        </DropdownMenuItem>
        <DropdownMenuItem onClick={onOpenImportDialog} className="cursor-pointer">
          <Import className="mr-2 h-4 w-4" />
          <div className="flex flex-col gap-1">
            <span className="text-sm font-medium">Import Document</span>
            <span className="text-xs text-muted-foreground">Create a note by importing a document</span>
          </div>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
