
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { AlertTriangle, Calendar, Clock } from 'lucide-react';
import { useOverdueGoalManager, OverdueGoal } from '@/hooks/useOverdueGoalManager';
import { OverdueGoalActionDialog } from './OverdueGoalActionDialog';
import { formatDistanceToNow, parseISO } from 'date-fns';

export const OverdueGoalsSection: React.FC = () => {
  const { overdueGoals, loading, actions } = useOverdueGoalManager();
  const [selectedGoal, setSelectedGoal] = useState<OverdueGoal | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);

  if (loading) {
    return (
      <Card className="border-amber-200 bg-amber-50">
        <CardHeader>
          <CardTitle className="text-amber-800">Loading overdue goals...</CardTitle>
        </CardHeader>
      </Card>
    );
  }

  if (overdueGoals.length === 0) {
    return null; // Don't show section if no overdue goals
  }

  const handleGoalAction = (goal: OverdueGoal) => {
    setSelectedGoal(goal);
    setDialogOpen(true);
  };

  const gracePeriodGoals = overdueGoals.filter(goal => goal.in_grace_period);
  const criticalGoals = overdueGoals.filter(goal => !goal.in_grace_period);

  return (
    <>
      <Card className="border-amber-200 bg-amber-50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-amber-800">
            <AlertTriangle className="h-5 w-5" />
            Overdue Goals ({overdueGoals.length})
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {criticalGoals.length > 0 && (
            <div>
              <h4 className="font-medium text-red-800 mb-2 flex items-center gap-2">
                <Clock className="h-4 w-4" />
                Critical (Past Grace Period)
              </h4>
              <div className="space-y-2">
                {criticalGoals.map((goal) => (
                  <div
                    key={goal.goal_id}
                    className="flex items-center justify-between p-3 bg-red-50 border border-red-200 rounded-lg"
                  >
                    <div className="flex-1">
                      <div className="font-medium text-red-900">{goal.title}</div>
                      <div className="text-sm text-red-700">
                        Due {formatDistanceToNow(parseISO(goal.end_date), { addSuffix: true })}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="destructive">
                        {goal.days_overdue} days overdue
                      </Badge>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleGoalAction(goal)}
                        className="border-red-300 hover:bg-red-100"
                      >
                        Take Action
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {gracePeriodGoals.length > 0 && (
            <div>
              <h4 className="font-medium text-amber-800 mb-2 flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                In Grace Period
              </h4>
              <div className="space-y-2">
                {gracePeriodGoals.map((goal) => (
                  <div
                    key={goal.goal_id}
                    className="flex items-center justify-between p-3 bg-amber-50 border border-amber-200 rounded-lg"
                  >
                    <div className="flex-1">
                      <div className="font-medium text-amber-900">{goal.title}</div>
                      <div className="text-sm text-amber-700">
                        Due {formatDistanceToNow(parseISO(goal.end_date), { addSuffix: true })}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="secondary" className="bg-amber-100 text-amber-800">
                        {goal.days_overdue} days overdue
                      </Badge>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleGoalAction(goal)}
                        className="border-amber-300 hover:bg-amber-100"
                      >
                        Manage
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <OverdueGoalActionDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        goal={selectedGoal}
        actions={actions}
      />
    </>
  );
};
