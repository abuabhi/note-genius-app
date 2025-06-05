
import { useTodoQueries } from "./todos/useTodoQueries";
import { useTodoMutations } from "./todos/useTodoMutations";
import { useTodoFilters } from "./todos/useTodoFilters";
import { useTodoUtils } from "./todos/useTodoUtils";

export * from "./todos/types";

export const useTodos = () => {
  const { allTodos, isLoading, error } = useTodoQueries();
  const { createTodo, updateTodoStatus, deleteTodo } = useTodoMutations();
  const { todos, filter, setFilter } = useTodoFilters(allTodos);
  const { formatDate } = useTodoUtils();

  return {
    todos,
    isLoading,
    error,
    createTodo,
    updateTodoStatus,
    deleteTodo,
    formatDate,
    filter,
    setFilter
  };
};
