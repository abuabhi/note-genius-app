
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { useEnhancedSubjectAnalytics } from '@/hooks/useEnhancedSubjectAnalytics';
import { Clock, Calendar, Trophy, TrendingUp, BookOpen, Plus, Target, Activity, Brain } from 'lucide-react';
import { Link } from 'react-router-dom';

export const EnhancedSubjectProgressDashboard = () => {
  const { subjectAnalytics, isLoading } = useEnhancedSubjectAnalytics();

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {Array.from({ length: 4 }, (_, i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-4">
                <div className="h-4 bg-gray-200 rounded mb-2"></div>
                <div className="h-8 bg-gray-200 rounded"></div>
              </CardContent>
            </Card>
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {Array.from({ length: 2 }, (_, i) => (
            <div key={i} className="space-y-4">
              <div className="h-6 bg-gray-200 rounded animate-pulse"></div>
              <div className="space-y-3">
                {Array.from({ length: 3 }, (_, j) => (
                  <div key={j} className="h-24 bg-gray-200 rounded animate-pulse"></div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  const formatTime = (minutes: number) => {
    if (minutes < 60) return `${minutes}m`;
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    return remainingMinutes > 0 ? `${hours}h ${remainingMinutes}m` : `${hours}h`;
  };

  const TimePeriodCard = ({ title, value, icon: Icon, color = "blue" }: {
    title: string;
    value: string | number;
    icon: React.ComponentType<any>;
    color?: string;
  }) => (
    <Card className="bg-white border-gray-200 hover:shadow-md transition-shadow">
      <CardHeader className="pb-2">
        <CardTitle className={`text-sm font-medium text-${color}-600 flex items-center gap-2`}>
          <Icon className="h-4 w-4" />
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-0">
        <div className={`text-2xl font-bold text-${color}-900`}>
          {typeof value === 'number' && title.includes('Time') ? formatTime(value) : value}
        </div>
      </CardContent>
    </Card>
  );

  const SubjectCard = ({ subject }: { subject: any }) => (
    <Card className={`bg-white border-l-4 ${
      subject.color === 'green' ? 'border-l-green-500' : 
      subject.color === 'yellow' ? 'border-l-yellow-500' : 'border-l-red-500'
    } hover:shadow-sm transition-shadow`}>
      <CardContent className="p-4">
        <div className="flex items-center justify-between mb-3">
          <div>
            <h3 className="font-medium text-gray-900">{subject.name}</h3>
            <p className="text-xs text-gray-500">
              {subject.lastStudyDate ? 
                `Last studied: ${new Date(subject.lastStudyDate).toLocaleDateString()}` : 
                'No recent activity'
              }
            </p>
          </div>
          <div className="text-right">
            <span className={`text-lg font-bold ${
              subject.color === 'green' ? 'text-green-600' : 
              subject.color === 'yellow' ? 'text-yellow-600' : 'text-red-600'
            }`}>
              {subject.completionPercentage}%
            </span>
          </div>
        </div>
        <div className="mb-3">
          <Progress 
            value={subject.completionPercentage} 
            className="h-2"
          />
        </div>
        <div className="grid grid-cols-2 gap-4 text-xs text-gray-600">
          <div className="flex items-center gap-1">
            <Clock className="h-3 w-3" />
            <span>{formatTime(subject.totalStudyTimeMinutes)}</span>
          </div>
          <div className="flex items-center gap-1">
            <Activity className="h-3 w-3" />
            <span>{subject.sessionCount} sessions</span>
          </div>
          <div className="flex items-center gap-1">
            <Brain className="h-3 w-3" />
            <span>{subject.flashcardMastery}% mastery</span>
          </div>
          <div className="flex items-center gap-1">
            <Trophy className="h-3 w-3" />
            <span>{subject.averageScore}% avg</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  const SubjectSuggestions = () => (
    <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200">
      <CardHeader>
        <CardTitle className="text-lg font-semibold text-blue-900 flex items-center gap-2">
          <Target className="h-5 w-5" />
          Get Started with These Subjects
        </CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-blue-700 mb-4">
          Start tracking your progress by adding subjects you're studying:
        </p>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-2 mb-4">
          {subjectAnalytics.subjectSuggestions.slice(0, 6).map((subject) => (
            <Button 
              key={subject}
              variant="outline" 
              size="sm"
              className="text-xs border-blue-200 hover:bg-blue-100"
            >
              {subject}
            </Button>
          ))}
        </div>
        <div className="flex gap-2">
          <Button asChild className="bg-blue-600 hover:bg-blue-700">
            <Link to="/flashcards" className="flex items-center gap-2">
              <Plus className="h-4 w-4" />
              Create Flashcard Set
            </Link>
          </Button>
          <Button asChild variant="outline" className="border-blue-200 hover:bg-blue-50">
            <Link to="/notes" className="flex items-center gap-2">
              <BookOpen className="h-4 w-4" />
              Add Study Notes
            </Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="space-y-8">
      {/* Time Period Overview */}
      <div>
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Study Time Overview</h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <TimePeriodCard
            title="Last 7 Days"
            value={subjectAnalytics.studyTimeInsights.last7Days}
            icon={Calendar}
            color="green"
          />
          <TimePeriodCard
            title="Last 30 Days"
            value={subjectAnalytics.studyTimeInsights.last30Days}
            icon={Calendar}
            color="blue"
          />
          <TimePeriodCard
            title="This Week"
            value={subjectAnalytics.studyTimeInsights.thisWeek}
            icon={Clock}
            color="purple"
          />
          <TimePeriodCard
            title="Daily Average"
            value={subjectAnalytics.studyTimeInsights.dailyAverage}
            icon={TrendingUp}
            color="orange"
          />
        </div>
      </div>

      {/* Study Time Insights */}
      <div>
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Study Time Insights</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="bg-white border-gray-200">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Weekly Average</CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="text-2xl font-bold text-gray-900 mb-1">
                {formatTime(subjectAnalytics.studyTimeInsights.weeklyAverage)}
              </div>
              <p className="text-xs text-gray-500">
                Consistency is key to effective learning
              </p>
            </CardContent>
          </Card>
          
          <Card className="bg-white border-gray-200">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Monthly Total</CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="text-2xl font-bold text-gray-900 mb-1">
                {formatTime(subjectAnalytics.studyTimeInsights.monthlyAverage)}
              </div>
              <p className="text-xs text-gray-500">
                Great progress this month!
              </p>
            </CardContent>
          </Card>
          
          <Card className="bg-white border-gray-200">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Study Streak</CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="text-2xl font-bold text-gray-900 mb-1">
                {subjectAnalytics.longestStreak} days
              </div>
              <p className="text-xs text-gray-500">
                Keep up the momentum!
              </p>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Subject Progress Section */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-gray-900">Subject Progress</h2>
          {subjectAnalytics.hasSubjects && (
            <Button asChild variant="outline" size="sm">
              <Link to="/flashcards" className="flex items-center gap-2">
                <Plus className="h-4 w-4" />
                Add Subject
              </Link>
            </Button>
          )}
        </div>

        {!subjectAnalytics.hasSubjects ? (
          <SubjectSuggestions />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {subjectAnalytics.subjects.map((subject) => (
              <SubjectCard key={subject.id} subject={subject} />
            ))}
          </div>
        )}
      </div>

      {/* Subject Performance Summary */}
      {subjectAnalytics.hasSubjects && (
        <Card className="bg-white border-gray-200">
          <CardHeader>
            <CardTitle className="text-lg font-semibold">Performance Summary</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="text-3xl font-bold text-green-600 mb-2">
                  {subjectAnalytics.subjects.filter(s => s.completionPercentage >= 85).length}
                </div>
                <div className="text-sm font-medium text-gray-700">Mastered</div>
                <div className="text-xs text-gray-500">85%+ completion</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-yellow-600 mb-2">
                  {subjectAnalytics.subjects.filter(s => s.completionPercentage >= 60 && s.completionPercentage < 85).length}
                </div>
                <div className="text-sm font-medium text-gray-700">Progressing</div>
                <div className="text-xs text-gray-500">60-84% completion</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-red-600 mb-2">
                  {subjectAnalytics.subjects.filter(s => s.completionPercentage < 60).length}
                </div>
                <div className="text-sm font-medium text-gray-700">Needs Attention</div>
                <div className="text-xs text-gray-500">Below 60% completion</div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
