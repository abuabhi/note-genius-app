import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { 
  Clock, 
  Calendar, 
  TrendingUp, 
  TrendingDown, 
  Minus,
  BookOpen,
  Target,
  Award,
  Plus
} from "lucide-react";
import { useEnhancedSubjectAnalytics } from "@/hooks/useEnhancedSubjectAnalytics";

export const EnhancedSubjectProgressDashboard = () => {
  const { subjectAnalytics, isLoading } = useEnhancedSubjectAnalytics();

  if (isLoading) {
    return (
      <div className="space-y-6">
        {[...Array(3)].map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardContent className="p-6">
              <div className="h-4 bg-gray-200 rounded w-3/4 mb-4"></div>
              <div className="h-8 bg-gray-200 rounded w-1/2"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-blue-800">Total Study Time</CardTitle>
            <Clock className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-900">{subjectAnalytics.totalStudyTime}h</div>
            <p className="text-xs text-blue-600 mt-1">All time</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-green-800">Sessions This Week</CardTitle>
            <Calendar className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-900">{subjectAnalytics.sessionsThisWeek}</div>
            <p className="text-xs text-green-600 mt-1">This week</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-purple-800">Average Score</CardTitle>
            <Award className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-900">{subjectAnalytics.averageScore}%</div>
            <p className="text-xs text-purple-600 mt-1">Quiz performance</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-orange-50 to-orange-100 border-orange-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-orange-800">Longest Streak</CardTitle>
            <Target className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-900">{subjectAnalytics.longestStreak}</div>
            <p className="text-xs text-orange-600 mt-1">Days consecutive</p>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Metrics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Last 7 Days vs Last 30 Days */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Recent Activity</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between items-center p-4 bg-mint-50 rounded-lg">
              <div>
                <h4 className="font-medium text-mint-800">Last 7 Days</h4>
                <div className="text-sm text-mint-600 space-y-1">
                  <div>{subjectAnalytics.last7Days.studyTime}h study time</div>
                  <div>{subjectAnalytics.last7Days.sessions} sessions</div>
                  <div>{subjectAnalytics.last7Days.cardsReviewed} cards reviewed</div>
                </div>
              </div>
            </div>
            
            <div className="flex justify-between items-center p-4 bg-blue-50 rounded-lg">
              <div>
                <h4 className="font-medium text-blue-800">Last 30 Days</h4>
                <div className="text-sm text-blue-600 space-y-1">
                  <div>{subjectAnalytics.last30Days.studyTime}h study time</div>
                  <div>{subjectAnalytics.last30Days.sessions} sessions</div>
                  <div>{subjectAnalytics.last30Days.cardsReviewed} cards reviewed</div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Averages */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Study Averages</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-3 gap-4">
              <div className="text-center p-3 bg-gray-50 rounded-lg">
                <div className="text-lg font-bold text-gray-900">{subjectAnalytics.dailyAverage}h</div>
                <div className="text-xs text-gray-600">Daily</div>
              </div>
              <div className="text-center p-3 bg-gray-50 rounded-lg">
                <div className="text-lg font-bold text-gray-900">{subjectAnalytics.weeklyAverage}h</div>
                <div className="text-xs text-gray-600">Weekly</div>
              </div>
              <div className="text-center p-3 bg-gray-50 rounded-lg">
                <div className="text-lg font-bold text-gray-900">{subjectAnalytics.monthlyAverage}h</div>
                <div className="text-xs text-gray-600">Monthly</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Subject Progress */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Subject Progress</CardTitle>
        </CardHeader>
        <CardContent>
          {subjectAnalytics.subjects.length > 0 ? (
            <div className="space-y-4">
              {subjectAnalytics.subjects.map((subject, index) => (
                <div key={index} className="p-4 border rounded-lg hover:bg-gray-50 transition-colors">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-3">
                      <BookOpen className="h-5 w-5 text-gray-600" />
                      <h3 className="font-medium">{subject.name}</h3>
                      {subject.trend === 'up' && <TrendingUp className="h-4 w-4 text-green-500" />}
                      {subject.trend === 'down' && <TrendingDown className="h-4 w-4 text-red-500" />}
                      {subject.trend === 'stable' && <Minus className="h-4 w-4 text-gray-500" />}
                    </div>
                    <Badge variant="outline">{subject.progress}% progress</Badge>
                  </div>
                  
                  <Progress value={subject.progress} className="mb-2" />
                  
                  <div className="flex justify-between text-sm text-gray-600">
                    <span>{subject.studyTime}h studied</span>
                    <span>{subject.sessions} sessions</span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              <BookOpen className="h-12 w-12 mx-auto mb-4 text-gray-300" />
              <p>No subjects found. Start studying to see your progress!</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Suggested Subjects */}
      {subjectAnalytics.suggestedSubjects.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Suggested Subjects</CardTitle>
            <p className="text-sm text-gray-600">Based on your study patterns</p>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {subjectAnalytics.suggestedSubjects.map((subject, index) => (
                <Badge key={index} variant="secondary" className="cursor-pointer hover:bg-mint-100">
                  <Plus className="h-3 w-3 mr-1" />
                  {subject}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
