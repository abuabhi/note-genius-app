
import { useDeleteQuiz } from "@/hooks/quiz/useDeleteQuiz";
import { Quiz } from "@/types/quiz";
import { UnifiedDeleteDialog } from "@/components/ui/unified/UnifiedDeleteDialog";

interface DeleteQuizDialogProps {
  isOpen: boolean;
  onClose: () => void;
  quiz: Quiz;
  onSuccess: () => void;
}

export const DeleteQuizDialog = ({ isOpen, onClose, quiz, onSuccess }: DeleteQuizDialogProps) => {
  const { mutateAsync: deleteQuiz } = useDeleteQuiz();

  const handleDelete = async () => {
    await deleteQuiz(quiz.id);
    onSuccess();
  };

  return (
    <UnifiedDeleteDialog
      isOpen={isOpen}
      onClose={onClose}
      onConfirm={handleDelete}
      title="Delete Quiz"
      itemName={quiz.title}
      itemType="quiz"
      description={`Are you sure you want to delete "${quiz.title}"? This action cannot be undone. All quiz results and data will be permanently removed.`}
    />
  );
};
