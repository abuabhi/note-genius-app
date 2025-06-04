
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useNotes } from "@/contexts/NoteContext";
import { Note } from "@/types/note";
import { CheckCircleIcon, RefreshCwIcon, Settings } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { NoteToQuizForm } from "./NoteToQuizForm";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export const NoteToQuiz = () => {
  const { notes } = useNotes();
  const [selectedNotes, setSelectedNotes] = useState<Note[]>([]);
  const [numberOfQuestions, setNumberOfQuestions] = useState<number>(5);
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
      
      const topic = selectedNotes.length === 1 ? selectedNotes[0].title : 'Multiple Topics';
      
      console.log('Sending to generate-quiz function:', {
        content: noteContents.substring(0, 200) + '...',
        numberOfQuestions,
        topic
      });
      
      // Call the generate-quiz edge function
      const { data, error } = await supabase.functions.invoke('generate-quiz', {
        body: { 
          content: noteContents,
          numberOfQuestions,
          difficulty: 'medium',
          topic
        }
      });
      
      if (error) {
        console.error('Error calling generate-quiz function:', error);
        throw new Error(error.message || 'Failed to generate quiz questions');
      }
      
      console.log('Response from generate-quiz function:', data);
      
      if (!data || !data.success || !data.quiz || !Array.isArray(data.quiz.questions)) {
        console.error('Invalid response from generate-quiz:', data);
        throw new Error(data?.error || 'Invalid response from AI generator');
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
    <div className="p-6">
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="mb-6 bg-mint-50/50">
          <TabsTrigger value="select" className="data-[state=active]:bg-white data-[state=active]:text-mint-700">
            Select Notes
          </TabsTrigger>
          <TabsTrigger value="review" disabled={generatedQuestions.length === 0} className="data-[state=active]:bg-white data-[state=active]:text-mint-700">
            Review & Create Quiz
          </TabsTrigger>
        </TabsList>

        <TabsContent value="select" className="space-y-6">
          <div className="bg-white/60 backdrop-blur-sm rounded-lg border border-mint-100 p-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-lg font-medium text-mint-800">
                  Select notes to generate questions from
                </h3>
                <p className="text-sm text-mint-600">
                  {selectedNotes.length} notes selected
                </p>
              </div>
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <Settings className="h-4 w-4 text-mint-600" />
                  <Label htmlFor="questionCount" className="text-sm font-medium text-mint-700">
                    Questions:
                  </Label>
                  <Select value={numberOfQuestions.toString()} onValueChange={(value) => setNumberOfQuestions(parseInt(value))}>
                    <SelectTrigger className="w-20 h-8">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {[3, 4, 5, 6, 7, 8, 9, 10, 12, 15].map((num) => (
                        <SelectItem key={num} value={num.toString()}>
                          {num}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <Button
                  onClick={generateQuiz}
                  disabled={selectedNotes.length === 0 || isGenerating}
                  size="lg"
                  className="bg-mint-600 hover:bg-mint-700"
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
            </div>

            <ScrollArea className="h-[500px] rounded-md border border-mint-100">
              <div className="p-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                {notes?.map((note) => (
                  <Card
                    key={note.id}
                    className={`cursor-pointer transition-all duration-200 hover:shadow-md ${
                      selectedNotes.some((n) => n.id === note.id)
                        ? "border-mint-400 bg-mint-50/50 shadow-sm"
                        : "border-mint-100 hover:border-mint-200"
                    }`}
                    onClick={() => toggleNoteSelection(note)}
                  >
                    <CardHeader className="py-3 px-4 flex flex-row justify-between items-start space-y-0">
                      <CardTitle className="text-md font-medium line-clamp-1 text-mint-800">
                        {note.title}
                      </CardTitle>
                      {selectedNotes.some((n) => n.id === note.id) && (
                        <CheckCircleIcon className="h-5 w-5 text-mint-600 flex-shrink-0" />
                      )}
                    </CardHeader>
                    <CardContent className="py-2 px-4">
                      <p className="text-sm text-mint-600 line-clamp-2">
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
          <div className="bg-white/60 backdrop-blur-sm rounded-lg border border-mint-100 p-6">
            <div className="mb-6">
              <h3 className="text-lg font-medium text-mint-800">Review and Create Quiz</h3>
              <p className="text-sm text-mint-600">
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
