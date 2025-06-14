
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { 
  Calendar, 
  Archive, 
  Trash2, 
  Clock, 
  CheckSquare,
  Square,
  AlertTriangle
} from 'lucide-react';
import { OverdueGoal, OverdueGoalActions } from '@/hooks/useOverdueGoalManager';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';

interface BulkOverdueActionsProps {
  overdueGoals: OverdueGoal[];
  actions: OverdueGoalActions;
  onRefresh: () => void;
}

export const BulkOverdueActions: React.FC<BulkOverdueActionsProps> = ({
  overdueGoals,
  actions,
  onRefresh
}) => {
  const [selectedGoals, setSelectedGoals] = useState<Set<string>>(new Set());
  const [bulkAction, setBulkAction] = useState<string>('');
  const [extensionDays, setExtensionDays] = useState<string>('7');
  const [archiveReason, setArchiveReason] = useState<string>('');
  const [isProcessing, setIsProcessing] = useState(false);

  if (overdueGoals.length === 0) {
    return null;
  }

  const toggleGoalSelection = (goalId: string) => {
    const newSelected = new Set(selectedGoals);
    if (newSelected.has(goalId)) {
      newSelected.delete(goalId);
    } else {
      newSelected.add(goalId);
    }
    setSelectedGoals(newSelected);
  };

  const toggleSelectAll = () => {
    if (selectedGoals.size === overdueGoals.length) {
      setSelectedGoals(new Set());
    } else {
      setSelectedGoals(new Set(overdueGoals.map(goal => goal.goal_id)));
    }
  };

  const handleBulkAction = async () => {
    if (selectedGoals.size === 0 || !bulkAction) {
      toast.error('Please select goals and an action');
      return;
    }

    setIsProcessing(true);
    const goalIds = Array.from(selectedGoals);
    let successCount = 0;

    try {
      switch (bulkAction) {
        case 'extend':
          for (const goalId of goalIds) {
            const success = await actions.extendGoal(goalId, parseInt(extensionDays));
            if (success) successCount++;
          }
          break;
        case 'pause':
          for (const goalId of goalIds) {
            const success = await actions.pauseGoal(goalId);
            if (success) successCount++;
          }
          break;
        case 'archive':
          for (const goalId of goalIds) {
            const success = await actions.archiveGoal(goalId, archiveReason || 'Bulk archive');
            if (success) successCount++;
          }
          break;
        case 'delete':
          for (const goalId of goalIds) {
            const success = await actions.deleteGoal(goalId);
            if (success) successCount++;
          }
          break;
      }

      toast.success(`Successfully processed ${successCount} out of ${goalIds.length} goals`);
      setSelectedGoals(new Set());
      setBulkAction('');
      setArchiveReason('');
      onRefresh();
    } catch (error) {
      console.error('Error processing bulk action:', error);
      toast.error('Failed to process bulk action');
    } finally {
      setIsProcessing(false);
    }
  };

  const criticalGoals = overdueGoals.filter(goal => !goal.in_grace_period);
  const gracePeriodGoals = overdueGoals.filter(goal => goal.in_grace_period);

  return (
    <Card className="border-orange-200 bg-orange-50">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-orange-800">
            <CheckSquare className="h-5 w-5" />
            Bulk Actions for Overdue Goals
          </div>
          <Badge variant="outline" className="bg-orange-100 text-orange-800">
            {selectedGoals.size} selected
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Selection Controls */}
        <div className="flex items-center gap-2 mb-4">
          <Button
            variant="outline"
            size="sm"
            onClick={toggleSelectAll}
            className="flex items-center gap-2"
          >
            {selectedGoals.size === overdueGoals.length ? (
              <CheckSquare className="h-4 w-4" />
            ) : (
              <Square className="h-4 w-4" />
            )}
            {selectedGoals.size === overdueGoals.length ? 'Deselect All' : 'Select All'}
          </Button>
        </div>

        {/* Critical Goals */}
        {criticalGoals.length > 0 && (
          <div>
            <h4 className="font-medium text-red-800 mb-2 flex items-center gap-2">
              <AlertTriangle className="h-4 w-4" />
              Critical Goals ({criticalGoals.length})
            </h4>
            <div className="space-y-2">
              {criticalGoals.map((goal) => (
                <div
                  key={goal.goal_id}
                  className="flex items-center justify-between p-3 bg-red-50 border border-red-200 rounded-lg"
                >
                  <div className="flex items-center gap-3">
                    <Checkbox
                      checked={selectedGoals.has(goal.goal_id)}
                      onCheckedChange={() => toggleGoalSelection(goal.goal_id)}
                    />
                    <div className="flex-1">
                      <div className="font-medium text-red-900">{goal.title}</div>
                      <div className="text-sm text-red-700">
                        {goal.days_overdue} days overdue
                      </div>
                    </div>
                  </div>
                  <Badge variant="destructive">Critical</Badge>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Grace Period Goals */}
        {gracePeriodGoals.length > 0 && (
          <div>
            <h4 className="font-medium text-amber-800 mb-2 flex items-center gap-2">
              <Clock className="h-4 w-4" />
              In Grace Period ({gracePeriodGoals.length})
            </h4>
            <div className="space-y-2">
              {gracePeriodGoals.map((goal) => (
                <div
                  key={goal.goal_id}
                  className="flex items-center justify-between p-3 bg-amber-50 border border-amber-200 rounded-lg"
                >
                  <div className="flex items-center gap-3">
                    <Checkbox
                      checked={selectedGoals.has(goal.goal_id)}
                      onCheckedChange={() => toggleGoalSelection(goal.goal_id)}
                    />
                    <div className="flex-1">
                      <div className="font-medium text-amber-900">{goal.title}</div>
                      <div className="text-sm text-amber-700">
                        {goal.days_overdue} days overdue
                      </div>
                    </div>
                  </div>
                  <Badge variant="secondary" className="bg-amber-100 text-amber-800">
                    Grace Period
                  </Badge>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Bulk Action Controls */}
        {selectedGoals.size > 0 && (
          <div className="border-t pt-4 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium mb-2 block">Bulk Action</label>
                <Select value={bulkAction} onValueChange={setBulkAction}>
                  <SelectTrigger>
                    <SelectValue placeholder="Choose action" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="extend">
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4" />
                        Extend deadlines
                      </div>
                    </SelectItem>
                    <SelectItem value="pause">
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4" />
                        Pause goals
                      </div>
                    </SelectItem>
                    <SelectItem value="archive">
                      <div className="flex items-center gap-2">
                        <Archive className="h-4 w-4" />
                        Archive goals
                      </div>
                    </SelectItem>
                    <SelectItem value="delete">
                      <div className="flex items-center gap-2">
                        <Trash2 className="h-4 w-4" />
                        Delete goals
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {bulkAction === 'extend' && (
                <div>
                  <label className="text-sm font-medium mb-2 block">Extend by</label>
                  <Select value={extensionDays} onValueChange={setExtensionDays}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="3">3 days</SelectItem>
                      <SelectItem value="7">1 week</SelectItem>
                      <SelectItem value="14">2 weeks</SelectItem>
                      <SelectItem value="30">1 month</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              )}
            </div>

            {bulkAction === 'archive' && (
              <div>
                <label className="text-sm font-medium mb-2 block">Archive Reason</label>
                <Textarea
                  placeholder="Why are you archiving these goals?"
                  value={archiveReason}
                  onChange={(e) => setArchiveReason(e.target.value)}
                  rows={2}
                />
              </div>
            )}

            <Button
              onClick={handleBulkAction}
              disabled={!bulkAction || isProcessing}
              variant={bulkAction === 'delete' ? 'destructive' : 'default'}
              className="w-full"
            >
              {isProcessing ? 'Processing...' : `Apply to ${selectedGoals.size} goal${selectedGoals.size === 1 ? '' : 's'}`}
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
