
import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar, Clock, Archive, Trash2, Pause } from 'lucide-react';
import { OverdueGoal, OverdueGoalActions } from '@/hooks/useOverdueGoalManager';

interface OverdueGoalActionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  goal: OverdueGoal | null;
  actions: OverdueGoalActions;
}

export const OverdueGoalActionDialog: React.FC<OverdueGoalActionDialogProps> = ({
  open,
  onOpenChange,
  goal,
  actions
}) => {
  const [selectedAction, setSelectedAction] = useState<string>('');
  const [extensionDays, setExtensionDays] = useState<string>('7');
  const [archiveReason, setArchiveReason] = useState<string>('');
  const [loading, setLoading] = useState(false);

  if (!goal) return null;

  const handleAction = async () => {
    if (!selectedAction) return;
    
    setLoading(true);
    let success = false;

    try {
      switch (selectedAction) {
        case 'extend':
          success = await actions.extendGoal(goal.goal_id, parseInt(extensionDays));
          break;
        case 'pause':
          success = await actions.pauseGoal(goal.goal_id);
          break;
        case 'archive':
          success = await actions.archiveGoal(goal.goal_id, archiveReason || 'Manual archive');
          break;
        case 'delete':
          success = await actions.deleteGoal(goal.goal_id);
          break;
      }

      if (success) {
        onOpenChange(false);
        setSelectedAction('');
        setArchiveReason('');
      }
    } finally {
      setLoading(false);
    }
  };

  const getActionIcon = (action: string) => {
    switch (action) {
      case 'extend': return <Calendar className="h-4 w-4" />;
      case 'pause': return <Pause className="h-4 w-4" />;
      case 'archive': return <Archive className="h-4 w-4" />;
      case 'delete': return <Trash2 className="h-4 w-4" />;
      default: return null;
    }
  };

  const getActionDescription = (action: string) => {
    switch (action) {
      case 'extend': return 'Give yourself more time to complete this goal';
      case 'pause': return 'Temporarily pause this goal without losing progress';
      case 'archive': return 'Archive this goal for future reference';
      case 'delete': return 'Permanently delete this goal (cannot be undone)';
      default: return '';
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5 text-amber-500" />
            Overdue Goal: {goal.title}
          </DialogTitle>
          <DialogDescription>
            This goal is {goal.days_overdue} day{goal.days_overdue !== 1 ? 's' : ''} overdue.
            {goal.in_grace_period && (
              <span className="text-amber-600 font-medium">
                {' '}Still within grace period.
              </span>
            )}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div>
            <Label htmlFor="action">What would you like to do?</Label>
            <Select value={selectedAction} onValueChange={setSelectedAction}>
              <SelectTrigger>
                <SelectValue placeholder="Choose an action" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="extend">
                  <div className="flex items-center gap-2">
                    {getActionIcon('extend')}
                    Extend deadline
                  </div>
                </SelectItem>
                <SelectItem value="pause">
                  <div className="flex items-center gap-2">
                    {getActionIcon('pause')}
                    Pause goal
                  </div>
                </SelectItem>
                <SelectItem value="archive">
                  <div className="flex items-center gap-2">
                    {getActionIcon('archive')}
                    Archive goal
                  </div>
                </SelectItem>
                <SelectItem value="delete">
                  <div className="flex items-center gap-2">
                    {getActionIcon('delete')}
                    Delete goal
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
            {selectedAction && (
              <p className="text-sm text-muted-foreground mt-2">
                {getActionDescription(selectedAction)}
              </p>
            )}
          </div>

          {selectedAction === 'extend' && (
            <div>
              <Label htmlFor="extensionDays">Extend by how many days?</Label>
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

          {selectedAction === 'archive' && (
            <div>
              <Label htmlFor="reason">Reason for archiving (optional)</Label>
              <Textarea
                id="reason"
                placeholder="Why are you archiving this goal?"
                value={archiveReason}
                onChange={(e) => setArchiveReason(e.target.value)}
                rows={3}
              />
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button 
            onClick={handleAction} 
            disabled={!selectedAction || loading}
            variant={selectedAction === 'delete' ? 'destructive' : 'default'}
          >
            {loading ? 'Processing...' : 'Confirm'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
