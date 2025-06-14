
import React, { useEffect, useState } from 'react';
import { Bell, Target, Calendar, AlertTriangle, CheckCircle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { StudyGoal } from '@/hooks/useStudyGoals';
import { toast } from 'sonner';
import { differenceInDays, parseISO, isToday, isTomorrow } from 'date-fns';

interface GoalNotification {
  id: string;
  type: 'due_soon' | 'overdue' | 'milestone' | 'completion' | 'auto_archive_warning';
  goalId: string;
  goalTitle: string;
  message: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
  actionRequired: boolean;
  motivationalMessage?: string;
  suggestedAction?: string;
}

interface GoalNotificationsProps {
  goals: StudyGoal[];
  onGoalAction?: (goalId: string, action: string) => void;
}

export const GoalNotifications: React.FC<GoalNotificationsProps> = ({
  goals,
  onGoalAction
}) => {
  const [notifications, setNotifications] = useState<GoalNotification[]>([]);
  const [dismissedNotifications, setDismissedNotifications] = useState<Set<string>>(new Set());

  useEffect(() => {
    generateNotifications();
  }, [goals]);

  const generateNotifications = () => {
    const newNotifications: GoalNotification[] = [];

    goals.forEach(goal => {
      if (goal.is_completed || goal.status === 'archived' || goal.status === 'paused') {
        return;
      }

      const endDate = parseISO(goal.end_date);
      const today = new Date();
      const daysUntilDue = differenceInDays(endDate, today);
      const gracePeriodDays = goal.grace_period_days || 7;

      // Due soon notifications
      if (daysUntilDue === 1) {
        newNotifications.push({
          id: `due_tomorrow_${goal.id}`,
          type: 'due_soon',
          goalId: goal.id,
          goalTitle: goal.title,
          message: `"${goal.title}" is due tomorrow!`,
          priority: 'high',
          actionRequired: true,
          motivationalMessage: "You're so close! A final push can get you there.",
          suggestedAction: "Review your progress and plan your final study session"
        });
      } else if (daysUntilDue <= 3 && daysUntilDue > 0) {
        newNotifications.push({
          id: `due_soon_${goal.id}`,
          type: 'due_soon',
          goalId: goal.id,
          goalTitle: goal.title,
          message: `"${goal.title}" is due in ${daysUntilDue} days`,
          priority: 'medium',
          actionRequired: false,
          motivationalMessage: "Time to pick up the pace! You've got this.",
          suggestedAction: "Schedule focused study sessions for the remaining days"
        });
      }

      // Overdue notifications
      if (daysUntilDue < 0) {
        const daysOverdue = Math.abs(daysUntilDue);
        const inGracePeriod = daysOverdue <= gracePeriodDays;

        if (inGracePeriod) {
          newNotifications.push({
            id: `overdue_grace_${goal.id}`,
            type: 'overdue',
            goalId: goal.id,
            goalTitle: goal.title,
            message: `"${goal.title}" is ${daysOverdue} day${daysOverdue === 1 ? '' : 's'} overdue (grace period)`,
            priority: 'medium',
            actionRequired: true,
            motivationalMessage: "It's not too late to get back on track! Every step counts.",
            suggestedAction: "Consider extending the deadline or adjusting your target"
          });
        } else {
          newNotifications.push({
            id: `overdue_critical_${goal.id}`,
            type: 'overdue',
            goalId: goal.id,
            goalTitle: goal.title,
            message: `"${goal.title}" is ${daysOverdue} days overdue`,
            priority: 'critical',
            actionRequired: true,
            motivationalMessage: "Don't give up! Sometimes the best progress comes after setbacks.",
            suggestedAction: "Take action now - extend, modify, or archive this goal"
          });
        }
      }

      // Milestone notifications (progress-based)
      if (goal.progress >= 75 && goal.progress < 100 && daysUntilDue >= 0) {
        newNotifications.push({
          id: `milestone_75_${goal.id}`,
          type: 'milestone',
          goalId: goal.id,
          goalTitle: goal.title,
          message: `You're 75% complete with "${goal.title}"!`,
          priority: 'low',
          actionRequired: false,
          motivationalMessage: "Amazing progress! You're in the home stretch now.",
          suggestedAction: "Keep up the momentum - the finish line is in sight"
        });
      } else if (goal.progress >= 50 && goal.progress < 75 && daysUntilDue >= 0) {
        newNotifications.push({
          id: `milestone_50_${goal.id}`,
          type: 'milestone',
          goalId: goal.id,
          goalTitle: goal.title,
          message: `You're halfway through "${goal.title}"!`,
          priority: 'low',
          actionRequired: false,
          motivationalMessage: "Great job! You've hit the halfway mark.",
          suggestedAction: "Reflect on what's working and maintain your study rhythm"
        });
      }

      // Auto-archive warning (14+ days overdue)
      if (daysUntilDue < -10) {
        const daysOverdue = Math.abs(daysUntilDue);
        newNotifications.push({
          id: `archive_warning_${goal.id}`,
          type: 'auto_archive_warning',
          goalId: goal.id,
          goalTitle: goal.title,
          message: `"${goal.title}" will be auto-archived soon (${daysOverdue} days overdue)`,
          priority: 'high',
          actionRequired: true,
          motivationalMessage: "It's never too late for a fresh start!",
          suggestedAction: "Take action to save this goal or let it be archived"
        });
      }
    });

    // Filter out dismissed notifications
    const filteredNotifications = newNotifications.filter(
      notification => !dismissedNotifications.has(notification.id)
    );

    setNotifications(filteredNotifications);
  };

  const dismissNotification = (notificationId: string) => {
    setDismissedNotifications(prev => new Set([...prev, notificationId]));
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical': return 'bg-red-50 border-red-200';
      case 'high': return 'bg-orange-50 border-orange-200';
      case 'medium': return 'bg-yellow-50 border-yellow-200';
      case 'low': return 'bg-blue-50 border-blue-200';
      default: return 'bg-gray-50 border-gray-200';
    }
  };

  const getPriorityIcon = (type: string) => {
    switch (type) {
      case 'due_soon': return <Calendar className="h-4 w-4" />;
      case 'overdue': return <AlertTriangle className="h-4 w-4" />;
      case 'milestone': return <Target className="h-4 w-4" />;
      case 'completion': return <CheckCircle className="h-4 w-4" />;
      case 'auto_archive_warning': return <AlertTriangle className="h-4 w-4" />;
      default: return <Bell className="h-4 w-4" />;
    }
  };

  if (notifications.length === 0) {
    return null;
  }

  return (
    <Card className="border-blue-200 bg-blue-50">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-blue-800">
          <Bell className="h-5 w-5" />
          Goal Notifications ({notifications.length})
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {notifications.map((notification) => (
          <div
            key={notification.id}
            className={`p-4 rounded-lg border ${getPriorityColor(notification.priority)}`}
          >
            <div className="flex items-start justify-between">
              <div className="flex items-start gap-3 flex-1">
                {getPriorityIcon(notification.type)}
                <div className="flex-1">
                  <div className="font-medium mb-1">{notification.message}</div>
                  
                  {notification.motivationalMessage && (
                    <div className="text-sm text-muted-foreground mb-2 italic">
                      💪 {notification.motivationalMessage}
                    </div>
                  )}
                  
                  {notification.suggestedAction && (
                    <div className="text-sm text-blue-700 bg-blue-100 p-2 rounded mt-2">
                      💡 <strong>Suggested:</strong> {notification.suggestedAction}
                    </div>
                  )}
                </div>
              </div>
              
              <div className="flex items-center gap-2 ml-4">
                <Badge variant={notification.priority === 'critical' ? 'destructive' : 'secondary'}>
                  {notification.priority}
                </Badge>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => dismissNotification(notification.id)}
                >
                  ×
                </Button>
              </div>
            </div>

            {notification.actionRequired && onGoalAction && (
              <div className="mt-3 flex gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => onGoalAction(notification.goalId, 'view')}
                >
                  View Goal
                </Button>
                {notification.type === 'overdue' && (
                  <Button
                    size="sm"
                    onClick={() => onGoalAction(notification.goalId, 'extend')}
                  >
                    Extend Deadline
                  </Button>
                )}
              </div>
            )}
          </div>
        ))}
      </CardContent>
    </Card>
  );
};
