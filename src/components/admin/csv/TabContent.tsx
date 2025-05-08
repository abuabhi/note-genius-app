
import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useGradesImport } from "@/hooks/csv/useGradesImport";
import { useSubjectsImport } from "@/hooks/csv/useSubjectsImport";
import { useSectionsImport } from "@/hooks/csv/useSectionsImport";
import { useFlashcardsImport } from "@/hooks/csv/useFlashcardsImport";
import { FileUploader } from "@/components/admin/csv/FileUploader";
import { Button } from "@/components/ui/button";
import { ImportResults } from "@/components/admin/csv/ImportResults";
import { Download } from "lucide-react";
import { QuizCSVImport } from "@/components/admin/csv/QuizCSVImport";

export const TabContent = () => {
  const [gradesFile, setGradesFile] = useState<File | null>(null);
  const [subjectsFile, setSubjectsFile] = useState<File | null>(null);
  const [sectionsFile, setSectionsFile] = useState<File | null>(null);
  const [flashcardsFile, setFlashcardsFile] = useState<File | null>(null);
  
  const {
    importGrades,
    getTemplateCSV: getGradesTemplate,
    isImporting: isImportingGrades,
    importResults: gradesResults,
  } = useGradesImport();
  
  const {
    importSubjects,
    getTemplateCSV: getSubjectsTemplate,
    isImporting: isImportingSubjects,
    importResults: subjectsResults,
  } = useSubjectsImport();
  
  const {
    importSections,
    getTemplateCSV: getSectionsTemplate,
    isImporting: isImportingSections,
    importResults: sectionsResults,
  } = useSectionsImport();
  
  const {
    importFlashcards,
    getTemplateCSV: getFlashcardsTemplate,
    isImporting: isImportingFlashcards,
    importResults: flashcardsResults,
  } = useFlashcardsImport();
  
  const handleGradesSubmit = () => {
    if (gradesFile) {
      importGrades(gradesFile);
    }
  };
  
  const handleSubjectsSubmit = () => {
    if (subjectsFile) {
      importSubjects(subjectsFile);
    }
  };
  
  const handleSectionsSubmit = () => {
    if (sectionsFile) {
      importSections(sectionsFile);
    }
  };
  
  const handleFlashcardsSubmit = () => {
    if (flashcardsFile) {
      importFlashcards(flashcardsFile);
    }
  };
  
  const downloadTemplate = (type: 'grades' | 'subjects' | 'sections' | 'flashcards') => {
    let templateContent = '';
    let filename = '';
    
    switch (type) {
      case 'grades':
        templateContent = getGradesTemplate();
        filename = 'grades_template.csv';
        break;
      case 'subjects':
        templateContent = getSubjectsTemplate();
        filename = 'subjects_template.csv';
        break;
      case 'sections':
        templateContent = getSectionsTemplate();
        filename = 'sections_template.csv';
        break;
      case 'flashcards':
        templateContent = getFlashcardsTemplate();
        filename = 'flashcards_template.csv';
        break;
    }
    
    const blob = new Blob([templateContent], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };
  
  return (
    <Tabs defaultValue="grades" className="w-full">
      <TabsList>
        <TabsTrigger value="grades">Grades</TabsTrigger>
        <TabsTrigger value="subjects">Subjects</TabsTrigger>
        <TabsTrigger value="sections">Sections</TabsTrigger>
        <TabsTrigger value="flashcards">Flashcards</TabsTrigger>
        <TabsTrigger value="quizzes">Quizzes</TabsTrigger>
      </TabsList>
      
      <TabsContent value="grades" className="space-y-4 pt-4">
        <div>
          <p className="text-sm text-muted-foreground mb-2">
            Import grades from a CSV file. Download the template below for the correct format.
          </p>
          <Button variant="outline" size="sm" onClick={() => downloadTemplate('grades')}>
            <Download className="mr-2 h-4 w-4" />
            Download CSV Template
          </Button>
        </div>
        
        <FileUploader 
          onFileSelect={setGradesFile} 
          acceptedTypes=".csv"
          description="Upload a CSV file with grade data"
        />
        
        {gradesResults && <ImportResults results={gradesResults} />}
        
        <div className="flex justify-end">
          <Button 
            onClick={handleGradesSubmit} 
            disabled={!gradesFile || isImportingGrades}
          >
            {isImportingGrades ? "Importing..." : "Import Grades"}
          </Button>
        </div>
      </TabsContent>
      
      <TabsContent value="subjects" className="space-y-4 pt-4">
        <div>
          <p className="text-sm text-muted-foreground mb-2">
            Import subjects from a CSV file. Download the template below for the correct format.
          </p>
          <Button variant="outline" size="sm" onClick={() => downloadTemplate('subjects')}>
            <Download className="mr-2 h-4 w-4" />
            Download CSV Template
          </Button>
        </div>
        
        <FileUploader 
          onFileSelect={setSubjectsFile} 
          acceptedTypes=".csv"
          description="Upload a CSV file with subject data"
        />
        
        {subjectsResults && <ImportResults results={subjectsResults} />}
        
        <div className="flex justify-end">
          <Button 
            onClick={handleSubjectsSubmit} 
            disabled={!subjectsFile || isImportingSubjects}
          >
            {isImportingSubjects ? "Importing..." : "Import Subjects"}
          </Button>
        </div>
      </TabsContent>
      
      <TabsContent value="sections" className="space-y-4 pt-4">
        <div>
          <p className="text-sm text-muted-foreground mb-2">
            Import sections from a CSV file. Download the template below for the correct format.
          </p>
          <Button variant="outline" size="sm" onClick={() => downloadTemplate('sections')}>
            <Download className="mr-2 h-4 w-4" />
            Download CSV Template
          </Button>
        </div>
        
        <FileUploader 
          onFileSelect={setSectionsFile} 
          acceptedTypes=".csv"
          description="Upload a CSV file with section data"
        />
        
        {sectionsResults && <ImportResults results={sectionsResults} />}
        
        <div className="flex justify-end">
          <Button 
            onClick={handleSectionsSubmit} 
            disabled={!sectionsFile || isImportingSections}
          >
            {isImportingSections ? "Importing..." : "Import Sections"}
          </Button>
        </div>
      </TabsContent>
      
      <TabsContent value="flashcards" className="space-y-4 pt-4">
        <div>
          <p className="text-sm text-muted-foreground mb-2">
            Import flashcards from a CSV file. Download the template below for the correct format.
          </p>
          <Button variant="outline" size="sm" onClick={() => downloadTemplate('flashcards')}>
            <Download className="mr-2 h-4 w-4" />
            Download CSV Template
          </Button>
        </div>
        
        <FileUploader 
          onFileSelect={setFlashcardsFile} 
          acceptedTypes=".csv"
          description="Upload a CSV file with flashcard data"
        />
        
        {flashcardsResults && <ImportResults results={flashcardsResults} />}
        
        <div className="flex justify-end">
          <Button 
            onClick={handleFlashcardsSubmit} 
            disabled={!flashcardsFile || isImportingFlashcards}
          >
            {isImportingFlashcards ? "Importing..." : "Import Flashcards"}
          </Button>
        </div>
      </TabsContent>
      
      <TabsContent value="quizzes" className="pt-4">
        <QuizCSVImport />
      </TabsContent>
    </Tabs>
  );
};
