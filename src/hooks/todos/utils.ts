
import { TodoStatus } from "./types";

// Helper function to map database status to TodoStatus
export const mapDatabaseStatusToTodoStatus = (dbStatus: string): TodoStatus => {
  console.log('🔄 Mapping database status:', dbStatus);
  
  switch (dbStatus) {
    case 'pending':
      console.log('✅ Mapped to pending');
      return 'pending';
    case 'completed':
      console.log('✅ Mapped to completed');
      return 'completed';
    case 'new':
      console.log('✅ Mapped to pending (from new)');
      return 'pending'; // Map 'new' from database to 'pending' in UI
    default:
      console.log('⚠️ Unknown status, defaulting to pending:', dbStatus);
      return 'pending'; // Default fallback
  }
};

// Helper function to map TodoStatus to database status
export const mapTodoStatusToDatabaseStatus = (todoStatus: TodoStatus): string => {
  console.log('🔄 Mapping todo status to database:', todoStatus);
  
  switch (todoStatus) {
    case 'pending':
      console.log('✅ Mapped to pending');
      return 'pending';
    case 'completed':
      console.log('✅ Mapped to completed');
      return 'completed';
    default:
      console.log('⚠️ Unknown status, defaulting to pending:', todoStatus);
      return 'pending';
  }
};
