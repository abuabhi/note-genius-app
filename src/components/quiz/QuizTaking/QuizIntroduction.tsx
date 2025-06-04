
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { QuizTakingBreadcrumb } from "@/components/quiz/QuizTakingBreadcrumb";
import Layout from "@/components/layout/Layout";
import { HelpCircle, Clock, Award } from "lucide-react";
import { Quiz } from "@/types/quiz";

interface QuizIntroductionProps {
  quiz: Quiz & { questions?: any[] };
  onStartQuiz: () => void;
}

export const QuizIntroduction = ({ quiz, onStartQuiz }: QuizIntroductionProps) => {
  return (
    <Layout>
      <div className="min-h-screen bg-gradient-to-b from-white via-mint-50/30 to-mint-50/10">
        <div className="container mx-auto p-6">
          <div className="mb-6">
            <QuizTakingBreadcrumb quizTitle={quiz.title} />
          </div>
          
          <div className="max-w-4xl mx-auto space-y-6">
            <Card className="bg-white/60 backdrop-blur-sm border-mint-100">
              <CardHeader className="pb-4">
                <CardTitle className="text-3xl text-mint-800">{quiz.title}</CardTitle>
                {quiz.description && (
                  <p className="text-mint-600 text-lg">{quiz.description}</p>
                )}
              </CardHeader>
            </Card>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card className="bg-white/60 backdrop-blur-sm border-mint-100">
                <CardContent className="p-6 text-center">
                  <HelpCircle className="h-8 w-8 text-mint-600 mx-auto mb-3" />
                  <h3 className="font-semibold text-mint-800 mb-2">Questions</h3>
                  <p className="text-2xl font-bold text-mint-700">{quiz.questions?.length || 0}</p>
                  <p className="text-sm text-mint-600">Multiple choice</p>
                </CardContent>
              </Card>

              <Card className="bg-white/60 backdrop-blur-sm border-mint-100">
                <CardContent className="p-6 text-center">
                  <Clock className="h-8 w-8 text-mint-600 mx-auto mb-3" />
                  <h3 className="font-semibold text-mint-800 mb-2">Duration</h3>
                  <p className="text-2xl font-bold text-mint-700">~{Math.ceil((quiz.questions?.length || 0) * 1.5)}</p>
                  <p className="text-sm text-mint-600">minutes</p>
                </CardContent>
              </Card>

              <Card className="bg-white/60 backdrop-blur-sm border-mint-100">
                <CardContent className="p-6 text-center">
                  <Award className="h-8 w-8 text-mint-600 mx-auto mb-3" />
                  <h3 className="font-semibold text-mint-800 mb-2">Format</h3>
                  <p className="text-2xl font-bold text-mint-700">Quiz</p>
                  <p className="text-sm text-mint-600">Formal assessment</p>
                </CardContent>
              </Card>
            </div>

            <Card className="bg-white/60 backdrop-blur-sm border-mint-100">
              <CardContent className="flex flex-col items-center justify-center py-12">
                <div className="text-center mb-8">
                  <h2 className="text-2xl font-bold text-mint-800 mb-2">Ready to Start?</h2>
                  <p className="text-mint-600 max-w-md">
                    Take your time and read each question carefully. You'll see the correct answers after each question.
                  </p>
                </div>
                
                <Button size="lg" onClick={onStartQuiz} className="bg-mint-600 hover:bg-mint-700 text-white px-8 py-3">
                  Start Quiz
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </Layout>
  );
};
