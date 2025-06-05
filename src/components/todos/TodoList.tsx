
import React, { useState } from "react";
import { Todo, TodoStatus } from "@/hooks/todos/types";
import { TodoItem } from "./TodoItem";
import { TodoLoadingState } from "./TodoLoadingState";
import { TodoEmptyState } from "./TodoEmptyState";
import { CompleteConfirmationDialog } from "./CompleteConfirmationDialog";

interface TodoListProps {
  todos: Todo[];
  isLoading: boolean;
  onUpdate: (id: string, status: TodoStatus) => void;
  onDelete: (id: string) => void;
  onEdit: (todo: Todo) => void;
  formatDate: (dateString: string | null) => string | null;
}

export const TodoList: React.FC<TodoListProps> = ({
  todos,
  isLoading,
  onUpdate,
  onDelete,
  onEdit,
  formatDate
}) => {
  const [confirmDialog, setConfirmDialog] = useState<{
    open: boolean;
    todoId: string;
    todoTitle: string;
  }>({
    open: false,
    todoId: "",
    todoTitle: ""
  });

  if (isLoading) {
    return <TodoLoadingState />;
  }

  if (todos.length === 0) {
    return <TodoEmptyState />;
  }

  const isBlocked = (todo: Todo) => {
    if (!todo.depends_on_todo_id) return false;
    const dependency = todos.find(t => t.id === todo.depends_on_todo_id);
    return dependency && dependency.status !== 'completed';
  };

  const getDependencyTodo = (dependencyId: string) => {
    return todos.find(t => t.id === dependencyId);
  };

  const isOverdue = (todo: Todo) => {
    if (!todo.due_date || todo.status === 'completed') return false;
    return new Date(todo.due_date) < new Date();
  };

  const handleCheckboxChange = (todo: Todo, checked: boolean) => {
    if (checked && !isBlocked(todo)) {
      // Show confirmation dialog for completing todo
      setConfirmDialog({
        open: true,
        todoId: todo.id,
        todoTitle: todo.title
      });
    } else if (!checked) {
      // Directly mark as pending when unchecking
      onUpdate(todo.id, 'pending');
    }
  };

  const handleConfirmComplete = () => {
    if (confirmDialog.todoId) {
      onUpdate(confirmDialog.todoId, 'completed');
    }
    setConfirmDialog({ open: false, todoId: "", todoTitle: "" });
  };

  return (
    <>
      <div className="space-y-3">
        {todos.map((todo) => {
          const blocked = isBlocked(todo);
          const overdue = isOverdue(todo);
          const dependencyTodo = todo.depends_on_todo_id ? getDependencyTodo(todo.depends_on_todo_id) : undefined;
          
          return (
            <TodoItem
              key={todo.id}
              todo={todo}
              blocked={blocked}
              overdue={overdue}
              dependencyTodo={dependencyTodo}
              onCheckboxChange={handleCheckboxChange}
              onEdit={onEdit}
              onDelete={onDelete}
              formatDate={formatDate}
            />
          );
        })}
      </div>

      <CompleteConfirmationDialog
        open={confirmDialog.open}
        onOpenChange={(open) => setConfirmDialog(prev => ({ ...prev, open }))}
        onConfirm={handleConfirmComplete}
        todoTitle={confirmDialog.todoTitle}
      />
    </>
  );
};
