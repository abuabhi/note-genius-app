
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { StudyPlanSession } from '@/types/studyPlanner';
import { useSessionGoalIntegration } from '@/hooks/useSessionGoalIntegration';
import { Target, CheckSquare, Calendar, Clock } from 'lucide-react';
import { format } from 'date-fns';

interface SessionLinkingDialogProps {
  session: StudyPlanSession | null;
  isOpen: boolean;
  onClose: () => void;
}

export const SessionLinkingDialog = ({
  session,
  isOpen,
  onClose,
}: SessionLinkingDialogProps) => {
  const [selectedGoal, setSelectedGoal] = useState('');
  const [selectedTodo, setSelectedTodo] = useState('');
  const [linkType, setLinkType] = useState<'goal' | 'todo'>('goal');

  const {
    linkableGoals,
    linkableTodos,
    linkToGoal,
    linkToTodo,
    isLinking,
  } = useSessionGoalIntegration();

  const handleLinkToGoal = async () => {
    if (!session || !selectedGoal) return;
    
    await linkToGoal({ sessionId: session.id, goalId: selectedGoal });
    onClose();
  };

  const handleLinkToTodo = async () => {
    if (!session || !selectedTodo) return;
    
    await linkToTodo({ sessionId: session.id, todoId: selectedTodo });
    onClose();
  };

  if (!session) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            Link Session to Goals or Todos
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Session Info */}
          <div className="bg-gray-50 rounded-lg p-4">
            <h3 className="font-medium">{session.title}</h3>
            <div className="flex items-center gap-4 mt-2 text-sm text-gray-600">
              <div className="flex items-center gap-1">
                <Calendar className="h-4 w-4" />
                {format(new Date(session.scheduled_date), 'MMM dd, yyyy')}
              </div>
              <div className="flex items-center gap-1">
                <Clock className="h-4 w-4" />
                {session.duration_minutes} min
              </div>
            </div>
          </div>

          {/* Link Type Selection */}
          <div>
            <label className="block text-sm font-medium mb-2">Link to:</label>
            <div className="flex gap-2">
              <Button
                variant={linkType === 'goal' ? 'default' : 'outline'}
                onClick={() => setLinkType('goal')}
                className="flex-1"
              >
                <Target className="h-4 w-4 mr-2" />
                Goal
              </Button>
              <Button
                variant={linkType === 'todo' ? 'default' : 'outline'}
                onClick={() => setLinkType('todo')}
                className="flex-1"
              >
                <CheckSquare className="h-4 w-4 mr-2" />
                Todo
              </Button>
            </div>
          </div>

          {/* Goal Selection */}
          {linkType === 'goal' && (
            <div>
              <label className="block text-sm font-medium mb-2">Select Goal</label>
              <Select value={selectedGoal} onValueChange={setSelectedGoal}>
                <SelectTrigger>
                  <SelectValue placeholder="Choose a goal to link" />
                </SelectTrigger>
                <SelectContent>
                  {linkableGoals.map((goal) => (
                    <SelectItem key={goal.id} value={goal.id}>
                      <div className="flex items-center justify-between w-full">
                        <span>{goal.title}</span>
                        <div className="flex items-center gap-2 ml-2">
                          <Badge variant="outline" className="text-xs">
                            {goal.progress}%
                          </Badge>
                          {goal.subject && (
                            <Badge variant="secondary" className="text-xs">
                              {goal.subject}
                            </Badge>
                          )}
                        </div>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              
              {selectedGoal && (
                <div className="mt-3 p-3 bg-blue-50 rounded-lg">
                  {linkableGoals.find(g => g.id === selectedGoal)?.description && (
                    <p className="text-sm text-blue-700">
                      {linkableGoals.find(g => g.id === selectedGoal)?.description}
                    </p>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Todo Selection */}
          {linkType === 'todo' && (
            <div>
              <label className="block text-sm font-medium mb-2">Select Todo</label>
              <Select value={selectedTodo} onValueChange={setSelectedTodo}>
                <SelectTrigger>
                  <SelectValue placeholder="Choose a todo to link" />
                </SelectTrigger>
                <SelectContent>
                  {linkableTodos.map((todo) => (
                    <SelectItem key={todo.id} value={todo.id}>
                      <div className="flex items-center justify-between w-full">
                        <span>{todo.title}</span>
                        <div className="flex items-center gap-2 ml-2">
                          <Badge variant="outline" className="text-xs">
                            {todo.priority}
                          </Badge>
                          {todo.due_date && (
                            <Badge variant="secondary" className="text-xs">
                              {format(new Date(todo.due_date), 'MMM dd')}
                            </Badge>
                          )}
                        </div>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              
              {selectedTodo && (
                <div className="mt-3 p-3 bg-green-50 rounded-lg">
                  {linkableTodos.find(t => t.id === selectedTodo)?.description && (
                    <p className="text-sm text-green-700">
                      {linkableTodos.find(t => t.id === selectedTodo)?.description}
                    </p>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-3 pt-4">
            <Button variant="outline" onClick={onClose} className="flex-1">
              Cancel
            </Button>
            <Button
              onClick={linkType === 'goal' ? handleLinkToGoal : handleLinkToTodo}
              disabled={
                isLinking || 
                (linkType === 'goal' && !selectedGoal) || 
                (linkType === 'todo' && !selectedTodo)
              }
              className="flex-1"
            >
              Link Session
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
