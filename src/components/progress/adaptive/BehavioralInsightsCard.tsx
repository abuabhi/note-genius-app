
import { ProgressCard } from "../shared/ProgressCard";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Brain, Clock, Zap, CheckCircle } from "lucide-react";
import { useAdaptiveLearning } from "@/hooks/progress/adaptive";

export const BehavioralInsightsCard = () => {
  const { adaptiveLearningInsights, isLoading } = useAdaptiveLearning();

  if (isLoading) {
    return (
      <ProgressCard title="Behavioral Insights" icon={Brain}>
        <div className="h-64 animate-pulse bg-gray-200 rounded"></div>
      </ProgressCard>
    );
  }

  const { behavioralPatterns, optimizationSuggestions } = adaptiveLearningInsights;

  const getPatternIcon = (patternType: string) => {
    switch (patternType) {
      case 'study_timing': return <Clock className="h-4 w-4" />;
      case 'session_length': return <Zap className="h-4 w-4" />;
      default: return <Brain className="h-4 w-4" />;
    }
  };

  const getImpactColor = (impact: string) => {
    switch (impact) {
      case 'positive': return 'text-green-600 bg-green-100';
      case 'negative': return 'text-red-600 bg-red-100';
      default: return 'text-blue-600 bg-blue-100';
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy': return 'bg-green-100 text-green-800 border-green-200';
      case 'moderate': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      default: return 'bg-red-100 text-red-800 border-red-200';
    }
  };

  if (behavioralPatterns.length === 0 && optimizationSuggestions.length === 0) {
    return (
      <ProgressCard title="Behavioral Insights" icon={Brain}>
        <div className="text-center py-8">
          <Brain className="h-12 w-12 mx-auto mb-4 text-mint-400" />
          <h3 className="text-lg font-medium text-gray-800 mb-2">Building Your Profile</h3>
          <p className="text-gray-600">
            Continue studying to unlock personalized behavioral insights and optimization recommendations.
          </p>
        </div>
      </ProgressCard>
    );
  }

  return (
    <ProgressCard title="Behavioral Insights" icon={Brain}>
      <div className="space-y-6">
        {/* Study Patterns */}
        {behavioralPatterns.length > 0 && (
          <div className="space-y-3">
            <h4 className="font-medium text-gray-800">Discovered Patterns</h4>
            {behavioralPatterns.map((pattern, index) => (
              <div key={index} className="p-3 border border-gray-200 rounded-lg">
                <div className="flex items-start gap-3">
                  <div className="p-2 bg-mint-100 rounded-lg text-mint-600">
                    {getPatternIcon(pattern.patternType)}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-medium text-gray-800 capitalize">
                        {pattern.patternType.replace('_', ' ')}
                      </span>
                      <Badge className={getImpactColor(pattern.impact)}>
                        {pattern.impact}
                      </Badge>
                    </div>
                    <p className="text-sm text-gray-600 mb-2">{pattern.pattern}</p>
                    <p className="text-xs text-mint-700 font-medium">{pattern.recommendation}</p>
                    <div className="flex items-center gap-2 mt-2">
                      <div className="text-xs text-gray-500">
                        Frequency: {Math.round(pattern.frequency * 100)}%
                      </div>
                      <div className="text-xs text-gray-500">
                        Effectiveness: {Math.round(pattern.effectiveness * 100)}%
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Optimization Suggestions */}
        {optimizationSuggestions.length > 0 && (
          <div className="space-y-3">
            <h4 className="font-medium text-gray-800">Optimization Suggestions</h4>
            {optimizationSuggestions
              .sort((a, b) => a.priority - b.priority)
              .slice(0, 3)
              .map((suggestion, index) => (
                <div key={index} className="p-4 bg-gradient-to-r from-mint-50 to-blue-50 rounded-lg border border-mint-200">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 bg-mint-500 text-white rounded-full flex items-center justify-center text-xs font-bold">
                        {suggestion.priority}
                      </div>
                      <Badge variant="outline" className="text-xs capitalize">
                        {suggestion.category}
                      </Badge>
                    </div>
                    <Badge className={getDifficultyColor(suggestion.implementationDifficulty)}>
                      {suggestion.implementationDifficulty}
                    </Badge>
                  </div>
                  
                  <h5 className="font-medium text-mint-800 mb-1">{suggestion.suggestion}</h5>
                  <p className="text-sm text-mint-700 mb-2">{suggestion.rationale}</p>
                  <p className="text-xs text-mint-600 mb-3">
                    <strong>Expected Benefit:</strong> {suggestion.expectedBenefit}
                  </p>
                  
                  <Button 
                    size="sm" 
                    className="bg-mint-500 hover:bg-mint-600 text-white"
                  >
                    <CheckCircle className="h-3 w-3 mr-1" />
                    Apply Suggestion
                  </Button>
                </div>
              ))}
          </div>
        )}

        {/* Quick Stats */}
        <div className="p-3 bg-gray-50 rounded-lg border border-gray-200">
          <div className="grid grid-cols-2 gap-4 text-center">
            <div>
              <div className="text-lg font-bold text-mint-600">{behavioralPatterns.length}</div>
              <div className="text-xs text-gray-600">Patterns Identified</div>
            </div>
            <div>
              <div className="text-lg font-bold text-blue-600">{optimizationSuggestions.length}</div>
              <div className="text-xs text-gray-600">Optimizations Available</div>
            </div>
          </div>
        </div>
      </div>
    </ProgressCard>
  );
};
