
import { useState, useEffect } from "react";
import { useFlashcards } from "@/contexts/FlashcardContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2, ChevronDown, ChevronUp, FileText } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { CreateFlashcardSetPayload } from "@/types/flashcard";
import { useUserSubjects } from "@/hooks/useUserSubjects";
import { useNotesQuery } from "@/hooks/queries/useNotesQueries";
import { NoteSelectionList } from "@/components/notes/conversion/NoteSelectionList";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Badge } from "@/components/ui/badge";
import { BulkNoteConversion } from "@/components/notes/conversion/BulkNoteConversion";
import { Note } from "@/types/note";

interface CreateFlashcardSetProps {
  onSuccess?: () => void;
  initialSubject?: string;
}

const CreateFlashcardSet = ({ onSuccess, initialSubject }: CreateFlashcardSetProps) => {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [subject, setSubject] = useState(initialSubject || "");
  const [topic, setTopic] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showNotesSection, setShowNotesSection] = useState(false);
  const [selectedNoteIds, setSelectedNoteIds] = useState<string[]>([]);
  const [showConversion, setShowConversion] = useState(false);
  
  const { createFlashcardSet } = useFlashcards();
  const { subjects: userSubjects, isLoading: subjectsLoading } = useUserSubjects();
  const { toast } = useToast();
  
  // Query notes based on selected subject
  const { data: notesData, isLoading: notesLoading } = useNotesQuery({
    subject: subject && subject !== "no_subject" ? subject : undefined,
    pageSize: 100
  });
  
  const availableNotes = notesData?.notes || [];
  const filteredNotes = subject && subject !== "no_subject" && subject !== "" 
    ? availableNotes.filter(note => note.subject === subject)
    : availableNotes;

  // Auto-expand notes section when subject is selected and notes are available
  useEffect(() => {
    if (subject && subject !== "no_subject" && filteredNotes.length > 0) {
      setShowNotesSection(true);
    }
  }, [subject, filteredNotes.length]);

  const handleToggleNote = (noteId: string) => {
    setSelectedNoteIds(prev => 
      prev.includes(noteId) 
        ? prev.filter(id => id !== noteId)
        : [...prev, noteId]
    );
  };

  const handleSelectAllNotes = () => {
    setSelectedNoteIds(prev => 
      prev.length === filteredNotes.length 
        ? [] 
        : filteredNotes.map(note => note.id)
    );
  };

  const getSelectedNotes = (): Note[] => {
    return filteredNotes.filter(note => selectedNoteIds.includes(note.id));
  };

  const handleCreateWithNotes = () => {
    if (selectedNoteIds.length === 0) {
      toast({
        title: "No notes selected",
        description: "Please select at least one note to create flashcards from.",
        variant: "destructive",
      });
      return;
    }
    setShowConversion(true);
  };

  const handleConversionSuccess = (flashcardSet: any) => {
    toast({
      title: "Success!",
      description: `Created flashcard set "${flashcardSet.name}" with ${flashcardSet.card_count || 0} flashcards.`,
    });
    
    // Reset form
    setName("");
    setDescription("");
    setSubject("");
    setTopic("");
    setSelectedNoteIds([]);
    setShowConversion(false);
    setShowNotesSection(false);
    
    if (onSuccess) {
      onSuccess();
    }
  };

  const handleConversionCancel = () => {
    setShowConversion(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!name.trim()) {
      toast({
        title: "Missing name",
        description: "Please provide a name for your flashcard set.",
        variant: "destructive",
      });
      return;
    }

    // If notes are selected, use conversion instead
    if (selectedNoteIds.length > 0) {
      handleCreateWithNotes();
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      const setData: CreateFlashcardSetPayload = {
        name: name.trim(),
        description: description.trim() || undefined,
        subject: subject === "no_subject" ? undefined : subject || undefined,
        topic: topic.trim() || undefined,
      };
      
      console.log("Creating flashcard set with data:", setData);
      
      const result = await createFlashcardSet(setData);
      
      if (result) {
        // Show guidance for empty set
        toast({
          title: "Flashcard set created!",
          description: "Your empty set has been created. You can now add flashcards to it.",
        });

        setName("");
        setDescription("");
        setSubject("");
        setTopic("");
        setSelectedNoteIds([]);
        setShowNotesSection(false);
        
        if (onSuccess) {
          onSuccess();
        }
      }
    } catch (error) {
      console.error("Error creating flashcard set:", error);
      toast({
        title: "Error",
        description: "Failed to create flashcard set. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Show conversion interface if user chose to create from notes
  if (showConversion && selectedNoteIds.length > 0) {
    return (
      <BulkNoteConversion
        notes={getSelectedNotes()}
        onSuccess={handleConversionSuccess}
        onCancel={handleConversionCancel}
      />
    );
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Create New Flashcard Set</CardTitle>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="name">Name</Label>
            <Input 
              id="name"
              placeholder="Enter a name for this set"
              value={name}
              onChange={(e) => setName(e.target.value)}
              disabled={isSubmitting}
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="description">Description (optional)</Label>
            <Textarea 
              id="description"
              placeholder="Enter a description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              disabled={isSubmitting}
            />
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="subject">Subject</Label>
              <Select value={subject} onValueChange={setSubject} disabled={isSubmitting || subjectsLoading}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a subject" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="no_subject">No subject</SelectItem>
                  {userSubjects.map((userSubject) => (
                    <SelectItem key={userSubject.id} value={userSubject.name}>
                      {userSubject.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {initialSubject && (
                <p className="text-xs text-blue-600">Pre-filled from note subject</p>
              )}
              {subject && subject !== "no_subject" && filteredNotes.length > 0 && (
                <p className="text-xs text-mint-600">
                  {filteredNotes.length} notes available in this subject
                </p>
              )}
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="topic">Topic (optional)</Label>
              <Input 
                id="topic"
                placeholder="E.g. Algebra"
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                disabled={isSubmitting}
              />
            </div>
          </div>

          {/* Notes Selection Section */}
          {subject && subject !== "no_subject" && filteredNotes.length > 0 && (
            <Collapsible open={showNotesSection} onOpenChange={setShowNotesSection}>
              <CollapsibleTrigger asChild>
                <Button 
                  variant="outline" 
                  className="w-full flex items-center justify-between"
                  type="button"
                >
                  <div className="flex items-center gap-2">
                    <FileText className="h-4 w-4" />
                    <span>Create from existing notes (optional)</span>
                    <Badge variant="secondary">{filteredNotes.length} available</Badge>
                  </div>
                  {showNotesSection ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                </Button>
              </CollapsibleTrigger>
              <CollapsibleContent className="space-y-4 mt-4">
                <div className="bg-mint-50 border border-mint-200 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <h4 className="font-medium text-mint-800">Generate flashcards from your notes</h4>
                      <p className="text-sm text-mint-600">
                        Select notes to automatically create flashcards using AI
                      </p>
                    </div>
                    {selectedNoteIds.length > 0 && (
                      <Badge className="bg-mint-600 text-white">
                        {selectedNoteIds.length} selected
                      </Badge>
                    )}
                  </div>
                  
                  {notesLoading ? (
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Loading notes...
                    </div>
                  ) : (
                    <NoteSelectionList
                      notes={filteredNotes}
                      selectedNotes={selectedNoteIds}
                      onToggleNote={handleToggleNote}
                      onSelectAll={handleSelectAllNotes}
                      disabled={isSubmitting}
                    />
                  )}
                </div>
              </CollapsibleContent>
            </Collapsible>
          )}

          {subject && subject !== "no_subject" && filteredNotes.length === 0 && !notesLoading && (
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 text-center">
              <FileText className="h-8 w-8 text-gray-400 mx-auto mb-2" />
              <p className="text-sm text-gray-600">No notes found for this subject</p>
              <p className="text-xs text-gray-500">Create some notes first to generate flashcards from them</p>
            </div>
          )}
        </CardContent>
        
        <CardFooter className="flex justify-between">
          <div className="text-sm text-muted-foreground">
            {selectedNoteIds.length > 0 ? (
              <span className="text-mint-600">
                Will create flashcards from {selectedNoteIds.length} selected notes
              </span>
            ) : (
              <span>
                Creating an empty set - you can add flashcards later
              </span>
            )}
          </div>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Creating...
              </>
            ) : selectedNoteIds.length > 0 ? (
              "Create Set with Flashcards"
            ) : (
              "Create Empty Set"
            )}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
};

export default CreateFlashcardSet;
