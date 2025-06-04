
import { NoteToQuizForm } from "../NoteToQuizForm";

interface QuizReviewTabProps {
  generatedQuestions: {
    question: string;
    explanation?: string;
    options: { content: string; isCorrect: boolean }[];
  }[];
  selectedNotes: any[];
  onSuccess: () => void;
}

export const QuizReviewTab = ({
  generatedQuestions,
  selectedNotes,
  onSuccess,
}: QuizReviewTabProps) => {
  return (
    <div className="space-y-6">
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
          onSuccess={onSuccess}
        />
      </div>
    </div>
  );
};
