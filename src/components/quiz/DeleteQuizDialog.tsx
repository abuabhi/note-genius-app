
import { useState } from "react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useDeleteQuiz } from "@/hooks/quiz/useDeleteQuiz";
import { toast } from "@/hooks/use-toast";
import { Quiz } from "@/types/quiz";

interface DeleteQuizDialogProps {
  isOpen: boolean;
  onClose: () => void;
  quiz: Quiz;
  onSuccess: () => void;
}

export const DeleteQuizDialog = ({ isOpen, onClose, quiz, onSuccess }: DeleteQuizDialogProps) => {
  const [isDeleting, setIsDeleting] = useState(false);
  const { mutateAsync: deleteQuiz } = useDeleteQuiz();

  const handleDelete = async () => {
    try {
      setIsDeleting(true);
      await deleteQuiz(quiz.id);
      toast({
        title: "Quiz deleted",
        description: "The quiz has been successfully deleted.",
      });
      onSuccess();
    } catch (error) {
      console.error("Error deleting quiz:", error);
      toast({
        title: "Error",
        description: "Failed to delete the quiz. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsDeleting(false);
      onClose();
    }
  };

  return (
    <AlertDialog open={isOpen} onOpenChange={onClose}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete Quiz</AlertDialogTitle>
          <AlertDialogDescription>
            Are you sure you want to delete "{quiz.title}"? This action cannot be undone.
            All quiz results and data will be permanently removed.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleDelete}
            disabled={isDeleting}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            {isDeleting ? "Deleting..." : "Delete Quiz"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};
