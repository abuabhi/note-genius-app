
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Link } from "react-router-dom";
import { 
  Target, 
  CheckCircle, 
  Calendar,
  ArrowRight
} from "lucide-react";
import { TodaysFocusOverdueItems } from "./TodaysFocusOverdueItems";
import { TodaysFocusGoals } from "./TodaysFocusGoals";
import { TodaysFocusReminders } from "./TodaysFocusReminders";
import { TodaysFocusTodos } from "./TodaysFocusTodos";
import { useTodaysFocusData } from "./hooks/useTodaysFocusData";
import { TodaysFocusEmptyState } from "./TodaysFocusEmptyState";
import { TodaysFocusQuickActions } from "./TodaysFocusQuickActions";
import { Suspense } from "react";

const TodaysFocusContent = () => {
  console.log('🎯 TodaysFocusSection rendering');
  
  const { todaysItems, isLoading, totalItems } = useTodaysFocusData();
  
  console.log('📊 TodaysFocus data:', { 
    todaysItems, 
    isLoading, 
    totalItems,
    hasOverdue: todaysItems?.overdue?.length || 0,
    hasTodos: todaysItems?.todos?.length || 0,
    hasGoals: todaysItems?.goals?.length || 0,
    hasReminders: todaysItems?.reminders?.length || 0
  });

  // Add specific debugging for todos
  console.log('📝 DEBUG - Todos from useTodaysFocusData:', todaysItems?.todos);
  console.log('📝 DEBUG - Todos type:', typeof todaysItems?.todos);
  console.log('📝 DEBUG - Todos array?:', Array.isArray(todaysItems?.todos));

  if (isLoading) {
    console.log('⏳ TodaysFocus is loading');
    return (
      <Card className="animate-pulse">
        <CardContent className="p-6">
          <div className="h-4 bg-gray-200 rounded w-1/2 mb-4"></div>
          <div className="space-y-2">
            <div className="h-3 bg-gray-200 rounded"></div>
            <div className="h-3 bg-gray-200 rounded w-3/4"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (totalItems === 0) {
    console.log('📋 No items to show, showing empty state');
    return <TodaysFocusEmptyState />;
  }

  console.log('✅ Rendering TodaysFocus with items');
  console.log('📝 About to render TodaysFocusTodos with:', todaysItems?.todos);
  
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg font-semibold flex items-center gap-2">
          <Target className="h-5 w-5 text-orange-600" />
          Today's Focus
          {todaysItems.overdue.length > 0 && (
            <Badge variant="destructive" className="ml-2">
              {todaysItems.overdue.length} overdue
            </Badge>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <TodaysFocusOverdueItems overdueItems={todaysItems.overdue} />
        <TodaysFocusTodos todos={todaysItems.todos} />
        <TodaysFocusGoals goals={todaysItems.goals} />
        <TodaysFocusReminders reminders={todaysItems.reminders} />
        <TodaysFocusQuickActions />
      </CardContent>
    </Card>
  );
};

export const TodaysFocusSection = () => {
  return (
    <Suspense fallback={
      <Card className="animate-pulse">
        <CardContent className="p-6">
          <div className="h-4 bg-gray-200 rounded w-1/2 mb-4"></div>
          <div className="space-y-2">
            <div className="h-3 bg-gray-200 rounded"></div>
            <div className="h-3 bg-gray-200 rounded w-3/4"></div>
          </div>
        </CardContent>
      </Card>
    }>
      <TodaysFocusContent />
    </Suspense>
  );
};
