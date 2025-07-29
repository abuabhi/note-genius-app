import { DEBUG_CONFIG } from '@/config/debug';

// Centralized debug logger that can be completely disabled
export class EnhancementDebugLogger {
  private static instance: EnhancementDebugLogger;
  private logs: Array<{ timestamp: Date; type: string; message: string; data?: any }> = [];

  static getInstance(): EnhancementDebugLogger {
    if (!EnhancementDebugLogger.instance) {
      EnhancementDebugLogger.instance = new EnhancementDebugLogger();
    }
    return EnhancementDebugLogger.instance;
  }

  // Core logging method - respects debug flags
  log(type: string, message: string, data?: any) {
    if (!DEBUG_CONFIG.ENHANCEMENT_FLOW) return;

    const logEntry = {
      timestamp: new Date(),
      type,
      message,
      data
    };

    this.logs.push(logEntry);
    
    // Keep only last 100 entries
    if (this.logs.length > 100) {
      this.logs = this.logs.slice(-100);
    }

    if (DEBUG_CONFIG.STATE_LOGGING) {
      console.log(`🔍 [${type}] ${message}`, data || '');
    }
  }

  // Network-specific logging
  logNetworkCall(url: string, method: string, data?: any, status?: number) {
    if (!DEBUG_CONFIG.NETWORK_LOGGING) return;
    this.log('NETWORK', `${method} ${url} - Status: ${status || 'pending'}`, data);
  }

  // State-specific logging
  logState(component: string, state: any) {
    if (!DEBUG_CONFIG.STATE_LOGGING) return;
    this.log('STATE', `${component} state update`, state);
  }

  // Flow tracking
  logFlow(step: string, data?: any) {
    if (!DEBUG_CONFIG.FLOW_TRACKER) return;
    this.log('FLOW', step, data);
  }

  // Error logging (always enabled even in production)
  logError(error: string, context?: any) {
    this.log('ERROR', error, context);
    // Always log errors to console regardless of debug flags
    console.error(`❌ [ENHANCEMENT ERROR] ${error}`, context || '');
  }

  // Get logs for debugging UI
  getLogs() {
    return DEBUG_CONFIG.ENHANCEMENT_FLOW ? this.logs : [];
  }

  // Clear logs
  clearLogs() {
    if (!DEBUG_CONFIG.ENHANCEMENT_FLOW) return;
    this.logs = [];
  }
}

// Global instance
export const debugLogger = EnhancementDebugLogger.getInstance();
