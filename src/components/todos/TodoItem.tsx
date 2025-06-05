
import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Todo } from "@/hooks/todos/types";
import { TodoItemActions } from "./TodoItemActions";
import { TodoItemMetadata } from "./TodoItemMetadata";
import { TodoItemDependency } from "./TodoItemDependency";

interface TodoItemProps {
  todo: Todo;
  blocked: boolean;
  overdue: boolean;
  dependencyTodo: Todo | undefined;
  onCheckboxChange: (todo: Todo, checked: boolean) => void;
  onEdit: (todo: Todo) => void;
  onDelete: (id: string) => void;
  formatDate: (dateString: string | null) => string | null;
}

export const TodoItem = ({
  todo,
  blocked,
  overdue,
  dependencyTodo,
  onCheckboxChange,
  onEdit,
  onDelete,
  formatDate
}: TodoItemProps) => {
  return (
    <Card className={`transition-all hover:shadow-md ${blocked ? 'opacity-60 border-orange-200' : ''} ${overdue ? 'border-red-200 bg-red-50' : ''}`}>
      <CardContent className="p-4">
        {/* Main todo row - everything in one line */}
        <div className="flex items-center gap-3">
          {/* Checkbox */}
          <Checkbox
            checked={todo.status === 'completed'}
            onCheckedChange={(checked) => onCheckboxChange(todo, checked as boolean)}
            disabled={blocked}
            className="flex-shrink-0"
          />
          
          {/* Title - takes up remaining space */}
          <div className="flex-1 min-w-0">
            <h3 className={`font-medium truncate ${todo.status === 'completed' ? 'line-through text-gray-500' : ''} ${overdue ? 'text-red-700' : ''}`}>
              {todo.title}
            </h3>
          </div>

          <TodoItemMetadata 
            todo={todo} 
            formatDate={formatDate} 
            overdue={overdue} 
          />

          {/* Action buttons */}
          <TodoItemActions 
            todo={todo} 
            onEdit={onEdit} 
            onDelete={onDelete} 
          />
        </div>

        {/* Description row (if exists) */}
        {todo.description && (
          <div className="mt-2 ml-8">
            <p className="text-sm text-gray-600">{todo.description}</p>
          </div>
        )}

        {/* Dependency info */}
        <TodoItemDependency 
          todo={todo} 
          dependencyTodo={dependencyTodo} 
          blocked={blocked} 
        />
      </CardContent>
    </Card>
  );
};
