
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { AlertTriangle } from 'lucide-react';

interface ErrorDisplayProps {
  errorMessage: string | null;
  canRetry: boolean;
  onClearErrors: () => void;
}

export const ErrorDisplay = ({ errorMessage, canRetry, onClearErrors }: ErrorDisplayProps) => {
  if (!errorMessage) return null;

  return (
    <Alert className="m-3 border-red-200 bg-red-50">
      <AlertTriangle className="h-4 w-4 text-red-600" />
      <AlertDescription className="text-red-700">
        {errorMessage}
        {canRetry && (
          <Button
            variant="link"
            size="sm"
            onClick={onClearErrors}
            className="ml-2 p-0 h-auto text-red-700 underline"
          >
            Dismiss
          </Button>
        )}
      </AlertDescription>
    </Alert>
  );
};
