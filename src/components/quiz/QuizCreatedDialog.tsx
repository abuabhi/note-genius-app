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

interface QuizCreatedDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreateAnother: () => void;
  onGoToQuizzes: () => void;
}

export const QuizCreatedDialog = ({
  open,
  onOpenChange,
  onCreateAnother,
  onGoToQuizzes,
}: QuizCreatedDialogProps) => {
  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Quiz Created Successfully! 🎉</AlertDialogTitle>
          <AlertDialogDescription>
            Your quiz has been created and is ready to use. Would you like to create another quiz or go to the quizzes page?
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel onClick={onCreateAnother}>
            Create Another Quiz
          </AlertDialogCancel>
          <AlertDialogAction onClick={onGoToQuizzes}>
            Go to Quizzes
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};