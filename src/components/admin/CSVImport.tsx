
import { useState } from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useCSVImport } from "@/hooks/useCSVImport";
import { CSVUploadResult } from "@/types/admin";
import { ImportResults } from "./csv/ImportResults";
import { FileUploader } from "./csv/FileUploader";
import { 
  GradesTabContent, 
  SubjectsTabContent, 
  SectionsTabContent, 
  FlashcardsTabContent 
} from "./csv/TabContent";

export function CSVImport() {
  const [activeTab, setActiveTab] = useState<'grades' | 'subjects' | 'sections' | 'flashcards'>("grades");
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

  const handleTabChange = (value: string) => {
    setActiveTab(value as 'grades' | 'subjects' | 'sections' | 'flashcards');
    setSelectedFile(null);
    resetResults();
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>CSV Import</CardTitle>
        <CardDescription>
          Import grades, subjects, sections, and flashcards from CSV files
        </CardDescription>
      </CardHeader>

      <Tabs value={activeTab} onValueChange={handleTabChange}>
        <CardContent>
          <TabsList className="grid grid-cols-4 mb-8">
            <TabsTrigger value="grades">Grades</TabsTrigger>
            <TabsTrigger value="subjects">Subjects</TabsTrigger>
            <TabsTrigger value="sections">Sections</TabsTrigger>
            <TabsTrigger value="flashcards">Flashcards</TabsTrigger>
          </TabsList>

          <GradesTabContent />
          <SubjectsTabContent />
          <SectionsTabContent />
          <FlashcardsTabContent />

          <FileUploader
            selectedFile={selectedFile}
            isImporting={isImporting}
            templateType={activeTab}
            onFileChange={setSelectedFile}
            onImport={handleImport}
            getTemplateCSV={getTemplateCSV}
          />

          <ImportResults results={results} />
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
