
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { useSaaSOptimizedSubjectAnalytics } from "@/hooks/useSaaSOptimizedSubjectAnalytics";
import { Skeleton } from "@/components/ui/skeleton";
import { Target, BookOpen, Brain, FileText, CalendarDays, Clock, Users } from "lucide-react";
import { StudySuggestions } from "./StudySuggestions";

export const EnhancedSubjectProgressDashboard = () => {
  const { subjectAnalytics, isLoading } = useSaaSOptimizedSubjectAnalytics();

  if (isLoading) {
    return (
      <div className="space-y-8">
        {/* Overview Cards Skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader className="pb-2">
                <Skeleton className="h-4 w-24" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-8 w-16 mb-2" />
                <Skeleton className="h-3 w-20" />
              </CardContent>
            </Card>
          ))}
        </div>
        
        {/* Subject Progress Skeleton */}
        <Card className="animate-pulse">
          <CardHeader>
            <Skeleton className="h-6 w-48" />
          </CardHeader>
          <CardContent className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="space-y-2">
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-2 w-full" />
                <div className="flex gap-2">
                  <Skeleton className="h-5 w-16" />
                  <Skeleton className="h-5 w-16" />
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    );
  }

  const { subjects, totalStudyTime, sessionsThisWeek, averageScore, last7DaysFormatted, last30DaysFormatted } = subjectAnalytics;

  return (
    <div className="space-y-8">
      {/* Enhanced Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-blue-700 flex items-center gap-2">
              <Clock className="h-4 w-4" />
              Last 7 Days
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-900 mb-1">
              {last7DaysFormatted}
            </div>
            <p className="text-xs text-blue-600">
              Recent activity
            </p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-green-700 flex items-center gap-2">
              <CalendarDays className="h-4 w-4" />
              Last 30 Days
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-900 mb-1">
              {last30DaysFormatted}
            </div>
            <p className="text-xs text-green-600">
              Monthly overview
            </p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-purple-700 flex items-center gap-2">
              <Target className="h-4 w-4" />
              Average Score
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-900 mb-1">
              {averageScore}%
            </div>
            <p className="text-xs text-purple-600">
              Across all subjects
            </p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-orange-50 to-orange-100 border-orange-200">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-orange-700 flex items-center gap-2">
              <Users className="h-4 w-4" />
              Active Subjects
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-900 mb-1">
              {subjects.length}
            </div>
            <p className="text-xs text-orange-600">
              With study activity
            </p>
          </CardContent>
        </Card>
      </div>

      {/* AI Study Suggestions */}
      <StudySuggestions />

      {/* Subject Progress Details */}
      <Card>
        <CardHeader>
          <CardTitle className="text-xl font-semibold text-mint-900 flex items-center gap-2">
            <BookOpen className="h-5 w-5" />
            Subject Progress Details
          </CardTitle>
          <p className="text-mint-600 text-sm">
            Comprehensive view of your learning progress across all subjects
          </p>
        </CardHeader>
        <CardContent>
          {subjects.length === 0 ? (
            <div className="text-center py-8">
              <BookOpen className="h-12 w-12 text-mint-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-mint-900 mb-2">No Study Activity Yet</h3>
              <p className="text-mint-600">
                Start creating flashcards, taking quizzes, or making notes to see your progress here
              </p>
            </div>
          ) : (
            <div className="space-y-6">
              {subjects.map((subject) => (
                <div
                  key={subject.id}
                  className="bg-gradient-to-r from-white to-mint-50/30 rounded-lg p-6 border border-mint-100"
                >
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <h3 className="text-lg font-semibold text-mint-900">
                        {subject.name}
                      </h3>
                      <Badge
                        variant="outline"
                        className={`${
                          subject.color === 'green'
                            ? 'bg-green-100 text-green-800 border-green-200'
                            : subject.color === 'yellow'
                            ? 'bg-yellow-100 text-yellow-800 border-yellow-200'
                            : 'bg-red-100 text-red-800 border-red-200'
                        }`}
                      >
                        {subject.completionPercentage}% Complete
                      </Badge>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-mint-600">
                      {subject.hasFlashcards && (
                        <div className="flex items-center gap-1">
                          <Brain className="h-4 w-4" />
                          <span>Flashcards</span>
                        </div>
                      )}
                      {subject.hasNotes && (
                        <div className="flex items-center gap-1">
                          <FileText className="h-4 w-4" />
                          <span>Notes</span>
                        </div>
                      )}
                      {subject.hasQuizzes && (
                        <div className="flex items-center gap-1">
                          <Target className="h-4 w-4" />
                          <span>Quizzes</span>
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <div className="mb-4">
                    <Progress 
                      value={subject.completionPercentage} 
                      className="h-3"
                    />
                  </div>
                  
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div>
                      <p className="text-mint-600 mb-1">Flashcard Mastery</p>
                      <p className="font-semibold text-mint-900">{subject.flashcardMastery}%</p>
                    </div>
                    <div>
                      <p className="text-mint-600 mb-1">Quiz Performance</p>
                      <p className="font-semibold text-mint-900">{subject.quizPerformance}%</p>
                    </div>
                    <div>
                      <p className="text-mint-600 mb-1">Study Time</p>
                      <p className="font-semibold text-mint-900">
                        {Math.floor(subject.totalStudyTimeMinutes / 60)}h {subject.totalStudyTimeMinutes % 60}m
                      </p>
                    </div>
                    <div>
                      <p className="text-mint-600 mb-1">Sessions</p>
                      <p className="font-semibold text-mint-900">{subject.sessionCount}</p>
                    </div>
                  </div>
                  
                  {(subject.last7DaysTime > 0 || subject.last30DaysTime > 0) && (
                    <div className="mt-4 pt-4 border-t border-mint-200">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                        <div>
                          <p className="text-mint-600 mb-1">Last 7 Days</p>
                          <p className="font-medium text-mint-800">
                            {Math.floor(subject.last7DaysTime / 60)}h {subject.last7DaysTime % 60}m in {subject.last7DaysSessions} session{subject.last7DaysSessions !== 1 ? 's' : ''}
                          </p>
                        </div>
                        <div>
                          <p className="text-mint-600 mb-1">Last 30 Days</p>
                          <p className="font-medium text-mint-800">
                            {Math.floor(subject.last30DaysTime / 60)}h {subject.last30DaysTime % 60}m in {subject.last30DaysSessions} session{subject.last30DaysSessions !== 1 ? 's' : ''}
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
