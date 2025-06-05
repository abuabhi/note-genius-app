
import React from "react";
import { Button } from "@/components/ui/button";
import { Edit, Trash2 } from "lucide-react";
import { Todo } from "@/hooks/todos/types";

interface TodoItemActionsProps {
  todo: Todo;
  onEdit: (todo: Todo) => void;
  onDelete: (id: string) => void;
}

export const TodoItemActions = ({ todo, onEdit, onDelete }: TodoItemActionsProps) => {
  return (
    <div className="flex gap-1 flex-shrink-0">
      <Button
        variant="outline"
        size="sm"
        onClick={() => onEdit(todo)}
        className="h-8 w-8 p-0"
      >
        <Edit className="h-4 w-4" />
      </Button>
      <Button
        variant="outline"
        size="sm"
        onClick={() => onDelete(todo.id)}
        className="h-8 w-8 p-0"
      >
        <Trash2 className="h-4 w-4" />
      </Button>
    </div>
  );
};
