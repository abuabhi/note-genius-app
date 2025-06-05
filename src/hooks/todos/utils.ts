
import { TodoStatus } from "./types";

// Helper function to map database status to TodoStatus (now 1:1 mapping)
export const mapDatabaseStatusToTodoStatus = (dbStatus: string): TodoStatus => {
  console.log('🔄 Mapping database status:', dbStatus);
  
  switch (dbStatus) {
    case 'new':
      console.log('✅ Mapped to new');
      return 'new';
    case 'pending':
      console.log('✅ Mapped to pending');
      return 'pending';
    case 'completed':
      console.log('✅ Mapped to completed');
      return 'completed';
    default:
      console.log('⚠️ Unknown status, defaulting to new:', dbStatus);
      return 'new'; // Default fallback
  }
};

// Helper function to map TodoStatus to database status (now 1:1 mapping)
export const mapTodoStatusToDatabaseStatus = (todoStatus: TodoStatus): string => {
  console.log('🔄 Mapping todo status to database:', todoStatus);
  
  switch (todoStatus) {
    case 'new':
      console.log('✅ Mapped to new');
      return 'new';
    case 'pending':
      console.log('✅ Mapped to pending');
      return 'pending';
    case 'completed':
      console.log('✅ Mapped to completed');
      return 'completed';
    default:
      console.log('⚠️ Unknown status, defaulting to new:', todoStatus);
      return 'new';
  }
};
