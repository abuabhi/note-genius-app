
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useSmartScheduling } from '@/hooks/useSmartScheduling';
import { StudyPlan, StudyPlanSession } from '@/types/studyPlanner';
import { Brain, Clock, TrendingUp, CheckCircle, AlertCircle } from 'lucide-react';
import { format } from 'date-fns';

interface SmartSchedulingSuggestionsProps {
  plan: StudyPlan;
  sessions: StudyPlanSession[];
  onApplyRecommendation: (sessionId: string, newDate: string, newStartTime: string, newEndTime: string) => void;
  onGenerateOptimalSchedule: () => void;
}

export const SmartSchedulingSuggestions = ({
  plan,
  sessions,
  onApplyRecommendation,
  onGenerateOptimalSchedule,
}: SmartSchedulingSuggestionsProps) => {
  const { generateRecommendations, generateOptimalSchedule, isLoading } = useSmartScheduling();
  const [appliedRecommendations, setAppliedRecommendations] = useState<Set<string>>(new Set());

  const optimization = generateRecommendations(plan, sessions);

  const handleApplyRecommendation = (recommendation: any) => {
    if (recommendation.sessionId) {
      onApplyRecommendation(
        recommendation.sessionId,
        recommendation.recommendedDate,
        recommendation.recommendedStartTime,
        recommendation.recommendedEndTime
      );
      setAppliedRecommendations(prev => new Set([...prev, recommendation.sessionId]));
    }
  };

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 0.8) return 'bg-green-100 text-green-800';
    if (confidence >= 0.6) return 'bg-yellow-100 text-yellow-800';
    return 'bg-orange-100 text-orange-800';
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-center">
            <Brain className="h-5 w-5 animate-pulse mr-2" />
            <span>Analyzing your study patterns...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {/* Schedule Score */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Schedule Optimization Score
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div>
              <div className={`text-3xl font-bold ${getScoreColor(optimization.overallScore)}`}>
                {optimization.overallScore}%
              </div>
              <p className="text-sm text-gray-600">Based on your performance patterns</p>
            </div>
            <Button
              onClick={onGenerateOptimalSchedule}
              variant="outline"
              className="ml-4"
            >
              <Brain className="h-4 w-4 mr-2" />
              Generate Optimal Schedule
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Recommendations */}
      {optimization.recommendations.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Brain className="h-5 w-5" />
              Smart Recommendations ({optimization.recommendations.length})
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {optimization.recommendations.map((rec, index) => (
              <div
                key={`${rec.sessionId}-${index}`}
                className="border rounded-lg p-4 space-y-3"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <Badge className={getConfidenceColor(rec.confidence)}>
                        {Math.round(rec.confidence * 100)}% confidence
                      </Badge>
                      <Clock className="h-4 w-4 text-gray-500" />
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="font-medium">Current:</span>
                        <div className="text-gray-600">
                          {rec.originalDate && format(new Date(rec.originalDate), 'MMM dd')} at {rec.originalStartTime}
                        </div>
                      </div>
                      <div>
                        <span className="font-medium">Recommended:</span>
                        <div className="text-green-600">
                          {format(new Date(rec.recommendedDate), 'MMM dd')} at {rec.recommendedStartTime}
                        </div>
                      </div>
                    </div>

                    <div className="mt-3">
                      <span className="font-medium text-sm">Why this change:</span>
                      <ul className="text-sm text-gray-600 mt-1 list-disc list-inside">
                        {rec.reasoning.map((reason, idx) => (
                          <li key={idx}>{reason}</li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  <div className="flex gap-2 ml-4">
                    {appliedRecommendations.has(rec.sessionId || '') ? (
                      <div className="flex items-center text-green-600">
                        <CheckCircle className="h-4 w-4 mr-1" />
                        Applied
                      </div>
                    ) : (
                      <Button
                        size="sm"
                        onClick={() => handleApplyRecommendation(rec)}
                        className="bg-blue-600 hover:bg-blue-700"
                      >
                        Apply
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* General Improvements */}
      {optimization.improvements.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5" />
              Insights & Tips
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {optimization.improvements.map((improvement, index) => (
                <li key={index} className="flex items-start gap-2 text-sm">
                  <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0" />
                  <span>{improvement}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}

      {optimization.recommendations.length === 0 && optimization.improvements.length <= 1 && (
        <Card>
          <CardContent className="p-6 text-center">
            <Brain className="h-12 w-12 mx-auto text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Building Your Profile
            </h3>
            <p className="text-gray-600">
              Complete a few study sessions to unlock personalized scheduling recommendations based on your performance patterns.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
