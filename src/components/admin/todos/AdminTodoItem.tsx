import React from 'react';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import { MoreHorizontal, Calendar, Pencil, Trash2 } from 'lucide-react';
import type { AdminTodo, AdminTodoStatus } from '@/types/adminTodo';
import { format, isPast } from 'date-fns';

interface Props {
  todo: AdminTodo;
  onToggleDone: (todo: AdminTodo) => void;
  onChangeStatus: (todo: AdminTodo, status: AdminTodoStatus) => void;
  onEdit: (todo: AdminTodo) => void;
  onDelete: (todo: AdminTodo) => void;
}

const priorityVariant = (p: AdminTodo['priority']) =>
  p === 'high' ? 'destructive' : p === 'medium' ? 'default' : 'secondary';

export const AdminTodoItem: React.FC<Props> = ({ todo, onToggleDone, onChangeStatus, onEdit, onDelete }) => {
  const done = todo.status === 'done';
  const overdue = !done && todo.due_date && isPast(new Date(todo.due_date));

  return (
    <div className="flex items-start gap-3 p-4 border rounded-lg bg-card hover:bg-accent/30 transition-colors">
      <Checkbox
        checked={done}
        onCheckedChange={() => onToggleDone(todo)}
        className="mt-1"
        aria-label={done ? 'Mark as not done' : 'Mark as done'}
      />
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <span className={`font-medium ${done ? 'line-through text-muted-foreground' : ''}`}>
            {todo.title}
          </span>
          <Badge variant={priorityVariant(todo.priority)} className="text-xs capitalize">
            {todo.priority}
          </Badge>
          {todo.status === 'in_progress' && (
            <Badge variant="outline" className="text-xs">In Progress</Badge>
          )}
          {todo.due_date && (
            <span className={`text-xs flex items-center gap-1 ${overdue ? 'text-destructive' : 'text-muted-foreground'}`}>
              <Calendar className="h-3 w-3" />
              {format(new Date(todo.due_date), 'MMM d, yyyy')}
              {overdue && ' (overdue)'}
            </span>
          )}
        </div>
        {todo.description && (
          <p className={`mt-1 text-sm whitespace-pre-wrap ${done ? 'text-muted-foreground' : 'text-foreground/80'}`}>
            {todo.description}
          </p>
        )}
      </div>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon" className="h-8 w-8">
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          {todo.status !== 'todo' && (
            <DropdownMenuItem onClick={() => onChangeStatus(todo, 'todo')}>
              Move to To Do
            </DropdownMenuItem>
          )}
          {todo.status !== 'in_progress' && (
            <DropdownMenuItem onClick={() => onChangeStatus(todo, 'in_progress')}>
              Move to In Progress
            </DropdownMenuItem>
          )}
          {todo.status !== 'done' && (
            <DropdownMenuItem onClick={() => onChangeStatus(todo, 'done')}>
              Mark as Done
            </DropdownMenuItem>
          )}
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={() => onEdit(todo)}>
            <Pencil className="h-4 w-4 mr-2" /> Edit
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => onDelete(todo)} className="text-destructive">
            <Trash2 className="h-4 w-4 mr-2" /> Delete
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
};
