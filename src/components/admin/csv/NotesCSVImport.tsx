
import { useState } from "react";
import { useCSVImport } from "@/hooks/useCSVImport";
import { FileUploader } from "./FileUploader";
import { EnhancedImportResults } from "./EnhancedImportResults";

export function NotesCSVImport() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const { importNotes, isImporting, results, getTemplateCSV } = useCSVImport();

  const handleImport = async () => {
    if (selectedFile) {
      await importNotes(selectedFile);
    }
  };

  return (
    <div className="space-y-4">
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h4 className="font-medium text-blue-900 mb-2">Notes CSV Import</h4>
        <p className="text-sm text-blue-700 mb-3">
          Import notes in bulk for multiple users. The CSV must include a user_email column to specify which user each note belongs to.
        </p>
        <div className="text-sm text-blue-600">
          <strong>Required columns:</strong> title, description, user_email<br />
          <strong>Optional columns:</strong> content, subject, category, source_type, tags (comma-separated)
        </div>
      </div>

      <FileUploader
        selectedFile={selectedFile}
        onFileChange={setSelectedFile}
        onImport={handleImport}
        isImporting={isImporting}
        templateType="notes"
        getTemplateCSV={getTemplateCSV}
        acceptedTypes=".csv"
        description="Upload a CSV file with notes data for multiple users"
      />

      <EnhancedImportResults results={results} />
    </div>
  );
}
