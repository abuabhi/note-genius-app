
import { TodoStatus } from "./types";

// Helper function to map database status to TodoStatus
export const mapDatabaseStatusToTodoStatus = (dbStatus: string): TodoStatus => {
  console.log('🔄 Mapping database status:', dbStatus);
  
  switch (dbStatus) {
    case 'pending':
      console.log('✅ Mapped to pending');
      return 'pending';
    case 'sent':
      console.log('✅ Mapped sent to completed');
      return 'completed'; // Map 'sent' back to 'completed' for frontend
    case 'completed':
      console.log('✅ Mapped to completed');
      return 'completed';
    case 'dismissed':
      console.log('✅ Mapped dismissed to cancelled');
      return 'cancelled';
    case 'cancelled':
      console.log('✅ Mapped to cancelled');
      return 'cancelled';
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
      console.log('✅ Mapped completed to sent');
      return 'sent'; // Map 'completed' to 'sent' for database
    case 'cancelled':
      console.log('✅ Mapped to cancelled');
      return 'cancelled';
    default:
      console.log('⚠️ Unknown status, defaulting to pending:', todoStatus);
      return 'pending';
  }
};
