
export type TodoPriority = "low" | "medium" | "high";
export type TodoStatus = "new" | "pending" | "completed";

export interface Todo {
  id: string;
  user_id: string;
  title: string;
  description?: string;
  reminder_time: string | null;
  status: TodoStatus;
  priority: TodoPriority;
  created_at: string;
  updated_at: string;
}

export interface CreateTodoData {
  title: string;
  description?: string;
  reminder_time?: Date | null;
  priority: TodoPriority;
}
