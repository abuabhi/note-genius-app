
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Brain, Target, TrendingUp, Clock, Zap, AlertTriangle } from "lucide-react";
import { useSpacedRepetitionOptimizer } from "@/hooks/progress/advanced/useSpacedRepetitionOptimizer";
import { useDifficultyAdjustment } from "@/hooks/progress/advanced/useDifficultyAdjustment";
import { usePerformancePrediction } from "@/hooks/progress/advanced/usePerformancePrediction";

export const AdvancedOptimizationDashboard = () => {
  const { isOptimizing, optimizeFlashcardSet } = useSpacedRepetitionOptimizer();
  const { isAdjusting, difficultyMetrics, adjustFlashcardSetDifficulty } = useDifficultyAdjustment();
  const { subjectPredictions, learningTrajectory, isCalculating, generateAllPredictions } = usePerformancePrediction();

  const handleOptimizeSpacedRepetition = async () => {
    // In a real implementation, you'd get the user's flashcard IDs
    const flashcardIds: string[] = []; // Would be populated from user's flashcards
    await optimizeFlashcardSet(flashcardIds);
  };

  const handleAdjustDifficulty = async () => {
    // In a real implementation, you'd get the user's flashcard IDs
    const flashcardIds: string[] = []; // Would be populated from user's flashcards
    await adjustFlashcardSetDifficulty(flashcardIds);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Advanced Optimization</h2>
          <p className="text-gray-600">AI-powered learning optimization and performance prediction</p>
        </div>
        <Button 
          onClick={generateAllPredictions}
          disabled={isCalculating}
          className="bg-purple-600 hover:bg-purple-700"
        >
          <Brain className="h-4 w-4 mr-2" />
          {isCalculating ? 'Analyzing...' : 'Refresh Analysis'}
        </Button>
      </div>

      <Tabs defaultValue="spaced-repetition" className="space-y-6">
        <TabsList className="grid grid-cols-3 w-full">
          <TabsTrigger value="spaced-repetition">Spaced Repetition</TabsTrigger>
          <TabsTrigger value="difficulty">Difficulty Adjustment</TabsTrigger>
          <TabsTrigger value="predictions">Performance Predictions</TabsTrigger>
        </TabsList>

        <TabsContent value="spaced-repetition" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5 text-blue-600" />
                Spaced Repetition Optimization
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                <h3 className="font-semibold text-blue-800 mb-2">Optimization Features</h3>
                <ul className="space-y-1 text-sm text-blue-700">
                  <li>• Advanced SM-2 algorithm with machine learning adjustments</li>
                  <li>• Time-of-day performance optimization</li>
                  <li>• Session quality factor integration</li>
                  <li>• Personal learning pattern analysis</li>
                  <li>• Retention probability calculations</li>
                </ul>
              </div>
              
              <Button 
                onClick={handleOptimizeSpacedRepetition}
                disabled={isOptimizing}
                className="w-full"
              >
                <Zap className="h-4 w-4 mr-2" />
                {isOptimizing ? 'Optimizing...' : 'Optimize Spaced Repetition'}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="difficulty" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="h-5 w-5 text-green-600" />
                Difficulty Adjustment Algorithm
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                <h3 className="font-semibold text-green-800 mb-2">Adjustment Features</h3>
                <ul className="space-y-1 text-sm text-green-700">
                  <li>• Performance-based difficulty scaling</li>
                  <li>• Response time analysis</li>
                  <li>• Learning velocity calculations</li>
                  <li>• Confidence level assessments</li>
                  <li>• Adaptive challenge progression</li>
                </ul>
              </div>

              {difficultyMetrics.size > 0 && (
                <div className="space-y-3">
                  <h4 className="font-medium">Recent Adjustments</h4>
                  {Array.from(difficultyMetrics.entries()).slice(0, 3).map(([id, metrics]) => (
                    <div key={id} className="p-3 border border-gray-200 rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium">Flashcard {id.slice(0, 8)}...</span>
                        <Badge variant="outline">
                          {metrics.currentDifficulty} → {metrics.recommendedDifficulty}
                        </Badge>
                      </div>
                      <p className="text-xs text-gray-600">{metrics.adjustmentReason}</p>
                      <div className="mt-2">
                        <div className="flex items-center gap-2 text-xs">
                          <span>Confidence:</span>
                          <Progress value={metrics.confidenceLevel * 100} className="h-1 flex-1" />
                          <span>{Math.round(metrics.confidenceLevel * 100)}%</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
              
              <Button 
                onClick={handleAdjustDifficulty}
                disabled={isAdjusting}
                className="w-full"
              >
                <Target className="h-4 w-4 mr-2" />
                {isAdjusting ? 'Adjusting...' : 'Adjust Difficulty Levels'}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="predictions" className="space-y-6">
          <div className="grid gap-6 lg:grid-cols-2">
            {/* Subject Predictions */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-purple-600" />
                  Subject Performance Predictions
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {subjectPredictions.length > 0 ? (
                  subjectPredictions.map((prediction, index) => (
                    <div key={index} className="p-4 border border-gray-200 rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-medium">{prediction.subject}</h4>
                        <Badge variant="outline">
                          {Math.round(prediction.overallMastery * 100)}% mastery
                        </Badge>
                      </div>
                      
                      <Progress value={prediction.overallMastery * 100} className="mb-3" />
                      
                      <div className="space-y-2 text-sm">
                        <div className="flex items-center justify-between">
                          <span className="text-gray-600">Time to target:</span>
                          <span className="font-medium">{Math.round(prediction.timeToTarget)} days</span>
                        </div>
                        
                        {prediction.weakestAreas.length > 0 && (
                          <div>
                            <span className="text-gray-600">Weak areas:</span>
                            <div className="flex flex-wrap gap-1 mt-1">
                              {prediction.weakestAreas.slice(0, 2).map((area, i) => (
                                <Badge key={i} variant="secondary" className="text-xs">
                                  {area}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        )}
                        
                        {prediction.recommendedFocus.length > 0 && (
                          <div>
                            <span className="text-gray-600">Focus on:</span>
                            <div className="flex flex-wrap gap-1 mt-1">
                              {prediction.recommendedFocus.slice(0, 2).map((focus, i) => (
                                <Badge key={i} variant="outline" className="text-xs">
                                  {focus}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <TrendingUp className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>No prediction data available yet.</p>
                    <p className="text-sm">Complete more study sessions to generate predictions.</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Learning Trajectory */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Brain className="h-5 w-5 text-purple-600" />
                  Learning Trajectory Analysis
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {learningTrajectory ? (
                  <div className="space-y-4">
                    <div className="p-3 bg-purple-50 rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium text-purple-800">Learning Velocity</span>
                        <span className="text-sm font-bold text-purple-900">
                          {learningTrajectory.currentVelocity > 0 ? '+' : ''}
                          {(learningTrajectory.currentVelocity * 100).toFixed(1)}%
                        </span>
                      </div>
                      <Progress 
                        value={Math.abs(learningTrajectory.currentVelocity) * 100} 
                        className="h-2"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div className="p-3 border border-gray-200 rounded-lg text-center">
                        <div className="text-2xl font-bold text-blue-600">
                          {Math.round(learningTrajectory.optimalStudyDuration)}m
                        </div>
                        <div className="text-xs text-gray-600">Optimal Duration</div>
                      </div>
                      
                      <div className="p-3 border border-gray-200 rounded-lg text-center">
                        <div className="text-2xl font-bold text-green-600">
                          {(learningTrajectory.accelerationTrend * 100).toFixed(1)}%
                        </div>
                        <div className="text-xs text-gray-600">Acceleration</div>
                      </div>
                    </div>

                    {/* Risk Indicators */}
                    <div className="space-y-2">
                      {learningTrajectory.plateauRisk > 0.6 && (
                        <div className="flex items-center gap-2 p-2 bg-yellow-50 rounded-lg">
                          <AlertTriangle className="h-4 w-4 text-yellow-600" />
                          <span className="text-sm text-yellow-800">
                            Plateau risk detected - consider varying study methods
                          </span>
                        </div>
                      )}
                      
                      {learningTrajectory.burnoutRisk > 0.7 && (
                        <div className="flex items-center gap-2 p-2 bg-red-50 rounded-lg">
                          <AlertTriangle className="h-4 w-4 text-red-600" />
                          <span className="text-sm text-red-800">
                            High burnout risk - consider reducing study intensity
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <Brain className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>No trajectory data available yet.</p>
                    <p className="text-sm">Complete more study sessions to analyze your learning trajectory.</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};
