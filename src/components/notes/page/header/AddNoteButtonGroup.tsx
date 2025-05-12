
import React from "react";
import { AddNoteButton } from "./AddNoteButton";
import { AddNoteDropdownMenu } from "./AddNoteDropdownMenu";

interface AddNoteButtonGroupProps {
  onOpenManualDialog: () => void;
  onOpenScanDialog: () => void;
  onOpenImportDialog: () => void;
}

export const AddNoteButtonGroup = ({
  onOpenManualDialog,
  onOpenScanDialog,
  onOpenImportDialog
}: AddNoteButtonGroupProps) => {
  return (
    <div className="inline-flex -space-x-px divide-x divide-primary-foreground/30 rounded-lg shadow-sm shadow-black/5 rtl:space-x-reverse">
      <AddNoteButton onOpenDialog={onOpenManualDialog} />
      <AddNoteDropdownMenu 
        onOpenManualDialog={onOpenManualDialog}
        onOpenScanDialog={onOpenScanDialog}
        onOpenImportDialog={onOpenImportDialog}
      />
    </div>
  );
};
