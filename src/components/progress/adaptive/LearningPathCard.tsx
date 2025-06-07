
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Brain, BookOpen, Target, TrendingUp, ChevronRight, Sparkles, Clock, CheckCircle } from "lucide-react";
import { Link } from "react-router-dom";
import { useAdaptiveLearning } from "@/hooks/progress/adaptive";

export const LearningPathCard = () => {
  const { adaptiveLearningInsights, isLoading } = useAdaptiveLearning();

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="h-5 w-5 text-mint-600" />
            Adaptive Learning Paths
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-4">
            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            <div className="h-20 bg-gray-200 rounded"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  const { learningPaths } = adaptiveLearningInsights;

  // Show empty state if no learning paths
  if (learningPaths.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="h-5 w-5 text-mint-600" />
            Adaptive Learning Paths
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="text-center py-8">
            <div className="mb-4">
              <div className="w-16 h-16 bg-mint-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Brain className="h-8 w-8 text-mint-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Start Your Learning Journey</h3>
              <p className="text-gray-600 mb-6">
                Create flashcard sets to unlock personalized learning paths tailored to your progress.
              </p>
            </div>
            
            <div className="space-y-3">
              <Button asChild className="w-full bg-mint-600 hover:bg-mint-700">
                <Link to="/flashcards" className="flex items-center justify-center gap-2">
                  <BookOpen className="h-4 w-4" />
                  Create Flashcard Set
                  <ChevronRight className="h-4 w-4" />
                </Link>
              </Button>
            </div>
          </div>

          <div className="relative bg-gradient-to-r from-mint-50 to-green-50 border border-mint-200 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0">
                <Sparkles className="h-5 w-5 text-mint-600 animate-pulse" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-mint-900 mb-1">
                  AI-Powered Personalization
                </p>
                <p className="text-xs text-mint-700">
                  Learning paths will be generated based on your study patterns and performance.
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Show active learning paths
  const activePaths = learningPaths.filter(path => path.currentStep < path.totalSteps);
  const completedPaths = learningPaths.filter(path => path.currentStep >= path.totalSteps);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Brain className="h-5 w-5 text-mint-600" />
          Adaptive Learning Paths
        </CardTitle>
        <p className="text-sm text-gray-600">
          {activePaths.length} active • {completedPaths.length} completed
        </p>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Active Learning Paths */}
        <div className="space-y-4">
          {activePaths.slice(0, 2).map((path) => {
            const progressPercentage = (path.currentStep / path.totalSteps) * 100;
            const nextStep = path.adaptiveSteps[path.currentStep];
            
            return (
              <div key={path.id} className="border rounded-lg p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium text-gray-900">{path.subject}</h4>
                    <p className="text-sm text-gray-600">
                      Step {path.currentStep + 1} of {path.totalSteps}
                    </p>
                  </div>
                  <Badge variant="outline" className="text-xs capitalize">
                    {path.difficulty}
                  </Badge>
                </div>
                
                <Progress value={progressPercentage} className="h-2" />
                
                {nextStep && (
                  <div className="bg-blue-50 rounded-lg p-3">
                    <div className="flex items-center gap-2 mb-1">
                      <Target className="h-4 w-4 text-blue-600" />
                      <span className="text-sm font-medium text-blue-900">
                        Next: {nextStep.title}
                      </span>
                    </div>
                    <p className="text-xs text-blue-700 mb-2">
                      {nextStep.description}
                    </p>
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-blue-600 flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {nextStep.estimatedTimeMinutes} min
                      </span>
                      <Button size="sm" variant="outline" className="text-xs h-7">
                        Start Step
                      </Button>
                    </div>
                  </div>
                )}
                
                <div className="text-xs text-gray-500">
                  Est. completion: {path.estimatedCompletionDays} days
                </div>
              </div>
            );
          })}
        </div>

        {/* Completed Paths Summary */}
        {completedPaths.length > 0 && (
          <div className="border-t pt-4">
            <div className="flex items-center gap-2 mb-2">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <span className="text-sm font-medium text-green-900">
                Recently Completed
              </span>
            </div>
            <div className="space-y-2">
              {completedPaths.slice(0, 2).map((path) => (
                <div key={path.id} className="flex items-center justify-between text-sm">
                  <span className="text-gray-700">{path.subject}</span>
                  <Badge variant="secondary" className="text-xs">
                    Mastered
                  </Badge>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Show all paths button if more than 2 */}
        {learningPaths.length > 2 && (
          <Button variant="outline" className="w-full" size="sm">
            View All Paths ({learningPaths.length})
          </Button>
        )}

        {/* AI Enhancement Notice */}
        <div className="relative bg-gradient-to-r from-mint-50 to-green-50 border border-mint-200 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <div className="flex-shrink-0">
              <TrendingUp className="h-5 w-5 text-mint-600" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium text-mint-900 mb-1">
                Adaptive Intelligence
              </p>
              <p className="text-xs text-mint-700">
                Paths automatically adjust based on your performance and learning speed.
              </p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
