
import { NoteToQuizForm } from "../NoteToQuizForm";
import { analyzeSelectedNotesSubjects } from '@/utils/subjectAnalyzer';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Info } from 'lucide-react';

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
    
    // First try to get subjects by subject_id
    const subjectIds = selectedNotes
      .map(note => note.subject_id)
      .filter(Boolean);
    
    if (subjectIds.length > 0) {
      // Find the most common subject_id
      const subjectCounts = subjectIds.reduce((acc: Record<string, number>, subjectId: string) => {
        acc[subjectId] = (acc[subjectId] || 0) + 1;
        return acc;
      }, {});
      
      const mostCommonSubject = Object.entries(subjectCounts)
        .sort(([, a], [, b]) => (b as number) - (a as number))[0]?.[0];
      
      return mostCommonSubject;
    }
    
    // If no subject_id, try to use the primary subject from analysis
    if (subjectAnalysis.primarySubject?.subjectId) {
      return subjectAnalysis.primarySubject.subjectId;
    }
    
    return undefined;
  };

  const autoSelectedSubject = getAutoSelectedSubject();
  const subjectAnalysis = analyzeSelectedNotesSubjects(selectedNotes);

  return (
    <div className="space-y-6">
      {/* Enhanced Multi-Subject Information */}
      {subjectAnalysis.hasMultipleSubjects && (
        <Alert className="border-blue-200 bg-blue-50">
          <Info className="h-4 w-4 text-blue-600" />
          <AlertDescription className="text-blue-800">
            <div className="space-y-1">
              <p className="font-medium">Quiz Subject Selection</p>
              <p className="text-sm">
                Your quiz includes content from {subjectAnalysis.totalSubjects} subjects: {' '}
                {subjectAnalysis.distributions.map((dist, index) => (
                  <span key={dist.subjectId}>
                    <span className="font-medium">{dist.subjectName}</span> ({dist.count} note{dist.count > 1 ? 's' : ''})
                    {index < subjectAnalysis.distributions.length - 1 && ', '}
                  </span>
                ))}
              </p>
              <p className="text-sm">
                The quiz is categorized under <span className="font-medium">{subjectAnalysis.primarySubject?.subjectName}</span> 
                {subjectAnalysis.primarySubject && subjectAnalysis.primarySubject.count > 1 ? 
                  ' (most represented subject)' : 
                  ' (selected alphabetically due to tie)'
                }.
              </p>
            </div>
          </AlertDescription>
        </Alert>
      )}

      <div className="bg-white/60 backdrop-blur-sm rounded-lg border border-mint-100 p-6">
        <div className="mb-6">
          <h3 className="text-lg font-medium text-mint-800">Review and Create Quiz</h3>
          <p className="text-sm text-mint-600">
            Review the generated questions and create your quiz
            {autoSelectedSubject && !subjectAnalysis.hasMultipleSubjects && (
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
