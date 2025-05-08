
import { useQuizFormState, UseQuizFormStateProps } from "./useQuizFormState";
import { useQuizQuestionOperations } from "./useQuizQuestionOperations";
import { useQuizFormSubmission, UseQuizFormSubmissionProps } from "./useQuizFormSubmission";

export interface UseQuizFormProps extends UseQuizFormStateProps, UseQuizFormSubmissionProps {}

export const useQuizForm = ({
  initialQuestions,
  initialTitle = '',
  initialDescription = '',
  initialCountryId = '',
  initialEducationSystem = '',
  sourceType = 'custom',
  sourceId,
  onSuccess,
  sections
}: UseQuizFormProps) => {
  const { form, filteredSections } = useQuizFormState({
    initialQuestions,
    initialTitle,
    initialDescription,
    initialCountryId,
    initialEducationSystem,
    sections
  });
  
  const {
    addQuestion,
    removeQuestion,
    addOption,
    removeOption,
    handleCorrectChange
  } = useQuizQuestionOperations({ form });
  
  const { onSubmit, isSubmitting } = useQuizFormSubmission({
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
    isSubmitting
  };
};
