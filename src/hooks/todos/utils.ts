
import { TodoStatus } from "./types";

// Helper function to map database status to TodoStatus
export const mapDatabaseStatusToTodoStatus = (dbStatus: string): TodoStatus => {
  switch (dbStatus) {
    case 'pending':
      return 'pending';
    case 'sent':
      return 'completed'; // Map 'sent' back to 'completed' for frontend
    case 'dismissed':
      return 'cancelled';
    case 'cancelled':
      return 'cancelled';
    default:
      return 'pending'; // Default fallback
  }
};

// Helper function to map TodoStatus to database status
export const mapTodoStatusToDatabaseStatus = (todoStatus: TodoStatus): string => {
  switch (todoStatus) {
    case 'pending':
      return 'pending';
    case 'completed':
      return 'sent'; // Map 'completed' to 'sent' for database
    case 'cancelled':
      return 'cancelled';
    default:
      return 'pending';
  }
};
