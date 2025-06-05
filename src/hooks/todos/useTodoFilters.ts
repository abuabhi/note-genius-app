
import { useState } from "react";
import { Todo, TodoStatus } from "./types";

export const useTodoFilters = (allTodos: Todo[]) => {
  const [filter, setFilter] = useState<TodoStatus | 'all'>('all');

  console.log('🎯 Filter state:', filter);
  console.log('📋 All todos for filtering:', allTodos.map(t => ({
    id: t.id,
    title: t.title,
    status: t.status
  })));

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
      cancelled: allTodos.filter(t => t.status === 'cancelled').length
    }
  });

  return {
    todos,
    filter,
    setFilter
  };
};
