
import { StudyPlan } from '@/types/studyPlanner';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Calendar, Clock, Target, Play, CheckCircle2, BookOpen, Users, Zap } from 'lucide-react';
import { formatDistanceToNow, format, differenceInDays } from 'date-fns';

interface StudyPlansGridProps {
  plans: StudyPlan[];
  onGenerateSessions: (planId: string) => void;
  onConvertToGoals: (planId: string) => void;
  isGenerating?: boolean;
  isConverting?: boolean;
}

export const StudyPlansGrid = ({ 
  plans, 
  onGenerateSessions, 
  onConvertToGoals,
  isGenerating,
  isConverting 
}: StudyPlansGridProps) => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-emerald-100 text-emerald-700 border-emerald-200';
      case 'paused': return 'bg-amber-100 text-amber-700 border-amber-200';
      case 'completed': return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'archived': return 'bg-gray-100 text-gray-700 border-gray-200';
      default: return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  const getDifficultyColor = (level: string) => {
    switch (level) {
      case 'beginner': return 'bg-green-100 text-green-700 border-green-200';
      case 'intermediate': return 'bg-yellow-100 text-yellow-700 border-yellow-200';
      case 'advanced': return 'bg-red-100 text-red-700 border-red-200';
      default: return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-700 border-red-200';
      case 'medium': return 'bg-yellow-100 text-yellow-700 border-yellow-200';
      case 'low': return 'bg-green-100 text-green-700 border-green-200';
      default: return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  const formatDateRange = (startDate: string, endDate: string) => {
    const start = new Date(startDate);
    const end = new Date(endDate);
    const days = differenceInDays(end, start);
    
    if (days <= 30) {
      return `${days} days (${format(start, 'MMM d')} - ${format(end, 'MMM d')})`;
    } else if (days <= 90) {
      const weeks = Math.ceil(days / 7);
      return `${weeks} weeks (${format(start, 'MMM d')} - ${format(end, 'MMM d')})`;
    } else {
      const months = Math.ceil(days / 30);
      return `${months} months (${format(start, 'MMM')} - ${format(end, 'MMM yyyy')})`;
    }
  };

  const getScheduleSummary = (availableDays: string[], availableTimes: Record<string, { start: string; end: string }>) => {
    const dayAbbreviations = {
      monday: 'Mon',
      tuesday: 'Tue',
      wednesday: 'Wed',
      thursday: 'Thu',
      friday: 'Fri',
      saturday: 'Sat',
      sunday: 'Sun'
    };

    const shortDays = availableDays.map(day => dayAbbreviations[day as keyof typeof dayAbbreviations]).join(', ');
    
    // Get a sample time slot (assuming most are similar)
    const sampleDay = availableDays[0];
    const timeSlot = availableTimes[sampleDay];
    
    if (timeSlot) {
      return `${shortDays} • ${timeSlot.start}-${timeSlot.end}`;
    }
    
    return shortDays;
  };

  const calculateProgress = (plan: StudyPlan) => {
    const now = new Date();
    const start = new Date(plan.start_date);
    const end = new Date(plan.end_date);
    
    if (now < start) return 0;
    if (now > end) return 100;
    
    const totalDays = differenceInDays(end, start);
    const completedDays = differenceInDays(now, start);
    
    return Math.round((completedDays / totalDays) * 100);
  };

  if (plans.length === 0) {
    return (
      <Card className="p-12 text-center border-dashed border-2 border-gray-200">
        <div className="w-20 h-20 bg-gradient-to-br from-mint-100 to-mint-200 rounded-full flex items-center justify-center mx-auto mb-6">
          <Target className="h-10 w-10 text-mint-600" />
        </div>
        <h3 className="text-xl font-semibold text-gray-900 mb-3">No Study Plans Yet</h3>
        <p className="text-gray-600 mb-6 max-w-md mx-auto">
          Create your first study plan to get started with organized, goal-oriented learning that adapts to your schedule.
        </p>
        <div className="flex items-center justify-center gap-6 text-sm text-gray-500">
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            <span>Scheduled Sessions</span>
          </div>
          <div className="flex items-center gap-2">
            <Target className="h-4 w-4" />
            <span>Goal Tracking</span>
          </div>
          <div className="flex items-center gap-2">
            <Zap className="h-4 w-4" />
            <span>Progress Analytics</span>
          </div>
        </div>
      </Card>
    );
  }

  return (
    <div className="grid gap-8 md:grid-cols-2 xl:grid-cols-3">
      {plans.map((plan) => {
        const progress = calculateProgress(plan);
        const totalTopicHours = plan.topics.reduce((sum, topic) => sum + topic.estimated_hours, 0);
        
        return (
          <Card key={plan.id} className="group hover:shadow-xl transition-all duration-300 border-0 shadow-lg bg-gradient-to-br from-white to-gray-50/30 overflow-hidden">
            {/* Header */}
            <CardHeader className="pb-4 bg-gradient-to-r from-mint-50 to-blue-50 border-b border-gray-100">
              <div className="flex items-start justify-between mb-3">
                <Badge className={`${getStatusColor(plan.status)} font-medium px-3 py-1`}>
                  {plan.status.charAt(0).toUpperCase() + plan.status.slice(1)}
                </Badge>
                <Badge className={`${getDifficultyColor(plan.difficulty_level)} font-medium px-3 py-1`}>
                  {plan.difficulty_level.charAt(0).toUpperCase() + plan.difficulty_level.slice(1)}
                </Badge>
              </div>
              
              <CardTitle className="text-xl font-bold text-gray-900 line-clamp-2 group-hover:text-mint-700 transition-colors">
                {plan.title}
              </CardTitle>
              
              {plan.description && (
                <p className="text-sm text-gray-600 line-clamp-2 mt-2">
                  {plan.description}
                </p>
              )}
            </CardHeader>
            
            <CardContent className="p-6 space-y-6">
              {/* Subject & Progress */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-gray-700">
                    <BookOpen className="h-4 w-4 text-mint-600" />
                    <span className="font-medium">{plan.subject}</span>
                  </div>
                  <span className="text-sm font-medium text-gray-600">{progress}%</span>
                </div>
                <Progress value={progress} className="h-2" />
              </div>
              
              {/* Key Stats */}
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-mint-50 p-3 rounded-lg">
                  <div className="flex items-center gap-2 mb-1">
                    <Calendar className="h-4 w-4 text-mint-600" />
                    <span className="text-xs font-medium text-mint-700">Duration</span>
                  </div>
                  <div className="text-sm font-semibold text-gray-900">
                    {formatDateRange(plan.start_date, plan.end_date)}
                  </div>
                </div>
                
                <div className="bg-blue-50 p-3 rounded-lg">
                  <div className="flex items-center gap-2 mb-1">
                    <Clock className="h-4 w-4 text-blue-600" />
                    <span className="text-xs font-medium text-blue-700">Weekly</span>
                  </div>
                  <div className="text-sm font-semibold text-gray-900">
                    {plan.total_hours_per_week}h • {plan.preferred_session_duration}min
                  </div>
                </div>
              </div>
              
              {/* Schedule */}
              <div className="bg-purple-50 p-4 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <Users className="h-4 w-4 text-purple-600" />
                  <span className="text-sm font-medium text-purple-700">Schedule</span>
                </div>
                <div className="text-sm text-gray-900 font-medium">
                  {getScheduleSummary(plan.available_days, plan.available_times)}
                </div>
              </div>
              
              {/* Topics */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-700">
                    Topics ({plan.topics.length})
                  </span>
                  <span className="text-xs text-gray-500">
                    {totalTopicHours}h total
                  </span>
                </div>
                
                <div className="space-y-2 max-h-32 overflow-y-auto">
                  {plan.topics.slice(0, 4).map((topic, index) => (
                    <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded-md">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium text-gray-900 truncate">
                          {topic.name}
                        </span>
                        <Badge className={`${getPriorityColor(topic.priority)} text-xs px-2 py-0.5`}>
                          {topic.priority}
                        </Badge>
                      </div>
                      <span className="text-xs text-gray-500 font-medium">
                        {topic.estimated_hours}h
                      </span>
                    </div>
                  ))}
                  
                  {plan.topics.length > 4 && (
                    <div className="text-center">
                      <Badge variant="outline" className="text-xs">
                        +{plan.topics.length - 4} more topics
                      </Badge>
                    </div>
                  )}
                </div>
              </div>
              
              {/* Status Indicators */}
              <div className="flex items-center justify-between text-xs text-gray-500 pt-2 border-t border-gray-100">
                <span>Created {formatDistanceToNow(new Date(plan.created_at))} ago</span>
                <div className="flex items-center gap-3">
                  <span>{plan.available_days.length} days/week</span>
                </div>
              </div>
              
              {/* Actions */}
              <div className="space-y-3 pt-2">
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => onGenerateSessions(plan.id)}
                    disabled={isGenerating}
                    className="flex-1 h-9 hover:bg-mint-50 hover:border-mint-300 hover:text-mint-700"
                  >
                    <Play className="h-4 w-4 mr-2" />
                    {isGenerating ? 'Generating...' : 'Generate Sessions'}
                  </Button>
                  
                  {!plan.is_converted_to_goals && (
                    <Button
                      size="sm"
                      onClick={() => onConvertToGoals(plan.id)}
                      disabled={isConverting}
                      className="flex-1 h-9 bg-mint-500 hover:bg-mint-600 text-white"
                    >
                      <CheckCircle2 className="h-4 w-4 mr-2" />
                      {isConverting ? 'Converting...' : 'Create Goals'}
                    </Button>
                  )}
                </div>
                
                {plan.is_converted_to_goals && (
                  <div className="flex items-center justify-center gap-2 text-sm text-emerald-600 bg-emerald-50 p-3 rounded-lg border border-emerald-200">
                    <CheckCircle2 className="h-4 w-4" />
                    <span className="font-medium">Successfully converted to goals</span>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
};
