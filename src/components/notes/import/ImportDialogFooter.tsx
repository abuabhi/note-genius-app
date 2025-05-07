
import React from "react";
import { SheetFooter } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";

interface ImportDialogFooterProps {
  onSave: () => Promise<void>;
  hasContent: boolean;
  isSaving: boolean;
}

export const ImportDialogFooter = ({
  onSave,
  hasContent,
  isSaving
}: ImportDialogFooterProps) => {
  return (
    <SheetFooter className="mt-4">
      <Button
        onClick={onSave}
        disabled={!hasContent || isSaving}
      >
        {isSaving ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Saving...
          </>
        ) : (
          <>Save as Note</>
        )}
      </Button>
    </SheetFooter>
  );
};
