
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useNotes } from "@/contexts/NoteContext";
import { Note } from "@/types/note";
import { CheckCircleIcon } from "lucide-react";
import { QuizGenerationControls } from "./QuizGenerationControls";

interface NoteSelectionTabProps {
  selectedNotes: Note[];
  onNoteToggle: (note: Note) => void;
  onGenerateQuiz: () => void;
  isGenerating: boolean;
  numberOfQuestions: number;
  onNumberOfQuestionsChange: (count: number) => void;
}

export const NoteSelectionTab = ({
  selectedNotes,
  onNoteToggle,
  onGenerateQuiz,
  isGenerating,
  numberOfQuestions,
  onNumberOfQuestionsChange,
}: NoteSelectionTabProps) => {
  const { notes } = useNotes();

  return (
    <div className="space-y-6">
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
          <QuizGenerationControls
            selectedNotesCount={selectedNotes.length}
            onGenerateQuiz={onGenerateQuiz}
            isGenerating={isGenerating}
            numberOfQuestions={numberOfQuestions}
            onNumberOfQuestionsChange={onNumberOfQuestionsChange}
          />
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
                onClick={() => onNoteToggle(note)}
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
    </div>
  );
};
