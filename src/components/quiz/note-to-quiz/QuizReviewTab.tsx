
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
  // Auto-detect subject from selected notes
  const getAutoSelectedSubject = () => {
    if (selectedNotes.length === 0) return undefined;
    
    // Get all subjects from selected notes
    const subjects = selectedNotes
      .map(note => note.subject_id)
      .filter(Boolean);
    
    if (subjects.length === 0) return undefined;
    
    // Find the most common subject
    const subjectCounts = subjects.reduce((acc, subjectId) => {
      acc[subjectId] = (acc[subjectId] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    
    const mostCommonSubject = Object.entries(subjectCounts)
      .sort(([,a], [,b]) => b - a)[0]?.[0];
    
    return mostCommonSubject;
  };

  const autoSelectedSubject = getAutoSelectedSubject();

  return (
    <div className="space-y-6">
      <div className="bg-white/60 backdrop-blur-sm rounded-lg border border-mint-100 p-6">
        <div className="mb-6">
          <h3 className="text-lg font-medium text-mint-800">Review and Create Quiz</h3>
          <p className="text-sm text-mint-600">
            Review the generated questions and create your quiz
            {autoSelectedSubject && (
              <span className="block mt-1 text-mint-500">
                Subject auto-selected based on your notes
              </span>
            )}
          </p>
        </div>
        
        <NoteToQuizForm 
          initialQuestions={generatedQuestions}
          initialTitle={selectedNotes.length === 1 
            ? `Quiz on ${selectedNotes[0].title}` 
            : `Quiz on ${selectedNotes.length} notes`
          }
          initialDescription={`Generated from ${selectedNotes.map(n => n.title).join(', ')}`}
          initialSubjectId={autoSelectedSubject}
          sourceType="note"
          sourceId={selectedNotes.length === 1 ? selectedNotes[0].id : undefined}
          onSuccess={onSuccess}
        />
      </div>
    </div>
  );
};
