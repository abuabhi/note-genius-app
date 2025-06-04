
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { NoteSelectionTab } from "./note-to-quiz/NoteSelectionTab";
import { QuizReviewTab } from "./note-to-quiz/QuizReviewTab";
import { useNoteToQuizState } from "./note-to-quiz/useNoteToQuizState";

export const NoteToQuiz = () => {
  const {
    selectedNotes,
    numberOfQuestions,
    setNumberOfQuestions,
    generatedQuestions,
    isGenerating,
    activeTab,
    setActiveTab,
    toggleNoteSelection,
    generateQuiz,
    handleSuccess,
  } = useNoteToQuizState();

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
          <NoteSelectionTab
            selectedNotes={selectedNotes}
            onNoteToggle={toggleNoteSelection}
            onGenerateQuiz={generateQuiz}
            isGenerating={isGenerating}
            numberOfQuestions={numberOfQuestions}
            onNumberOfQuestionsChange={setNumberOfQuestions}
          />
        </TabsContent>

        <TabsContent value="review" className="space-y-6">
          <QuizReviewTab
            generatedQuestions={generatedQuestions}
            selectedNotes={selectedNotes}
            onSuccess={handleSuccess}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
};
