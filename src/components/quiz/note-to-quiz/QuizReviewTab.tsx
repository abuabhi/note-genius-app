
import { NoteToQuizForm } from "../NoteToQuizForm";
import { analyzeSelectedNotesSubjects } from '@/utils/subjectAnalyzer';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Info, AlertTriangle, Loader2 } from 'lucide-react';
import { useUserSubjects } from '@/hooks/useUserSubjects';
import { useEffect, useState } from 'react';
import { ensureUserSubjectExists } from '@/utils/subjectHelpers';
import { useAuth } from '@/contexts/auth';

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
  const subjectAnalysis = analyzeSelectedNotesSubjects(selectedNotes);
  const { subjects: userSubjects, addSubject } = useUserSubjects();
  const { user } = useAuth();
  const [autoSelectedSubject, setAutoSelectedSubject] = useState<string>('');
  const [isProcessingSubject, setIsProcessingSubject] = useState<boolean>(false);
  const [subjectProcessError, setSubjectProcessError] = useState<string>('');

  // Auto-detect and create subject from selected notes
  const processAutoSelectedSubject = async () => {
    console.log("🔍 QUIZ_REVIEW: Getting auto-selected subject...");
    console.log("📝 QUIZ_REVIEW: Selected notes:", selectedNotes.map(n => ({ id: n.id, title: n.title, subject: n.subject })));
    console.log("👥 QUIZ_REVIEW: User subjects:", userSubjects);
    
    setIsProcessingSubject(true);
    setSubjectProcessError('');
    
    try {
      if (selectedNotes.length === 0) {
        setAutoSelectedSubject('');
        return;
      }
      
      const firstNote = selectedNotes[0];
      console.log("📋 QUIZ_REVIEW: Processing first note:", { id: firstNote.id, title: firstNote.title, subject: firstNote.subject, subject_id: firstNote.subject_id });
      
      // First try to get subjects by subject_id if it exists in user subjects
      if (firstNote.subject_id && userSubjects) {
        const matchingSubject = userSubjects.find(subject => subject.id === firstNote.subject_id);
        if (matchingSubject) {
          console.log("✅ QUIZ_REVIEW: Found matching subject by ID:", matchingSubject);
          setAutoSelectedSubject(firstNote.subject_id);
          return;
        }
      }
      
      // If no subject_id or not found, try to match by name
      if (firstNote.subject && userSubjects) {
        const matchingSubject = userSubjects.find(
          subject => subject.name.toLowerCase() === firstNote.subject?.toLowerCase()
        );
        if (matchingSubject) {
          console.log("✅ QUIZ_REVIEW: Found matching subject by name:", matchingSubject);
          setAutoSelectedSubject(matchingSubject.id);
          return;
        }
        
        // Subject exists in note but not in user subjects - auto-create it
        console.log("🔄 QUIZ_REVIEW: Creating missing subject:", firstNote.subject);
        if (user?.id) {
          try {
            const subjectId = await ensureUserSubjectExists(firstNote.subject, user.id);
            if (subjectId) {
              console.log("✅ QUIZ_REVIEW: Created subject with ID:", subjectId);
              setAutoSelectedSubject(subjectId);
              // Refresh user subjects to include the new one
              const success = await addSubject(firstNote.subject);
              if (!success) {
                console.warn("⚠️ QUIZ_REVIEW: Failed to refresh user subjects, but subject was created");
              }
              return;
            } else {
              throw new Error('Subject creation returned null ID');
            }
          } catch (error) {
            console.error("❌ QUIZ_REVIEW: Failed to create subject:", error);
            setSubjectProcessError(`Failed to create subject "${firstNote.subject}". Please select a subject manually.`);
          }
        } else {
          console.error("❌ QUIZ_REVIEW: No user ID available for subject creation");
          setSubjectProcessError('Authentication required to create subjects');
        }
      }
      
      console.log("❌ QUIZ_REVIEW: No auto-selected subject found");
      setAutoSelectedSubject('');
    } finally {
      setIsProcessingSubject(false);
    }
  };

  // Process subject selection when component mounts or dependencies change
  useEffect(() => {
    if (selectedNotes.length > 0 && userSubjects) {
      processAutoSelectedSubject();
    }
  }, [selectedNotes, userSubjects, user?.id]);

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

      {/* Subject Processing Status */}
      {isProcessingSubject && (
        <Alert className="border-blue-200 bg-blue-50">
          <Loader2 className="h-4 w-4 text-blue-600 animate-spin" />
          <AlertDescription className="text-blue-800">
            Processing subject information from your notes...
          </AlertDescription>
        </Alert>
      )}

      {/* Subject Processing Error */}
      {subjectProcessError && (
        <Alert className="border-red-200 bg-red-50">
          <AlertTriangle className="h-4 w-4 text-red-600" />
          <AlertDescription className="text-red-800">
            <p className="font-medium">Subject Processing Error</p>
            <p className="text-sm mt-1">{subjectProcessError}</p>
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
        
        {/* Only show form when not processing subjects */}
        {!isProcessingSubject && (
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
        )}
      </div>
    </div>
  );
};
