
import { Card, CardContent } from "@/components/ui/card";
import { QuizTakingBreadcrumb } from "@/components/quiz/QuizTakingBreadcrumb";
import Layout from "@/components/layout/Layout";

export const QuizLoadingState = () => {
  return (
    <Layout>
      <div className="min-h-screen bg-gradient-to-b from-white via-mint-50/30 to-mint-50/10">
        <div className="container mx-auto p-6">
          <div className="mb-6">
            <QuizTakingBreadcrumb />
          </div>
          <Card className="bg-white/60 backdrop-blur-sm border-mint-100">
            <CardContent className="flex items-center justify-center min-h-[60vh]">
              <div className="text-center">
                <div className="animate-pulse">
                  <div className="h-8 w-8 bg-mint-200 rounded-full mx-auto mb-4"></div>
                  <div className="h-4 w-32 bg-mint-200 rounded mx-auto"></div>
                </div>
                <p className="text-mint-600 mt-4">Loading quiz...</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </Layout>
  );
};
