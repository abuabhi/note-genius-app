
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { useOptimizedSubjectAnalytics } from '@/hooks/useOptimizedSubjectAnalytics';
import { BookOpen, TrendingUp, Target, AlertCircle } from 'lucide-react';

export const EnhancedSubjectProgressDashboard = () => {
  const { data: subjectProgress, isLoading } = useOptimizedSubjectAnalytics();

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader className="pb-2">
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                <div className="h-3 bg-gray-200 rounded w-1/2"></div>
              </CardHeader>
              <CardContent>
                <div className="h-8 bg-gray-200 rounded w-1/3"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (!subjectProgress || subjectProgress.length === 0) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center text-muted-foreground">
            <BookOpen className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>No subject progress data available yet.</p>
            <p className="text-sm mt-2">Start studying to see your progress!</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Calculate summary stats
  const totalSubjects = subjectProgress.length;
  const masteredSubjects = subjectProgress.filter(s => s.completionPercentage >= 85).length;
  const progressingSubjects = subjectProgress.filter(s => s.completionPercentage >= 50 && s.completionPercentage < 85).length;
  const needsAttentionSubjects = subjectProgress.filter(s => s.completionPercentage < 50).length;
  const averageProgress = Math.round(subjectProgress.reduce((acc, s) => acc + s.completionPercentage, 0) / totalSubjects);

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Subjects</CardTitle>
            <BookOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalSubjects}</div>
            <p className="text-xs text-muted-foreground">
              Active learning areas
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Average Progress</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{averageProgress}%</div>
            <p className="text-xs text-muted-foreground">
              Overall completion
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Mastered</CardTitle>
            <Target className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{masteredSubjects}</div>
            <p className="text-xs text-muted-foreground">
              85%+ completion
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Needs Attention</CardTitle>
            <AlertCircle className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{needsAttentionSubjects}</div>
            <p className="text-xs text-muted-foreground">
              Below 50% completion
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Subject Progress */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Mastered Subjects */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Target className="h-5 w-5 text-green-600" />
              Mastered Subjects
            </CardTitle>
            <CardDescription>Subjects with 85%+ completion</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {subjectProgress
              .filter(s => s.completionPercentage >= 85)
              .map((subject, index) => (
                <div key={index} className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="font-medium">{subject.subject}</span>
                    <Badge variant="secondary" className="bg-green-100 text-green-800">
                      {Math.round(subject.completionPercentage)}%
                    </Badge>
                  </div>
                  <Progress value={subject.completionPercentage} className="h-2" />
                </div>
              ))}
            {masteredSubjects === 0 && (
              <p className="text-sm text-muted-foreground text-center py-4">
                No mastered subjects yet. Keep studying!
              </p>
            )}
          </CardContent>
        </Card>

        {/* Progressing Subjects */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-blue-600" />
              Progressing Subjects
            </CardTitle>
            <CardDescription>Subjects with 50-84% completion</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {subjectProgress
              .filter(s => s.completionPercentage >= 50 && s.completionPercentage < 85)
              .map((subject, index) => (
                <div key={index} className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="font-medium">{subject.subject}</span>
                    <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                      {Math.round(subject.completionPercentage)}%
                    </Badge>
                  </div>
                  <Progress value={subject.completionPercentage} className="h-2" />
                </div>
              ))}
            {progressingSubjects === 0 && (
              <p className="text-sm text-muted-foreground text-center py-4">
                No subjects in progress range.
              </p>
            )}
          </CardContent>
        </Card>

        {/* Needs Attention */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-red-600" />
              Needs Attention
            </CardTitle>
            <CardDescription>Subjects below 50% completion</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {subjectProgress
              .filter(s => s.completionPercentage < 50)
              .map((subject, index) => (
                <div key={index} className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="font-medium">{subject.subject}</span>
                    <Badge variant="secondary" className="bg-red-100 text-red-800">
                      {Math.round(subject.completionPercentage)}%
                    </Badge>
                  </div>
                  <Progress value={subject.completionPercentage} className="h-2" />
                </div>
              ))}
            {needsAttentionSubjects === 0 && (
              <p className="text-sm text-muted-foreground text-center py-4">
                Great! All subjects are progressing well.
              </p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
