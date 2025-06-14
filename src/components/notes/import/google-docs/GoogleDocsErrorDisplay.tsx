
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { AlertCircle, ChevronDown } from "lucide-react";

interface GoogleDocsErrorDisplayProps {
  error?: string | null;
  detailedError?: string | null;
  showErrorDetails: boolean;
  onToggleErrorDetails: (show: boolean) => void;
}

export const GoogleDocsErrorDisplay = ({ 
  error, 
  detailedError, 
  showErrorDetails, 
  onToggleErrorDetails 
}: GoogleDocsErrorDisplayProps) => {
  if (!error && !detailedError) return null;

  return (
    <div className="space-y-2">
      {error && (
        <Alert className="border-red-200 bg-red-50">
          <AlertCircle className="h-4 w-4 text-red-600" />
          <AlertDescription className="text-red-700">
            {error}
          </AlertDescription>
        </Alert>
      )}

      {detailedError && (
        <Alert className="border-orange-200 bg-orange-50">
          <AlertCircle className="h-4 w-4 text-orange-600" />
          <AlertDescription className="text-orange-700">
            <Collapsible open={showErrorDetails} onOpenChange={onToggleErrorDetails}>
              <CollapsibleTrigger className="flex items-center gap-2 font-medium hover:underline">
                Error Details
                <ChevronDown className={`h-3 w-3 transition-transform ${showErrorDetails ? 'rotate-180' : ''}`} />
              </CollapsibleTrigger>
              <CollapsibleContent className="mt-2 text-xs whitespace-pre-line">
                {detailedError}
              </CollapsibleContent>
            </Collapsible>
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
};
