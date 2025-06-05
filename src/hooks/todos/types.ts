
export type TodoPriority = "low" | "medium" | "high";
export type TodoStatus = "new" | "pending" | "completed";
export type RecurrenceType = "none" | "daily" | "weekly" | "monthly" | "yearly";

export interface Todo {
  id: string;
  user_id: string;
  title: string;
  description?: string;
  reminder_time: string | null;
  due_date?: string | null;
  status: TodoStatus;
  priority: TodoPriority;
  recurrence?: RecurrenceType;
  recurrence_end_date?: string | null;
  depends_on_todo_id?: string | null;
  template_id?: string | null;
  auto_tags?: string[];
  created_at: string;
  updated_at: string;
}

export interface CreateTodoData {
  title: string;
  description?: string;
  reminder_time?: Date | null;
  due_date?: Date | null;
  priority: TodoPriority;
  recurrence?: RecurrenceType;
  recurrence_end_date?: Date | null;
  depends_on_todo_id?: string | null;
  template_id?: string | null;
}

export interface TodoTemplate {
  id: string;
  user_id?: string;
  name: string;
  description?: string;
  category: string;
  default_priority: TodoPriority;
  template_items: TemplateItem[];
  is_public: boolean;
  created_at: string;
  updated_at: string;
}

export interface TemplateItem {
  title: string;
  priority: TodoPriority;
  description?: string;
  recurrence?: RecurrenceType;
}

export interface SmartSuggestion {
  label: string;
  date: Date;
  icon: string;
}
