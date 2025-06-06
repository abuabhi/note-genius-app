
import { CSVUploadResult } from "@/types/admin";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertCircle, CheckCircle, Users } from "lucide-react";

interface EnhancedImportResultsProps {
  results: CSVUploadResult | null;
}

export function EnhancedImportResults({ results }: EnhancedImportResultsProps) {
  if (!results) return null;

  return (
    <div className="mt-4 space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CheckCircle className="h-5 w-5 text-green-600" />
            Import Summary
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <div className="text-2xl font-bold text-blue-600">{results.totalRows}</div>
              <div className="text-sm text-muted-foreground">Total Rows</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-green-600">{results.successCount}</div>
              <div className="text-sm text-muted-foreground">Successful</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-red-600">{results.errorCount}</div>
              <div className="text-sm text-muted-foreground">Errors</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {results.userResults && results.userResults.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5 text-blue-600" />
              Per-User Results
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {results.userResults.map((userResult, index) => (
                <div key={index} className="border rounded-lg p-3">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium">{userResult.email}</span>
                    <div className="flex gap-4 text-sm">
                      <span className="text-green-600">✓ {userResult.successCount}</span>
                      <span className="text-red-600">✗ {userResult.errorCount}</span>
                    </div>
                  </div>
                  {userResult.errors.length > 0 && (
                    <div className="mt-2">
                      <div className="text-sm font-medium text-red-600 mb-1">Errors:</div>
                      <ul className="text-sm text-red-500 list-disc pl-4">
                        {userResult.errors.map((error, errorIndex) => (
                          <li key={errorIndex}>{error}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {results.errorCount > 0 && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            <div className="font-semibold">Import errors:</div>
            <ul className="list-disc pl-5 mt-1 max-h-40 overflow-y-auto">
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
