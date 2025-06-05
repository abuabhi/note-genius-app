
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { 
  Clock, 
  BookOpen, 
  Brain, 
  FileText, 
  Play,
  ArrowRight,
  Calendar
} from "lucide-react";
import { useRecentActivity } from "@/hooks/useRecentActivity";

export const RecentActivityTimeline = () => {
  const { activities, isLoading } = useRecentActivity();

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'study_session':
        return <Clock className="h-4 w-4" />;
      case 'quiz_completed':
        return <Brain className="h-4 w-4" />;
      case 'note_created':
        return <FileText className="h-4 w-4" />;
      default:
        return <BookOpen className="h-4 w-4" />;
    }
  };

  const getActivityColor = (type: string) => {
    switch (type) {
      case 'study_session':
        return 'text-blue-600 bg-blue-50 border-blue-200';
      case 'quiz_completed':
        return 'text-purple-600 bg-purple-50 border-purple-200';
      case 'note_created':
        return 'text-green-600 bg-green-50 border-green-200';
      default:
        return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  if (isLoading) {
    return (
      <Card className="animate-pulse">
        <CardContent className="p-6">
          <div className="space-y-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="flex items-center gap-4">
                <div className="h-10 w-10 bg-gray-200 rounded-full"></div>
                <div className="flex-1">
                  <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (activities.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-lg font-semibold flex items-center gap-2">
            <Calendar className="h-5 w-5 text-gray-600" />
            Recent Activity
          </CardTitle>
        </CardHeader>
        <CardContent className="text-center py-8">
          <div className="text-gray-500 mb-4">
            <BookOpen className="h-12 w-12 mx-auto mb-2 opacity-50" />
            <p>No recent activity yet</p>
            <p className="text-sm">Start studying to see your progress here!</p>
          </div>
          <Button asChild>
            <Link to="/flashcards">
              Start Studying
              <Play className="h-4 w-4 ml-2" />
            </Link>
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-lg font-semibold flex items-center gap-2">
          <Calendar className="h-5 w-5 text-gray-600" />
          Recent Activity
        </CardTitle>
        <Button asChild variant="ghost" size="sm">
          <Link to="/study-sessions">
            View All
            <ArrowRight className="h-4 w-4 ml-1" />
          </Link>
        </Button>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {activities.slice(0, 6).map((activity) => (
            <div key={activity.id} className="flex items-start gap-4 group hover:bg-gray-50 rounded-lg p-2 -m-2 transition-colors">
              <div className={`flex items-center justify-center w-10 h-10 rounded-full border-2 ${getActivityColor(activity.type)}`}>
                {getActivityIcon(activity.type)}
              </div>
              
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h4 className="font-medium text-gray-900 truncate">{activity.title}</h4>
                    <p className="text-sm text-gray-600 mt-1">{activity.description}</p>
                  </div>
                  
                  <div className="ml-4 text-right flex-shrink-0">
                    <Badge variant="outline" className="text-xs">
                      {activity.type.replace('_', ' ')}
                    </Badge>
                    <div className="text-xs text-gray-500 mt-1">
                      {activity.relativeTime}
                    </div>
                  </div>
                </div>

                {/* Metadata */}
                {activity.metadata && (
                  <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
                    {activity.metadata.duration && (
                      <span>⏱️ {Math.round(activity.metadata.duration / 60)}min</span>
                    )}
                    {activity.metadata.cardsReviewed && (
                      <span>🧠 {activity.metadata.cardsReviewed} cards</span>
                    )}
                    {activity.metadata.score && activity.metadata.totalQuestions && (
                      <span>🎯 {Math.round((activity.metadata.score / activity.metadata.totalQuestions) * 100)}%</span>
                    )}
                    {activity.metadata.subject && (
                      <span>📚 {activity.metadata.subject}</span>
                    )}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        {activities.length > 6 && (
          <div className="mt-6 text-center">
            <Button asChild variant="outline" size="sm">
              <Link to="/study-sessions">
                View {activities.length - 6} More Activities
                <ArrowRight className="h-4 w-4 ml-2" />
              </Link>
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
