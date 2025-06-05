
import React from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Link, AlertCircle } from "lucide-react";
import { Todo } from "@/hooks/todos/types";

interface DependencySelectorProps {
  todos: Todo[];
  currentTodoId?: string;
  value?: string;
  onValueChange: (value: string | undefined) => void;
}

export const DependencySelector: React.FC<DependencySelectorProps> = ({
  todos,
  currentTodoId,
  value,
  onValueChange
}) => {
  // Filter out completed todos and the current todo itself
  const availableTodos = todos.filter(todo => 
    todo.status !== 'completed' && 
    todo.id !== currentTodoId
  );

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <Link className="h-4 w-4 text-muted-foreground" />
        <Label>Depends On</Label>
      </div>
      
      <Select value={value || ""} onValueChange={(val) => onValueChange(val || undefined)}>
        <SelectTrigger>
          <SelectValue placeholder="Select a dependency (optional)" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="">
            <span>No dependency</span>
          </SelectItem>
          {availableTodos.map((todo) => (
            <SelectItem key={todo.id} value={todo.id}>
              <div className="flex items-center gap-2">
                <div className={`w-2 h-2 rounded-full ${
                  todo.status === 'new' ? 'bg-gray-400' : 
                  todo.status === 'pending' ? 'bg-yellow-400' : 'bg-green-400'
                }`} />
                <span className="truncate max-w-48">{todo.title}</span>
                {todo.priority === 'high' && (
                  <AlertCircle className="h-3 w-3 text-red-500" />
                )}
              </div>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      
      {value && (
        <div className="text-xs text-muted-foreground bg-blue-50 p-2 rounded">
          This task will be blocked until the selected dependency is completed.
        </div>
      )}
    </div>
  );
};
