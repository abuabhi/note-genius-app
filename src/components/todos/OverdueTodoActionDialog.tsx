
import React, { useState } from 'react';
import { Calendar, Clock, Archive, Trash2 } from 'lucide-react';
import { format } from 'date-fns';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Calendar as CalendarComponent } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { OverdueTodo, OverdueTodoActions } from '@/hooks/useOverdueTodoManager';

interface OverdueTodoActionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  todo: OverdueTodo | null;
  actions: OverdueTodoActions;
}

export const OverdueTodoActionDialog: React.FC<OverdueTodoActionDialogProps> = ({
  open,
  onOpenChange,
  todo,
  actions
}) => {
  const [actionType, setActionType] = useState<'extend' | 'archive' | 'delete' | null>(null);
  const [newDate, setNewDate] = useState<Date | undefined>(undefined);
  const [archiveReason, setArchiveReason] = useState('');
  const [loading, setLoading] = useState(false);

  if (!todo) return null;

  const handleAction = async () => {
    if (!actionType || loading) return;

    setLoading(true);
    try {
      switch (actionType) {
        case 'extend':
          if (newDate) {
            await actions.extendDeadline(todo.todo_id, format(newDate, 'yyyy-MM-dd'));
          }
          break;
        case 'archive':
          await actions.archiveTodos([todo.todo_id], archiveReason || 'Manually archived');
          break;
        case 'delete':
          await actions.deleteTodos([todo.todo_id]);
          break;
      }
      onOpenChange(false);
      resetDialog();
    } catch (error) {
      console.error('Error performing action:', error);
    } finally {
      setLoading(false);
    }
  };

  const resetDialog = () => {
    setActionType(null);
    setNewDate(undefined);
    setArchiveReason('');
  };

  const handleClose = () => {
    onOpenChange(false);
    resetDialog();
  };

  if (!actionType) {
    return (
      <Dialog open={open} onOpenChange={handleClose}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Manage Overdue Todo</DialogTitle>
            <DialogDescription>
              "{todo.title}" is {todo.days_overdue} days overdue. What would you like to do?
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-3">
            <Button
              variant="outline"
              className="w-full flex items-center gap-2 justify-start h-auto p-4"
              onClick={() => setActionType('extend')}
            >
              <Calendar className="h-4 w-4 text-blue-500" />
              <div className="text-left">
                <div className="font-medium">Extend Deadline</div>
                <div className="text-sm text-muted-foreground">Set a new due date</div>
              </div>
            </Button>

            <Button
              variant="outline"
              className="w-full flex items-center gap-2 justify-start h-auto p-4"
              onClick={() => actions.markUrgent([todo.todo_id])}
            >
              <Clock className="h-4 w-4 text-orange-500" />
              <div className="text-left">
                <div className="font-medium">Mark as Urgent</div>
                <div className="text-sm text-muted-foreground">Increase priority level</div>
              </div>
            </Button>

            <Button
              variant="outline"
              className="w-full flex items-center gap-2 justify-start h-auto p-4"
              onClick={() => setActionType('archive')}
            >
              <Archive className="h-4 w-4 text-gray-500" />
              <div className="text-left">
                <div className="font-medium">Archive Todo</div>
                <div className="text-sm text-muted-foreground">Move to archive with reason</div>
              </div>
            </Button>

            <Button
              variant="outline"
              className="w-full flex items-center gap-2 justify-start h-auto p-4 text-red-600 hover:text-red-700"
              onClick={() => setActionType('delete')}
            >
              <Trash2 className="h-4 w-4" />
              <div className="text-left">
                <div className="font-medium">Delete Todo</div>
                <div className="text-sm text-muted-foreground">Permanently remove this todo</div>
              </div>
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>
            {actionType === 'extend' && 'Extend Deadline'}
            {actionType === 'archive' && 'Archive Todo'}
            {actionType === 'delete' && 'Delete Todo'}
          </DialogTitle>
          <DialogDescription>
            {actionType === 'extend' && 'Choose a new due date for this todo.'}
            {actionType === 'archive' && 'Provide a reason for archiving this todo.'}
            {actionType === 'delete' && 'This action cannot be undone.'}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {actionType === 'extend' && (
            <div>
              <Label htmlFor="new-date">New Due Date</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className="w-full justify-start text-left font-normal"
                  >
                    <Calendar className="mr-2 h-4 w-4" />
                    {newDate ? format(newDate, "PPP") : "Pick a date"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <CalendarComponent
                    mode="single"
                    selected={newDate}
                    onSelect={setNewDate}
                    disabled={(date) => date <= new Date()}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
          )}

          {actionType === 'archive' && (
            <div>
              <Label htmlFor="archive-reason">Archive Reason</Label>
              <Textarea
                id="archive-reason"
                placeholder="Why are you archiving this todo?"
                value={archiveReason}
                onChange={(e) => setArchiveReason(e.target.value)}
              />
            </div>
          )}

          {actionType === 'delete' && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm text-red-800">
                Are you sure you want to delete "{todo.title}"? This action cannot be undone.
              </p>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleClose} disabled={loading}>
            Cancel
          </Button>
          <Button
            onClick={handleAction}
            disabled={loading || (actionType === 'extend' && !newDate)}
            variant={actionType === 'delete' ? 'destructive' : 'default'}
          >
            {loading ? 'Processing...' : 
              actionType === 'extend' ? 'Extend Deadline' :
              actionType === 'archive' ? 'Archive Todo' :
              'Delete Todo'
            }
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
