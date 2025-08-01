
import { useQuizFormState, UseQuizFormStateProps } from "./useQuizFormState";
import { useQuizQuestionOperations } from "./useQuizQuestionOperations";
import { useQuizFormSubmission, UseQuizFormSubmissionProps } from "./useQuizFormSubmission";

export interface UseQuizFormProps extends UseQuizFormStateProps, UseQuizFormSubmissionProps {
  sections?: any[];
}

export const useQuizForm = ({
  initialQuestions,
  initialTitle = '',
  initialDescription = '',
  initialSubjectId = '',
  sourceType = 'custom',
  sourceId,
  onSuccess,
  sections
}: UseQuizFormProps) => {
  const { form, filteredSections } = useQuizFormState({
    initialQuestions,
    initialTitle,
    initialDescription,
    initialSubjectId
  });
  
  const {
    addQuestion,
    removeQuestion,
    addOption,
    removeOption,
    handleCorrectChange
  } = useQuizQuestionOperations({ form });
  
  const { 
    onSubmit, 
    isSubmitting,
    showSuccessDialog,
    setShowSuccessDialog,
    handleCreateAnother,
    handleGoToQuizzes
  } = useQuizFormSubmission({
    sourceType,
    sourceId,
    onSuccess
  });
  
  return {
    form,
    filteredSections,
    onSubmit: (data: any) => onSubmit(data),
    addQuestion,
    removeQuestion,
    addOption,
    removeOption,
    handleCorrectChange,
    isSubmitting,
    showSuccessDialog,
    setShowSuccessDialog,
    handleCreateAnother,
    handleGoToQuizzes
  };
};
