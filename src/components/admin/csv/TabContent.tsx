
import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";
import { QuizCSVImport } from "@/components/admin/csv/QuizCSVImport";
import { FileUploader } from "@/components/admin/csv/FileUploader";
import { ImportResults } from "@/components/admin/csv/ImportResults";

export const TabContent = () => {
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
        <GradesTabContent />
      </TabsContent>
      
      <TabsContent value="subjects" className="space-y-4 pt-4">
        <SubjectsTabContent />
      </TabsContent>
      
      <TabsContent value="sections" className="space-y-4 pt-4">
        <SectionsTabContent />
      </TabsContent>
      
      <TabsContent value="flashcards" className="space-y-4 pt-4">
        <FlashcardsTabContent />
      </TabsContent>
      
      <TabsContent value="quizzes" className="pt-4">
        <QuizCSVImport />
      </TabsContent>
    </Tabs>
  );
};

export const GradesTabContent = () => {
  const [gradesFile, setGradesFile] = useState<File | null>(null);
  const { importGrades, isImporting: isImportingGrades } = useGradesImport();
  const [gradesResults, setGradesResults] = useState<CSVUploadResult | null>(null);
  
  const handleGradesSubmit = async () => {
    if (gradesFile) {
      const results = await importGrades(gradesFile);
      setGradesResults(results);
    }
  };
  
  const getGradesTemplate = () => {
    return 'name,level,description\nGrade 1,1,First grade\nGrade 2,2,Second grade\nGrade 3,3,Third grade';
  };
  
  const downloadTemplate = () => {
    const templateContent = getGradesTemplate();
    const blob = new Blob([templateContent], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "grades_template.csv";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };
  
  return (
    <div className="space-y-4">
      <div>
        <p className="text-sm text-muted-foreground mb-2">
          Import grades from a CSV file. Download the template below for the correct format.
        </p>
        <Button variant="outline" size="sm" onClick={downloadTemplate}>
          <Download className="mr-2 h-4 w-4" />
          Download CSV Template
        </Button>
      </div>
      
      <FileUploader 
        selectedFile={gradesFile}
        onFileChange={setGradesFile} 
        acceptedTypes=".csv"
        description="Upload a CSV file with grade data"
        isImporting={isImportingGrades}
        templateType="grades"
        onImport={handleGradesSubmit}
        getTemplateCSV={() => getGradesTemplate()}
      />
      
      {gradesResults && <ImportResults results={gradesResults} />}
    </div>
  );
};

export const SubjectsTabContent = () => {
  const [subjectsFile, setSubjectsFile] = useState<File | null>(null);
  const { importSubjects, isImporting: isImportingSubjects } = useSubjectsImport();
  const [subjectsResults, setSubjectsResults] = useState<CSVUploadResult | null>(null);
  
  const handleSubjectsSubmit = async () => {
    if (subjectsFile) {
      const results = await importSubjects(subjectsFile);
      setSubjectsResults(results);
    }
  };
  
  const getSubjectsTemplate = () => {
    return 'name,grade_name\nMathematics,Grade 1\nScience,Grade 2\nHistory,Grade 3';
  };
  
  const downloadTemplate = () => {
    const templateContent = getSubjectsTemplate();
    const blob = new Blob([templateContent], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "subjects_template.csv";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };
  
  return (
    <div className="space-y-4">
      <div>
        <p className="text-sm text-muted-foreground mb-2">
          Import subjects from a CSV file. Download the template below for the correct format.
        </p>
        <Button variant="outline" size="sm" onClick={downloadTemplate}>
          <Download className="mr-2 h-4 w-4" />
          Download CSV Template
        </Button>
      </div>
      
      <FileUploader 
        selectedFile={subjectsFile}
        onFileChange={setSubjectsFile} 
        acceptedTypes=".csv"
        description="Upload a CSV file with subject data"
        isImporting={isImportingSubjects}
        templateType="subjects"
        onImport={handleSubjectsSubmit}
        getTemplateCSV={() => getSubjectsTemplate()}
      />
      
      {subjectsResults && <ImportResults results={subjectsResults} />}
    </div>
  );
};

export const SectionsTabContent = () => {
  const [sectionsFile, setSectionsFile] = useState<File | null>(null);
  const { importSections, isImporting: isImportingSections } = useSectionsImport();
  const [sectionsResults, setSectionsResults] = useState<CSVUploadResult | null>(null);
  
  const handleSectionsSubmit = async () => {
    if (sectionsFile) {
      const results = await importSections(sectionsFile);
      setSectionsResults(results);
    }
  };
  
  const getSectionsTemplate = () => {
    return 'name,subject_name,description\nAlgebra,Mathematics,Basic algebra\nGeometry,Mathematics,Basic geometry\nPhysics,Science,Introduction to physics';
  };
  
  const downloadTemplate = () => {
    const templateContent = getSectionsTemplate();
    const blob = new Blob([templateContent], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "sections_template.csv";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };
  
  return (
    <div className="space-y-4">
      <div>
        <p className="text-sm text-muted-foreground mb-2">
          Import sections from a CSV file. Download the template below for the correct format.
        </p>
        <Button variant="outline" size="sm" onClick={downloadTemplate}>
          <Download className="mr-2 h-4 w-4" />
          Download CSV Template
        </Button>
      </div>
      
      <FileUploader 
        selectedFile={sectionsFile}
        onFileChange={setSectionsFile} 
        acceptedTypes=".csv"
        description="Upload a CSV file with section data"
        isImporting={isImportingSections}
        templateType="sections"
        onImport={handleSectionsSubmit}
        getTemplateCSV={() => getSectionsTemplate()}
      />
      
      {sectionsResults && <ImportResults results={sectionsResults} />}
    </div>
  );
};

export const FlashcardsTabContent = () => {
  const [flashcardsFile, setFlashcardsFile] = useState<File | null>(null);
  const { importFlashcards, isImporting: isImportingFlashcards } = useFlashcardsImport();
  const [flashcardsResults, setFlashcardsResults] = useState<CSVUploadResult | null>(null);
  
  const handleFlashcardsSubmit = async () => {
    if (flashcardsFile) {
      const results = await importFlashcards(flashcardsFile);
      setFlashcardsResults(results);
    }
  };
  
  const getFlashcardsTemplate = () => {
    return 'set_name,set_description,subject,front_content,back_content,difficulty\nBasic Math,Elementary math flashcards,Mathematics,What is 2+2?,4,1\nBasic Math,Elementary math flashcards,Mathematics,What is 5-3?,2,1';
  };
  
  const downloadTemplate = () => {
    const templateContent = getFlashcardsTemplate();
    const blob = new Blob([templateContent], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "flashcards_template.csv";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };
  
  return (
    <div className="space-y-4">
      <div>
        <p className="text-sm text-muted-foreground mb-2">
          Import flashcards from a CSV file. Download the template below for the correct format.
        </p>
        <Button variant="outline" size="sm" onClick={downloadTemplate}>
          <Download className="mr-2 h-4 w-4" />
          Download CSV Template
        </Button>
      </div>
      
      <FileUploader 
        selectedFile={flashcardsFile}
        onFileChange={setFlashcardsFile} 
        acceptedTypes=".csv"
        description="Upload a CSV file with flashcard data"
        isImporting={isImportingFlashcards}
        templateType="flashcards"
        onImport={handleFlashcardsSubmit}
        getTemplateCSV={() => getFlashcardsTemplate()}
      />
      
      {flashcardsResults && <ImportResults results={flashcardsResults} />}
    </div>
  );
};

// Import these at the top after fixing the imports
import { CSVUploadResult } from "@/types/admin";
import { useGradesImport } from "@/hooks/csv/useGradesImport";
import { useSubjectsImport } from "@/hooks/csv/useSubjectsImport";
import { useSectionsImport } from "@/hooks/csv/useSectionsImport";
import { useFlashcardsImport } from "@/hooks/csv/useFlashcardsImport";
