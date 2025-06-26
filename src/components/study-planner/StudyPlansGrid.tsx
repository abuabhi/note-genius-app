
import { StudyPlan } from '@/types/studyPlanner';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Calendar, Clock, Target, Play, CheckCircle2 } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

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
      case 'active': return 'bg-green-100 text-green-800';
      case 'paused': return 'bg-yellow-100 text-yellow-800';
      case 'completed': return 'bg-blue-100 text-blue-800';
      case 'archived': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getDifficultyColor = (level: string) => {
    switch (level) {
      case 'beginner': return 'bg-green-100 text-green-800';
      case 'intermediate': return 'bg-yellow-100 text-yellow-800';
      case 'advanced': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (plans.length === 0) {
    return (
      <Card className="p-8 text-center">
        <Target className="h-12 w-12 text-gray-300 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">No Study Plans Yet</h3>
        <p className="text-gray-500 mb-4">
          Create your first study plan to get started with organized learning.
        </p>
      </Card>
    );
  }

  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
      {plans.map((plan) => (
        <Card key={plan.id} className="hover:shadow-md transition-shadow">
          <CardHeader className="pb-3">
            <div className="flex justify-between items-start">
              <CardTitle className="text-lg line-clamp-2">{plan.title}</CardTitle>
              <Badge className={getStatusColor(plan.status)}>
                {plan.status}
              </Badge>
            </div>
            <p className="text-sm text-gray-600 line-clamp-2">
              {plan.description || 'No description'}
            </p>
          </CardHeader>
          
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center text-gray-600">
                <Target className="h-4 w-4 mr-1" />
                {plan.subject}
              </div>
              <Badge className={getDifficultyColor(plan.difficulty_level)}>
                {plan.difficulty_level}
              </Badge>
            </div>
            
            <div className="space-y-2 text-sm text-gray-600">
              <div className="flex items-center">
                <Calendar className="h-4 w-4 mr-2" />
                {new Date(plan.start_date).toLocaleDateString()} - {new Date(plan.end_date).toLocaleDateString()}
              </div>
              <div className="flex items-center">
                <Clock className="h-4 w-4 mr-2" />
                {plan.total_hours_per_week} hours/week • {plan.preferred_session_duration}min sessions
              </div>
            </div>
            
            <div>
              <div className="text-sm font-medium mb-2">Topics ({plan.topics.length})</div>
              <div className="flex flex-wrap gap-1">
                {plan.topics.slice(0, 3).map((topic, index) => (
                  <Badge key={index} variant="outline" className="text-xs">
                    {topic.name}
                  </Badge>
                ))}
                {plan.topics.length > 3 && (
                  <Badge variant="outline" className="text-xs">
                    +{plan.topics.length - 3} more
                  </Badge>
                )}
              </div>
            </div>
            
            <div className="flex items-center justify-between text-xs text-gray-500">
              <span>Created {formatDistanceToNow(new Date(plan.created_at))} ago</span>
              <div className="flex items-center gap-1">
                {plan.available_days.length} days/week
              </div>
            </div>
            
            <div className="flex gap-2 pt-2">
              <Button
                size="sm"
                variant="outline"
                onClick={() => onGenerateSessions(plan.id)}
                disabled={isGenerating}
                className="flex-1"
              >
                <Play className="h-4 w-4 mr-1" />
                Generate Sessions
              </Button>
              {!plan.is_converted_to_goals && (
                <Button
                  size="sm"
                  onClick={() => onConvertToGoals(plan.id)}
                  disabled={isConverting}
                  className="flex-1"
                >
                  <CheckCircle2 className="h-4 w-4 mr-1" />
                  Convert to Goals
                </Button>
              )}
            </div>
            
            {plan.is_converted_to_goals && (
              <div className="flex items-center gap-1 text-sm text-green-600 bg-green-50 p-2 rounded">
                <CheckCircle2 className="h-4 w-4" />
                Converted to Goals
              </div>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  );
};
