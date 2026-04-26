export type AdminTodoStatus = 'todo' | 'in_progress' | 'done';
export type AdminTodoPriority = 'low' | 'medium' | 'high';

export interface AdminTodo {
  id: string;
  title: string;
  description: string | null;
  status: AdminTodoStatus;
  priority: AdminTodoPriority;
  due_date: string | null;
  completed_at: string | null;
  created_by: string | null;
  created_at: string;
  updated_at: string;
}

export interface AdminTodoInput {
  title: string;
  description?: string | null;
  status?: AdminTodoStatus;
  priority?: AdminTodoPriority;
  due_date?: string | null;
}
