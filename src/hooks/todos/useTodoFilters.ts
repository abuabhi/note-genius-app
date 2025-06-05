
import { useState } from "react";
import { Todo, TodoStatus } from "./types";

export const useTodoFilters = (allTodos: Todo[]) => {
  const [filter, setFilter] = useState<TodoStatus | 'all' | 'overdue'>('all');

  console.log('🎯 Filter state:', filter);
  console.log('📋 All todos for filtering:', allTodos.map(t => ({
    id: t.id,
    title: t.title,
    status: t.status
  })));

  // Helper function to check if a todo is overdue
  const isOverdue = (todo: Todo) => {
    if (!todo.due_date || todo.status === 'completed') return false;
    return new Date(todo.due_date) < new Date();
  };

  // Filter todos based on the current filter
  const todos = allTodos.filter(todo => {
    console.log('🔍 Filtering todo:', { 
      id: todo.id, 
      title: todo.title, 
      status: todo.status, 
      filter, 
      willShow: filter === 'all' || todo.status === filter 
    });
    
    if (filter === 'all') return true;
    if (filter === 'overdue') return isOverdue(todo);
    return todo.status === filter;
  });

  console.log('📋 Final filtered todos:', {
    allTodosCount: allTodos.length,
    filteredTodosCount: todos.length,
    filter,
    filteredTodos: todos.map(t => ({ id: t.id, title: t.title, status: t.status })),
    statusBreakdown: {
      pending: allTodos.filter(t => t.status === 'pending').length,
      completed: allTodos.filter(t => t.status === 'completed').length,
      overdue: allTodos.filter(t => isOverdue(t)).length
    }
  });

  return {
    todos,
    filter,
    setFilter
  };
};
