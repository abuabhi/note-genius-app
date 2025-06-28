
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Clock, TrendingUp, Target, BookOpen, Brain, Trophy, AlertCircle, CheckCircle, ArrowRight } from "lucide-react";
import { useEnhancedSubjectAnalytics } from "@/hooks/useEnhancedSubjectAnalytics";
import { getFallbackRecommendations } from "@/utils/subjectAnalyticsUtils";

export const EnhancedSubjectProgressDashboard = () => {
  const { enhancedAnalytics, isLoading } = useEnhancedSubjectAnalytics();

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader className="pb-2">
                <div className="h-4 bg-gray-200 rounded w-1/2"></div>
              </CardHeader>
              <CardContent>
                <div className="h-8 bg-gray-200 rounded w-3/4"></div>
              </CardContent>
            </Card>
          ))}
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader>
                <div className="h-5 bg-gray-200 rounded w-2/3"></div>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="h-4 bg-gray-200 rounded"></div>
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                <div className="h-4 bg-gray-200 rounded w-1/2"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  const recommendations = getFallbackRecommendations(enhancedAnalytics.subjects || []);

  const getProgressColor = (percentage: number) => {
    if (percentage >= 85) return "text-green-600";
    if (percentage >= 60) return "text-yellow-600";
    return "text-red-600";
  };

  const getProgressBarColor = (percentage: number) => {
    if (percentage >= 85) return "bg-green-500";
    if (percentage >= 60) return "bg-yellow-500";
    return "bg-red-500";
  };

  return (
    <div className="space-y-8">
      {/* Key Metrics Section */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-blue-700 text-sm font-medium">
              <Clock className="h-4 w-4" />
              Total Study Time
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-900">
              {Math.round(enhancedAnalytics.totalStudyTime || 0)} hrs
            </div>
            <p className="text-xs text-blue-600 mt-1">All time progress</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-green-700 text-sm font-medium">
              <TrendingUp className="h-4 w-4" />
              This Week
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-900">
              {enhancedAnalytics.sessionsThisWeek || 0}
            </div>
            <p className="text-xs text-green-600 mt-1">Study sessions</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-purple-700 text-sm font-medium">
              <Trophy className="h-4 w-4" />
              Average Score
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-900">
              {Math.round(enhancedAnalytics.averageScore || 0)}%
            </div>
            <p className="text-xs text-purple-600 mt-1">Quiz performance</p>
          </CardContent>
        </Card>
      </div>

      {/* Subject Progress Grid */}
      <div>
        <div className="flex items-center gap-2 mb-6">
          <BookOpen className="h-5 w-5 text-mint-600" />
          <h2 className="text-xl font-semibold text-gray-900">Subject Progress</h2>
          <Badge variant="outline" className="text-xs">
            {enhancedAnalytics.subjects?.length || 0} subjects
          </Badge>
        </div>

        {enhancedAnalytics.subjects && enhancedAnalytics.subjects.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {enhancedAnalytics.subjects.map((subject) => (
              <Card key={subject.subject_name} className="hover:shadow-lg transition-all duration-200 border-l-4 border-l-mint-400">
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center justify-between text-sm">
                    <span className="font-semibold text-gray-900 truncate">
                      {subject.subject_name}
                    </span>
                    <Badge 
                      variant="secondary" 
                      className={`text-xs px-2 py-1 ${getProgressColor(subject.completion_percentage || 0)}`}
                    >
                      {subject.completion_percentage || 0}%
                    </Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Progress Bar */}
                  <div className="space-y-2">
                    <div className="flex justify-between text-xs text-gray-600">
                      <span>Completion</span>
                      <span className={getProgressColor(subject.completion_percentage || 0)}>
                        {subject.completion_percentage || 0}%
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className={`h-2 rounded-full transition-all duration-300 ${getProgressBarColor(subject.completion_percentage || 0)}`}
                        style={{ width: `${Math.min(subject.completion_percentage || 0, 100)}%` }}
                      ></div>
                    </div>
                  </div>

                  {/* Key Metrics */}
                  <div className="grid grid-cols-2 gap-3 text-xs">
                    <div className="text-center p-2 bg-blue-50 rounded">
                      <div className="font-semibold text-blue-700">{subject.flashcard_sets_count || 0}</div>
                      <div className="text-blue-600">Sets</div>
                    </div>
                    <div className="text-center p-2 bg-green-50 rounded">
                      <div className="font-semibold text-green-700">{subject.study_sessions_count || 0}</div>
                      <div className="text-green-600">Sessions</div>
                    </div>
                  </div>

                  {/* Additional Stats */}
                  <div className="space-y-1 text-xs text-gray-600">
                    <div className="flex justify-between">
                      <span>Study Time:</span>
                      <span className="font-medium">{Math.round(enhancedAnalytics.totalStudyTime || 0)}h</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Flashcards:</span>
                      <span className="font-medium">{subject.total_flashcards || 0}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Notes:</span>
                      <span className="font-medium">{subject.notes_count || 0}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <Card className="text-center py-8">
            <CardContent>
              <BookOpen className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No Subject Data Available</h3>
              <p className="text-gray-600 mb-4">Start studying to see your progress analytics here.</p>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Study Recommendations Section */}
      <div>
        <div className="flex items-center gap-2 mb-6">
          <Brain className="h-5 w-5 text-mint-600" />
          <h2 className="text-xl font-semibold text-gray-900">Study Recommendations</h2>
          <Badge variant="outline" className="text-xs">
            AI-powered insights
          </Badge>
        </div>

        {recommendations && recommendations.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {recommendations.map((rec, index) => (
              <Card key={index} className="border-l-4 border-l-orange-400 hover:shadow-md transition-shadow">
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center justify-between text-sm">
                    <span className="font-semibold text-gray-900">{rec.subject_name}</span>
                    <Badge 
                      variant={rec.priority === 'high' ? 'destructive' : rec.priority === 'medium' ? 'default' : 'secondary'}
                      className="text-xs"
                    >
                      {rec.priority} priority
                    </Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <p className="text-sm text-gray-700">{rec.message}</p>
                  
                  {rec.action_items && rec.action_items.length > 0 && (
                    <div className="space-y-2">
                      <h4 className="text-xs font-medium text-gray-900 flex items-center gap-1">
                        <CheckCircle className="h-3 w-3" />
                        Action Items:
                      </h4>
                      <ul className="space-y-1">
                        {rec.action_items.map((item, itemIndex) => (
                          <li key={itemIndex} className="text-xs text-gray-600 flex items-start gap-2">
                            <ArrowRight className="h-3 w-3 mt-0.5 text-mint-500 flex-shrink-0" />
                            <span>{item}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <Card className="text-center py-8">
            <CardContent>
              <Brain className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No Recommendations Available</h3>
              <p className="text-gray-600">Study more to receive personalized recommendations.</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};
