
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { QuizTakingBreadcrumb } from "@/components/quiz/QuizTakingBreadcrumb";
import Layout from "@/components/layout/Layout";
import { HelpCircle } from "lucide-react";

interface QuizErrorStateProps {
  onBackToQuizzes: () => void;
}

export const QuizErrorState = ({ onBackToQuizzes }: QuizErrorStateProps) => {
  return (
    <Layout>
      <div className="min-h-screen bg-gradient-to-b from-white via-mint-50/30 to-mint-50/10">
        <div className="container mx-auto p-6">
          <div className="mb-6">
            <QuizTakingBreadcrumb />
          </div>
          <Card className="bg-white/60 backdrop-blur-sm border-mint-100">
            <CardContent className="flex flex-col items-center justify-center min-h-[60vh] text-center">
              <HelpCircle className="h-16 w-16 text-mint-400 mb-4" />
              <h1 className="text-2xl font-bold text-mint-800 mb-2">Quiz not found</h1>
              <p className="text-mint-600 mb-6 max-w-md">
                The quiz you're looking for doesn't exist or you don't have access to it.
              </p>
              <Button onClick={onBackToQuizzes} variant="outline">
                Back to Quizzes
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </Layout>
  );
};
