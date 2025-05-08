
import { useState } from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle, Download, Upload } from "lucide-react";
import { useCSVImport } from "@/hooks/useCSVImport";
import { CSVUploadResult } from "@/types/admin";

export function CSVImport() {
  const [activeTab, setActiveTab] = useState("grades");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const {
    isImporting,
    results,
    importGrades,
    importSubjects,
    importSections,
    importFlashcards,
    getTemplateCSV,
    resetResults
  } = useCSVImport();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setSelectedFile(e.target.files[0]);
      resetResults();
    }
  };

  const handleImport = async () => {
    if (!selectedFile) return;

    let result: CSVUploadResult | null = null;

    switch (activeTab) {
      case "grades":
        result = await importGrades(selectedFile);
        break;
      case "subjects":
        result = await importSubjects(selectedFile);
        break;
      case "sections":
        result = await importSections(selectedFile);
        break;
      case "flashcards":
        result = await importFlashcards(selectedFile);
        break;
    }

    console.log(`Import result for ${activeTab}:`, result);
  };

  const downloadTemplate = () => {
    const csvContent = getTemplateCSV(activeTab as any);
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement("a");
    
    // Create a URL for the blob
    const url = URL.createObjectURL(blob);
    link.href = url;
    link.setAttribute("download", `${activeTab}_template.csv`);
    document.body.appendChild(link);
    link.click();
    
    // Clean up
    setTimeout(() => {
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    }, 100);
  };

  const renderResults = () => {
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
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>CSV Import</CardTitle>
        <CardDescription>
          Import grades, subjects, sections, and flashcards from CSV files
        </CardDescription>
      </CardHeader>

      <Tabs value={activeTab} onValueChange={(value) => {
        setActiveTab(value);
        setSelectedFile(null);
        resetResults();
      }}>
        <CardContent>
          <TabsList className="grid grid-cols-4 mb-8">
            <TabsTrigger value="grades">Grades</TabsTrigger>
            <TabsTrigger value="subjects">Subjects</TabsTrigger>
            <TabsTrigger value="sections">Sections</TabsTrigger>
            <TabsTrigger value="flashcards">Flashcards</TabsTrigger>
          </TabsList>

          <TabsContent value="grades" className="space-y-4">
            <div className="text-sm">
              <p>Upload a CSV file with the following columns:</p>
              <ul className="list-disc list-inside mt-2">
                <li><strong>name</strong> (required): The grade name (e.g., "Grade 1")</li>
                <li><strong>level</strong> (required): A number representing the grade level</li>
                <li><strong>description</strong> (optional): A description of the grade</li>
              </ul>
            </div>
          </TabsContent>

          <TabsContent value="subjects" className="space-y-4">
            <div className="text-sm">
              <p>Upload a CSV file with the following columns:</p>
              <ul className="list-disc list-inside mt-2">
                <li><strong>name</strong> (required): The subject name (e.g., "Math")</li>
                <li><strong>grade_name</strong> (required): The name of the grade this subject belongs to</li>
                <li><strong>description</strong> (optional): A description of the subject</li>
              </ul>
            </div>
          </TabsContent>

          <TabsContent value="sections" className="space-y-4">
            <div className="text-sm">
              <p>Upload a CSV file with the following columns:</p>
              <ul className="list-disc list-inside mt-2">
                <li><strong>name</strong> (required): The section name (e.g., "Algebra")</li>
                <li><strong>subject_name</strong> (required): The name of the subject this section belongs to</li>
                <li><strong>grade_name</strong> (required): The name of the grade</li>
                <li><strong>description</strong> (optional): A description of the section</li>
              </ul>
            </div>
          </TabsContent>

          <TabsContent value="flashcards" className="space-y-4">
            <div className="text-sm">
              <p>Upload a CSV file with the following columns:</p>
              <ul className="list-disc list-inside mt-2">
                <li><strong>set_name</strong> (required): The name of the flashcard set</li>
                <li><strong>front_content</strong> (required): The content for the front of the flashcard</li>
                <li><strong>back_content</strong> (required): The content for the back of the flashcard</li>
                <li><strong>subject_name</strong> (required): The name of the subject</li>
                <li><strong>grade_name</strong> (required): The name of the grade</li>
                <li><strong>section_name</strong> (optional): The name of the section</li>
                <li><strong>difficulty</strong> (optional): A number from 1-5 representing difficulty</li>
              </ul>
              <p className="mt-2">Note: All flashcards with the same set_name will be grouped into a single set.</p>
            </div>
          </TabsContent>

          <div className="border rounded-md p-4 mt-6">
            <div className="flex flex-col space-y-4">
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="font-medium">Upload CSV File</h3>
                  <p className="text-sm text-muted-foreground">
                    Select a CSV file to import {activeTab}
                  </p>
                </div>
                <Button
                  variant="outline"
                  onClick={downloadTemplate}
                  className="flex items-center"
                >
                  <Download className="mr-2 h-4 w-4" />
                  Download Template
                </Button>
              </div>

              <div className="flex items-center gap-4">
                <input
                  type="file"
                  accept=".csv"
                  onChange={handleFileChange}
                  className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border file:border-gray-300 file:text-sm file:font-semibold file:bg-transparent file:text-gray-700 hover:file:bg-gray-100"
                />
                <Button 
                  onClick={handleImport} 
                  disabled={!selectedFile || isImporting}
                  className="flex items-center"
                >
                  <Upload className="mr-2 h-4 w-4" />
                  {isImporting ? "Importing..." : "Import"}
                </Button>
              </div>

              {selectedFile && (
                <div className="text-sm">
                  <p>Selected file: <span className="font-medium">{selectedFile.name}</span></p>
                  <p>Size: {Math.round(selectedFile.size / 1024)} KB</p>
                </div>
              )}
            </div>

            {renderResults()}
          </div>
        </CardContent>
      </Tabs>

      <CardFooter className="border-t px-6 py-4">
        <div className="text-sm text-muted-foreground">
          Note: Make sure your CSV files match the specified format to avoid import errors.
        </div>
      </CardFooter>
    </Card>
  );
}
