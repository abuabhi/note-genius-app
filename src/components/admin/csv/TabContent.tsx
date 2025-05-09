
import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { FlashcardsCSVImport } from "./FlashcardsCSVImport";
import { useCSVImport } from "@/hooks/useCSVImport";
import { FileUploader } from "./FileUploader";
import { ImportResults } from "./ImportResults";

export function TabContent() {
  const [gradesFile, setGradesFile] = useState<File | null>(null);
  const [subjectsFile, setSubjectsFile] = useState<File | null>(null);
  const [sectionsFile, setSectionsFile] = useState<File | null>(null);
  
  const { 
    importGrades, 
    importSubjects, 
    importSections, 
    isImporting, 
    results, 
    getTemplateCSV 
  } = useCSVImport();

  const handleImportGrades = async () => {
    if (gradesFile) {
      await importGrades(gradesFile);
    }
  };

  const handleImportSubjects = async () => {
    if (subjectsFile) {
      await importSubjects(subjectsFile);
    }
  };

  const handleImportSections = async () => {
    if (sectionsFile) {
      await importSections(sectionsFile);
    }
  };

  return (
    <Tabs defaultValue="grades">
      <TabsList className="grid grid-cols-4 mb-4">
        <TabsTrigger value="grades">Grades</TabsTrigger>
        <TabsTrigger value="subjects">Subjects</TabsTrigger>
        <TabsTrigger value="sections">Sections</TabsTrigger>
        <TabsTrigger value="flashcards">Flashcards</TabsTrigger>
      </TabsList>

      <TabsContent value="grades">
        <FileUploader
          selectedFile={gradesFile}
          onFileChange={setGradesFile}
          onImport={handleImportGrades}
          isImporting={isImporting}
          templateType="grades"
          getTemplateCSV={getTemplateCSV}
          acceptedTypes=".csv"
          description="Upload a CSV file with grade data"
        />
        {results && <ImportResults results={results} />}
      </TabsContent>

      <TabsContent value="subjects">
        <FileUploader
          selectedFile={subjectsFile}
          onFileChange={setSubjectsFile}
          onImport={handleImportSubjects}
          isImporting={isImporting}
          templateType="subjects"
          getTemplateCSV={getTemplateCSV}
          acceptedTypes=".csv"
          description="Upload a CSV file with subject data"
        />
        {results && <ImportResults results={results} />}
      </TabsContent>

      <TabsContent value="sections">
        <FileUploader
          selectedFile={sectionsFile}
          onFileChange={setSectionsFile}
          onImport={handleImportSections}
          isImporting={isImporting}
          templateType="sections"
          getTemplateCSV={getTemplateCSV}
          acceptedTypes=".csv"
          description="Upload a CSV file with section data"
        />
        {results && <ImportResults results={results} />}
      </TabsContent>

      <TabsContent value="flashcards">
        <FlashcardsCSVImport />
      </TabsContent>
    </Tabs>
  );
}
