
import { ProgressCard } from "../shared/ProgressCard";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Brain, CheckCircle, Clock, ArrowRight } from "lucide-react";
import { useAdaptiveLearning } from "@/hooks/progress/adaptive";

export const LearningPathCard = () => {
  const { adaptiveLearningInsights, isLoading } = useAdaptiveLearning();

  if (isLoading) {
    return (
      <ProgressCard title="Adaptive Learning Paths" icon={Brain}>
        <div className="h-64 animate-pulse bg-gray-200 rounded"></div>
      </ProgressCard>
    );
  }

  const { learningPaths } = adaptiveLearningInsights;

  if (learningPaths.length === 0) {
    return (
      <ProgressCard title="Adaptive Learning Paths" icon={Brain}>
        <div className="text-center py-8">
          <Brain className="h-12 w-12 mx-auto mb-4 text-mint-400" />
          <h3 className="text-lg font-medium text-gray-800 mb-2">Start Your Learning Journey</h3>
          <p className="text-gray-600 mb-4">
            Begin studying to unlock personalized learning paths tailored to your progress.
          </p>
          <Button className="bg-mint-500 hover:bg-mint-600 text-white">
            Start Learning
          </Button>
        </div>
      </ProgressCard>
    );
  }

  const currentPath = learningPaths[0]; // Show the first path

  return (
    <ProgressCard title="Adaptive Learning Paths" icon={Brain}>
      <div className="space-y-6">
        {/* Current Path Overview */}
        <div className="p-4 bg-gradient-to-r from-mint-50 to-blue-50 rounded-lg border border-mint-200">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold text-mint-800">{currentPath.subject}</h3>
            <Badge className="bg-mint-100 text-mint-800 border-mint-200">
              {currentPath.difficulty}
            </Badge>
          </div>
          
          <div className="space-y-3">
            <div className="flex items-center justify-between text-sm">
              <span className="text-mint-700">Progress</span>
              <span className="font-medium text-mint-800">
                {currentPath.currentStep} / {currentPath.totalSteps} steps
              </span>
            </div>
            <Progress 
              value={(currentPath.currentStep / currentPath.totalSteps) * 100} 
              className="h-2"
            />
            <div className="flex items-center gap-4 text-xs text-mint-600">
              <div className="flex items-center gap-1">
                <Clock className="h-3 w-3" />
                <span>{currentPath.estimatedCompletionDays} days remaining</span>
              </div>
              <div className="flex items-center gap-1">
                <CheckCircle className="h-3 w-3" />
                <span>{currentPath.adaptiveSteps.filter(s => s.completed).length} completed</span>
              </div>
            </div>
          </div>
        </div>

        {/* Next Steps */}
        <div className="space-y-3">
          <h4 className="font-medium text-gray-800">Next Steps</h4>
          {currentPath.adaptiveSteps
            .filter(step => !step.completed)
            .slice(0, 3)
            .map((step, index) => (
              <div key={step.stepNumber} className="flex items-center gap-3 p-3 border border-gray-200 rounded-lg">
                <div className="flex-shrink-0 w-8 h-8 bg-mint-100 rounded-full flex items-center justify-center text-mint-700 text-sm font-medium">
                  {step.stepNumber}
                </div>
                <div className="flex-1">
                  <h5 className="font-medium text-gray-800">{step.title}</h5>
                  <p className="text-sm text-gray-600">{step.description}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <Badge variant="outline" className="text-xs">
                      {step.resourceType}
                    </Badge>
                    <span className="text-xs text-gray-500">
                      ~{step.estimatedTimeMinutes} min
                    </span>
                  </div>
                </div>
                {index === 0 && (
                  <Button size="sm" className="bg-mint-500 hover:bg-mint-600 text-white">
                    <ArrowRight className="h-3 w-3" />
                  </Button>
                )}
              </div>
            ))}
        </div>

        {/* All Paths Summary */}
        {learningPaths.length > 1 && (
          <div className="pt-4 border-t border-gray-200">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">
                {learningPaths.length} learning paths active
              </span>
              <Button variant="outline" size="sm">
                View All Paths
              </Button>
            </div>
          </div>
        )}
      </div>
    </ProgressCard>
  );
};
