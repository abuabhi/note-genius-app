
import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { FileUploader } from "@/components/admin/csv/FileUploader";
import { ImportResults } from "@/components/admin/csv/ImportResults";
import { useQuizImport } from "@/hooks/csv/useQuizImport";
import { Download } from "lucide-react";

export const QuizCSVImport = () => {
  const [file, setFile] = useState<File | null>(null);
  const { importQuizzes, getQuizTemplate, isImporting, importResults } = useQuizImport();

  const handleFileSelect = (file: File | null) => {
    setFile(file);
  };

  const handleSubmit = async () => {
    if (file) {
      await importQuizzes(file);
    }
  };

  const downloadTemplate = () => {
    const templateContent = getQuizTemplate();
    const blob = new Blob([templateContent], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "quiz_template.csv";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Import Quizzes</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div>
            <p className="text-sm text-muted-foreground mb-2">
              Import quizzes from a CSV file. Download the template below for the correct format.
            </p>
            <Button variant="outline" size="sm" onClick={downloadTemplate}>
              <Download className="mr-2 h-4 w-4" />
              Download CSV Template
            </Button>
          </div>
          
          <FileUploader 
            onFileSelect={handleFileSelect} 
            acceptedTypes=".csv"
            description="Upload a CSV file with quiz data"
          />
          
          {importResults && <ImportResults results={importResults} />}
        </div>
      </CardContent>
      <CardFooter>
        <Button 
          onClick={handleSubmit} 
          disabled={!file || isImporting}
          className="ml-auto"
        >
          {isImporting ? "Importing..." : "Import Quizzes"}
        </Button>
      </CardFooter>
    </Card>
  );
};
