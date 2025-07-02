
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar, Clock, BookOpen, Plus } from "lucide-react";
import { Link } from "react-router-dom";
import { useActiveStudyPlans } from "@/hooks/useActiveStudyPlans";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";

export const StudyPlannerSection = () => {
  const { studyPlans, isLoading } = useActiveStudyPlans();

  // Filter for today's study plans
  const todaysPlans = studyPlans.filter(plan => {
    // Show active plans for today
    return plan.status === 'active' && plan.study_days.includes(format(new Date(), 'EEEE').toLowerCase());
  }).slice(0, 3); // Show only top 3

  if (isLoading) {
    return (
      <Card className="bg-white border-mint-200">
        <CardHeader>
          <CardTitle className="text-lg font-semibold flex items-center gap-2">
            <div className="p-1.5 bg-gradient-to-br from-mint-500 to-mint-600 rounded-lg">
              <Calendar className="h-4 w-4 text-white" />
            </div>
            Study Plans
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {[1, 2].map(i => (
            <div key={i} className="p-3 border border-gray-100 rounded-lg bg-white">
              <Skeleton className="h-4 w-3/4 mb-2" />
              <Skeleton className="h-3 w-1/2" />
            </div>
          ))}
        </CardContent>
      </Card>
    );
  }

  if (todaysPlans.length === 0) {
    return (
      <Card className="bg-white border-mint-200">
        <CardHeader>
          <CardTitle className="text-lg font-semibold flex items-center gap-2">
            <div className="p-1.5 bg-gradient-to-br from-mint-500 to-mint-600 rounded-lg">
              <Calendar className="h-4 w-4 text-white" />
            </div>
            Study Plans
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <div className="mb-4">
              <div className="p-3 bg-mint-100 rounded-full w-fit mx-auto">
                <Calendar className="h-8 w-8 text-mint-500" />
              </div>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No study plans yet</h3>
            <p className="text-gray-500 mb-4">
              Create a study plan to organize your learning schedule and track progress.
            </p>
            <Button asChild className="bg-gradient-to-r from-mint-500 to-mint-600 hover:from-mint-600 hover:to-mint-700">
              <Link to="/study-planner">
                <Plus className="h-4 w-4 mr-2" />
                Create Study Plan
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-white border-mint-200">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-semibold flex items-center gap-2">
            <div className="p-1.5 bg-gradient-to-br from-mint-500 to-mint-600 rounded-lg">
              <Calendar className="h-4 w-4 text-white" />
            </div>
            Study Plans
            {todaysPlans.length > 0 && (
              <Badge variant="secondary" className="text-xs">
                {todaysPlans.length} active
              </Badge>
            )}
          </CardTitle>
          <Button asChild size="sm" variant="outline">
            <Link to="/study-planner">
              <Plus className="h-4 w-4 mr-1" />
              New Plan
            </Link>
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {todaysPlans.map(plan => (
          <div key={plan.id} className="p-4 border border-mint-100 rounded-xl bg-white hover:bg-mint-50 transition-all duration-200">
            <div className="flex items-start justify-between mb-2">
              <div className="flex-1 min-w-0">
                <h4 className="font-medium text-sm text-gray-800 line-clamp-1">{plan.title}</h4>
                {plan.topic && (
                  <p className="text-xs text-gray-600 mt-1 line-clamp-1">{plan.topic}</p>
                )}
              </div>
              <div className="flex items-center gap-2 ml-3">
                <Badge 
                  variant="outline" 
                  className="text-xs bg-mint-100 text-mint-700 border-mint-200"
                >
                  Active
                </Badge>
              </div>
            </div>
            
            <div className="flex items-center gap-4 mt-2">
              <div className="flex items-center gap-1">
                <Clock className="h-3 w-3 text-mint-500" />
                <span className="text-xs text-mint-600 font-medium">
                  {plan.daily_duration_minutes}min daily
                </span>
              </div>
              <div className="flex items-center gap-1">
                <BookOpen className="h-3 w-3 text-mint-500" />
                <span className="text-xs text-mint-600 font-medium">
                  {plan.completion_percentage}% complete
                </span>
              </div>
            </div>
          </div>
        ))}
        
        <div className="pt-3 border-t border-mint-100">
          <Button variant="ghost" size="sm" asChild className="w-full text-mint-600 hover:text-mint-700 hover:bg-mint-50">
            <Link to="/study-planner" className="text-sm font-medium">
              View All Study Plans
            </Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
