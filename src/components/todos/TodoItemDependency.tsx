
import React from "react";
import { Link, AlertTriangle } from "lucide-react";
import { Todo } from "@/hooks/todos/types";

interface TodoItemDependencyProps {
  todo: Todo;
  dependencyTodo: Todo | undefined;
  blocked: boolean;
}

export const TodoItemDependency = ({ todo, dependencyTodo, blocked }: TodoItemDependencyProps) => {
  if (!todo.depends_on_todo_id || !dependencyTodo) {
    return null;
  }

  return (
    <div className={`flex items-center gap-2 text-xs p-2 rounded mt-2 ${
      blocked ? 'bg-orange-50 text-orange-700' : 'bg-blue-50 text-blue-700'
    }`}>
      {blocked ? (
        <AlertTriangle className="h-3 w-3" />
      ) : (
        <Link className="h-3 w-3" />
      )}
      <span>
        {blocked ? 'Blocked by:' : 'Depends on:'} "{dependencyTodo.title}"
      </span>
    </div>
  );
};
