
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useNotes } from "@/contexts/NoteContext";
import { Note } from "@/types/note";
import { CheckCircleIcon, RefreshCwIcon } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { NoteToQuizForm } from "./NoteToQuizForm";

export const NoteToQuiz = () => {
  const { notes } = useNotes();
  const [selectedNotes, setSelectedNotes] = useState<Note[]>([]);
  const [generatedQuestions, setGeneratedQuestions] = useState<{
    question: string;
    explanation?: string;
    options: { content: string; isCorrect: boolean }[];
  }[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [activeTab, setActiveTab] = useState("select");

  const toggleNoteSelection = (note: Note) => {
    if (selectedNotes.some((n) => n.id === note.id)) {
      setSelectedNotes(selectedNotes.filter((n) => n.id !== note.id));
    } else {
      setSelectedNotes([...selectedNotes, note]);
    }
  };

  const generateQuiz = async () => {
    if (selectedNotes.length === 0) {
      toast({
        title: "No notes selected",
        description: "Please select at least one note to generate a quiz.",
        variant: "destructive"
      });
      return;
    }

    setIsGenerating(true);
    
    try {
      // Combine note content for AI processing
      const noteContents = selectedNotes.map(note => {
        return `${note.title}\n${note.content || note.description}`;
      }).join('\n\n');
      
      const numberOfQuestions = Math.min(10, Math.max(3, Math.ceil(selectedNotes.length * 2)));
      
      // Call the generate-quiz edge function
      const { data, error } = await supabase.functions.invoke('generate-quiz', {
        body: { 
          content: noteContents,
          numberOfQuestions,
          difficulty: 'medium',
          topic: selectedNotes.length === 1 ? selectedNotes[0].title : 'Multiple Topics'
        }
      });
      
      if (error) {
        console.error('Error calling generate-quiz function:', error);
        throw new Error(error.message || 'Failed to generate quiz questions');
      }
      
      if (!data || !data.success || !data.quiz || !Array.isArray(data.quiz.questions)) {
        console.error('Invalid response from generate-quiz:', data);
        throw new Error('Invalid response from AI generator');
      }
      
      // Transform the quiz response to the expected format
      const questions = data.quiz.questions.map((item: any) => ({
        question: item.question || '',
        explanation: item.explanation || '',
        options: item.options ? item.options.map((opt: string, index: number) => ({
          content: opt,
          isCorrect: index === item.correctAnswer
        })) : []
      })).filter((q: any) => q.question && q.options.length >= 2);
      
      if (questions.length === 0) {
        throw new Error('Could not generate any valid questions from these notes');
      }
      
      console.log('Generated questions:', questions);
      setGeneratedQuestions(questions);
      setActiveTab("review");
      
      toast({
        title: "Quiz generated",
        description: `Generated ${questions.length} questions from your notes.`,
      });
    } catch (error) {
      console.error("Error generating quiz:", error);
      toast({
        title: "Generation failed",
        description: error instanceof Error ? error.message : "Failed to generate quiz questions",
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="container mx-auto p-6">
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="mb-6">
          <TabsTrigger value="select">Select Notes</TabsTrigger>
          <TabsTrigger value="review" disabled={generatedQuestions.length === 0}>
            Review & Create Quiz
          </TabsTrigger>
        </TabsList>

        <TabsContent value="select" className="space-y-6">
          <div className="bg-white rounded-lg border p-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-lg font-medium">
                  Select notes to generate questions from
                </h3>
                <p className="text-sm text-muted-foreground">
                  {selectedNotes.length} notes selected
                </p>
              </div>
              <Button
                onClick={generateQuiz}
                disabled={selectedNotes.length === 0 || isGenerating}
                size="lg"
              >
                {isGenerating ? (
                  <>
                    <RefreshCwIcon className="mr-2 h-4 w-4 animate-spin" />
                    Generating...
                  </>
                ) : (
                  "Generate Quiz"
                )}
              </Button>
            </div>

            <ScrollArea className="h-[500px] rounded-md border">
              <div className="p-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                {notes?.map((note) => (
                  <Card
                    key={note.id}
                    className={`cursor-pointer transition-colors hover:bg-gray-50 ${
                      selectedNotes.some((n) => n.id === note.id)
                        ? "border-primary bg-primary/5"
                        : ""
                    }`}
                    onClick={() => toggleNoteSelection(note)}
                  >
                    <CardHeader className="py-3 px-4 flex flex-row justify-between items-start space-y-0">
                      <CardTitle className="text-md font-medium line-clamp-1">
                        {note.title}
                      </CardTitle>
                      {selectedNotes.some((n) => n.id === note.id) && (
                        <CheckCircleIcon className="h-5 w-5 text-primary flex-shrink-0" />
                      )}
                    </CardHeader>
                    <CardContent className="py-2 px-4">
                      <p className="text-sm text-muted-foreground line-clamp-2">
                        {note.description}
                      </p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </ScrollArea>
          </div>
        </TabsContent>

        <TabsContent value="review" className="space-y-6">
          <div className="bg-white rounded-lg border p-6">
            <div className="mb-6">
              <h3 className="text-lg font-medium">Review and Create Quiz</h3>
              <p className="text-sm text-muted-foreground">
                Review the generated questions and create your quiz
              </p>
            </div>
            
            <NoteToQuizForm 
              initialQuestions={generatedQuestions}
              initialTitle={selectedNotes.length === 1 
                ? `Quiz on ${selectedNotes[0].title}` 
                : `Quiz on ${selectedNotes.length} notes`
              }
              initialDescription={`Generated from ${selectedNotes.map(n => n.title).join(', ')}`}
              sourceType="note"
              sourceId={selectedNotes.length === 1 ? selectedNotes[0].id : undefined}
              onSuccess={() => {
                // Reset the form state after successful creation
                setGeneratedQuestions([]);
                setSelectedNotes([]);
                setActiveTab("select");
              }}
            />
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};
