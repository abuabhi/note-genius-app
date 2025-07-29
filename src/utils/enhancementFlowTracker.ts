// Enhancement Flow Tracker - Comprehensive debugging utility
export class EnhancementFlowTracker {
  private static instance: EnhancementFlowTracker;
  private flowLogs: Array<{ timestamp: Date, step: string, data: any }> = [];

  static getInstance(): EnhancementFlowTracker {
    if (!EnhancementFlowTracker.instance) {
      EnhancementFlowTracker.instance = new EnhancementFlowTracker();
    }
    return EnhancementFlowTracker.instance;
  }

  logStep(step: string, data: any) {
    const logEntry = {
      timestamp: new Date(),
      step,
      data
    };
    
    this.flowLogs.push(logEntry);
    
    // Keep only last 50 entries
    if (this.flowLogs.length > 50) {
      this.flowLogs = this.flowLogs.slice(-50);
    }

    console.log(`🔍 [FLOW TRACKER] ${step}:`, data);
  }

  getFlowSummary(): string {
    return this.flowLogs.map(log => 
      `${log.timestamp.toISOString().slice(11, 23)} | ${log.step}`
    ).join('\n');
  }

  clearLogs() {
    this.flowLogs = [];
  }

  // Specific tracking methods
  trackButtonClick(source: string, enhancementType: string, noteId: string) {
    this.logStep('BUTTON_CLICK', { source, enhancementType, noteId });
  }

  trackEnrichmentCall(enhancementType: string, noteId: string, source: string) {
    this.logStep('ENRICHMENT_CALL', { enhancementType, noteId, source });
  }

  trackStatusUpdate(noteId: string, field: string, status: string) {
    this.logStep('STATUS_UPDATE', { noteId, field, status });
  }

  trackApiCall(url: string, method: string, status?: number) {
    this.logStep('API_CALL', { url, method, status });
  }

  trackError(error: string, context: any) {
    this.logStep('ERROR', { error, context });
  }
}

// Global instance
export const flowTracker = EnhancementFlowTracker.getInstance();
