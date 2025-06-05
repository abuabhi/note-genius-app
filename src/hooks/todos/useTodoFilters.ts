
import { useState } from "react";
import { Todo, TodoStatus } from "./types";

export const useTodoFilters = (allTodos: Todo[]) => {
  const [filter, setFilter] = useState<TodoStatus | 'all'>('all');

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

  console.log('📋 Final todos for display:', {
    allTodosCount: allTodos.length,
    filteredTodosCount: todos.length,
    filter,
    allStatuses: allTodos.map(t => ({ id: t.id, status: t.status }))
  });

  return {
    todos,
    filter,
    setFilter
  };
};
