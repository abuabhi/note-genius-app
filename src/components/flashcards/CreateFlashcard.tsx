
import { useState } from "react";
import { useFlashcards } from "@/contexts/FlashcardContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { FileUploader } from "@/components/admin/csv/FileUploader";
import { ImportResults } from "@/components/admin/csv/ImportResults";
import { Loader2, Info, Download } from "lucide-react";
import { toast } from "sonner";
import { FlashcardDifficulty } from "@/types/flashcard";
import { useFlashcardsImport } from "@/hooks/csv/useFlashcardsImport";
import { getTemplateCSV } from "@/utils/csvUtils";

interface CreateFlashcardProps {
  setId?: string;
  onSuccess?: () => void;
}

const CreateFlashcard = ({ setId, onSuccess }: CreateFlashcardProps) => {
  const [frontContent, setFrontContent] = useState("");
  const [backContent, setBackContent] = useState("");
  const [difficulty, setDifficulty] = useState<FlashcardDifficulty>(3);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [csvFile, setCsvFile] = useState<File | null>(null);
  
  const { createFlashcard } = useFlashcards();
  const { importFlashcards, isImporting, importResults } = useFlashcardsImport();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!frontContent.trim() || !backContent.trim()) {
      toast.error("Please fill in both sides of the flashcard.");
      return;
    }

    if (!setId) {
      toast.error("No flashcard set specified.");
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      const cardData = {
        front_content: frontContent.trim(),
        back_content: backContent.trim(),
        difficulty,
        set_id: setId
      };
      
      console.log("Creating flashcard with data:", cardData);
      
      const result = await createFlashcard(cardData);
      
      if (result) {
        setFrontContent("");
        setBackContent("");
        setDifficulty(3);
        
        toast.success("Flashcard created successfully!");
        
        if (onSuccess) {
          onSuccess();
        }
      }
    } catch (error) {
      console.error("Error creating flashcard:", error);
      toast.error("Failed to create flashcard. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCSVImport = async () => {
    if (!csvFile) {
      toast.error("Please select a CSV file to import.");
      return;
    }
    
    try {
      await importFlashcards(csvFile);
      setCsvFile(null);
      if (onSuccess) {
        onSuccess();
      }
    } catch (error) {
      console.error("Error importing CSV:", error);
      toast.error("Failed to import flashcards from CSV.");
    }
  };

  const handleDownloadTemplate = () => {
    const templateData = getTemplateCSV('flashcards');
    const blob = new Blob([templateData], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', 'flashcards_template.csv');
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      {/* User Tip */}
      <Alert>
        <Info className="h-4 w-4" />
        <AlertTitle>Pro Tip</AlertTitle>
        <AlertDescription>
          For the best learning experience, create flashcards from your existing notes. This helps reinforce what you've already studied and creates a more comprehensive learning workflow.
        </AlertDescription>
      </Alert>

      <Card className="w-full">
        <CardHeader>
          <CardTitle>Add Flashcards</CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="manual" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="manual">Manual Creation</TabsTrigger>
              <TabsTrigger value="csv">CSV Import</TabsTrigger>
            </TabsList>
            
            <TabsContent value="manual" className="mt-6">
              <form onSubmit={handleSubmit}>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="front">Front</Label>
                    <Textarea 
                      id="front"
                      placeholder="Enter the question or prompt"
                      value={frontContent}
                      onChange={(e) => setFrontContent(e.target.value)}
                      className="min-h-[100px]"
                      disabled={isSubmitting}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="back">Back</Label>
                    <Textarea 
                      id="back"
                      placeholder="Enter the answer or explanation"
                      value={backContent}
                      onChange={(e) => setBackContent(e.target.value)}
                      className="min-h-[100px]"
                      disabled={isSubmitting}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="difficulty">Difficulty</Label>
                    <Select 
                      value={difficulty.toString()} 
                      onValueChange={(value) => setDifficulty(parseInt(value) as FlashcardDifficulty)}
                      disabled={isSubmitting}
                    >
                      <SelectTrigger id="difficulty">
                        <SelectValue placeholder="Select difficulty" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="1">Very Easy (1)</SelectItem>
                        <SelectItem value="2">Easy (2)</SelectItem>
                        <SelectItem value="3">Medium (3)</SelectItem>
                        <SelectItem value="4">Hard (4)</SelectItem>
                        <SelectItem value="5">Very Hard (5)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="flex justify-end pt-4">
                    <Button type="submit" disabled={isSubmitting}>
                      {isSubmitting ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Creating...
                        </>
                      ) : (
                        "Create Flashcard"
                      )}
                    </Button>
                  </div>
                </div>
              </form>
            </TabsContent>
            
            <TabsContent value="csv" className="mt-6">
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <div>
                    <h3 className="text-lg font-medium">Import from CSV</h3>
                    <p className="text-sm text-muted-foreground">
                      Upload a CSV file to create multiple flashcards at once
                    </p>
                  </div>
                  <Button variant="outline" onClick={handleDownloadTemplate}>
                    <Download className="h-4 w-4 mr-2" />
                    Download Template
                  </Button>
                </div>
                
                <FileUploader
                  selectedFile={csvFile}
                  onFileChange={setCsvFile}
                  acceptedTypes=".csv"
                  description="Upload a CSV file with flashcards data"
                  templateType="flashcards"
                  isImporting={isImporting}
                />
                
                {csvFile && (
                  <div className="flex justify-end">
                    <Button onClick={handleCSVImport} disabled={isImporting}>
                      {isImporting ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Importing...
                        </>
                      ) : (
                        "Import Flashcards"
                      )}
                    </Button>
                  </div>
                )}
                
                {importResults && <ImportResults results={importResults} />}
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

export default CreateFlashcard;
