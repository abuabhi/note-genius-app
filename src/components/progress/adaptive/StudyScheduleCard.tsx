
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calendar, Clock, BookOpen, Target, ChevronRight } from "lucide-react";
import { Link } from "react-router-dom";

export const StudyScheduleCard = () => {
  const today = new Date();
  const todayStr = today.toLocaleDateString('en-US', { 
    weekday: 'long', 
    month: 'short', 
    day: 'numeric' 
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calendar className="h-5 w-5 text-blue-600" />
          AI Study Schedule
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Today's Schedule */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-medium text-gray-900">Today, {todayStr}</h3>
            <Badge variant="outline" className="text-xs">Optimized</Badge>
          </div>
          
          {/* Empty State - Before User Starts Studying */}
          <div className="text-center py-6">
            <Clock className="h-12 w-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-600 mb-4">
              Your personalized study schedule will appear here once you begin studying.
            </p>
            
            {/* Quick Start Actions */}
            <div className="space-y-2">
              <Button asChild size="sm" className="w-full bg-blue-600 hover:bg-blue-700">
                <Link to="/flashcards" className="flex items-center justify-center gap-2">
                  <BookOpen className="h-4 w-4" />
                  Start with Flashcards
                  <ChevronRight className="h-4 w-4" />
                </Link>
              </Button>
              
              <Button asChild variant="outline" size="sm" className="w-full border-blue-200 hover:bg-blue-50">
                <Link to="/quizzes" className="flex items-center justify-center gap-2">
                  <Target className="h-4 w-4" />
                  Begin with Quiz
                  <ChevronRight className="h-4 w-4" />
                </Link>
              </Button>
            </div>
          </div>
        </div>

        {/* Preview Schedule Items (shown dimmed) */}
        <div className="space-y-3 opacity-40">
          <div className="border border-gray-200 rounded-lg p-3">
            <div className="flex items-center justify-between mb-1">
              <span className="text-sm font-medium">Mathematics Review</span>
              <span className="text-xs text-gray-500">20 min</span>
            </div>
            <div className="text-xs text-gray-600">Recommended based on your progress</div>
          </div>
          
          <div className="border border-gray-200 rounded-lg p-3">
            <div className="flex items-center justify-between mb-1">
              <span className="text-sm font-medium">Science Quiz</span>
              <span className="text-xs text-gray-500">15 min</span>
            </div>
            <div className="text-xs text-gray-600">Optimal difficulty level</div>
          </div>
        </div>

        <div className="text-xs text-gray-500 text-center pt-4 border-t">
          Schedule adapts to your learning patterns and optimal study times.
        </div>
      </CardContent>
    </Card>
  );
};
