
import { CSVUploadResult } from "@/types/admin";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";

interface ImportResultsProps {
  results: CSVUploadResult | null;
}

export function ImportResults({ results }: ImportResultsProps) {
  if (!results) return null;

  return (
    <div className="mt-4">
      <h3 className="text-lg font-semibold">Import Results</h3>
      <div className="mt-2">
        <p>Total rows: {results.totalRows}</p>
        <p>Successfully imported: {results.successCount}</p>
        <p>Errors: {results.errorCount}</p>
      </div>

      {results.errorCount > 0 && (
        <Alert variant="destructive" className="mt-4">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            <div className="font-semibold">Import errors:</div>
            <ul className="list-disc pl-5 mt-1">
              {results.errors.map((error, index) => (
                <li key={index}>
                  {error.row > 0 ? `Row ${error.row}: ` : ""}{error.message}
                </li>
              ))}
            </ul>
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
}
