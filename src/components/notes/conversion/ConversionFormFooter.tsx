
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";

interface ConversionFormFooterProps {
  onCancel: () => void;
  isSubmitting: boolean;
  selectedCount: number;
}

export const ConversionFormFooter = ({
  onCancel,
  isSubmitting,
  selectedCount
}: ConversionFormFooterProps) => {
  return (
    <div className="flex justify-between">
      <Button type="button" variant="outline" onClick={onCancel} disabled={isSubmitting}>
        Cancel
      </Button>
      <Button type="submit" disabled={isSubmitting || selectedCount === 0}>
        {isSubmitting ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Converting...
          </>
        ) : (
          `Convert ${selectedCount} ${selectedCount === 1 ? "Note" : "Notes"}`
        )}
      </Button>
    </div>
  );
};
