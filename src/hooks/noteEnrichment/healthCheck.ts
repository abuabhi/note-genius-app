import { testEnrichmentHealth } from "./apiService";

/**
 * Tests the health of the note enrichment system
 * Returns detailed health information for debugging
 */
export const checkEnhancementSystemHealth = async (): Promise<{
  status: 'healthy' | 'unhealthy' | 'error';
  details: any;
  timestamp: string;
}> => {
  console.log('🏥 Starting enhancement system health check...');
  
  try {
    const result = await testEnrichmentHealth();
    
    console.log('✅ Health check completed:', result);
    
    return {
      status: result.status as 'healthy' | 'unhealthy' | 'error',
      details: result.details,
      timestamp: new Date().toISOString()
    };
  } catch (error) {
    console.error('❌ Health check failed:', error);
    
    return {
      status: 'error',
      details: {
        error: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : undefined
      },
      timestamp: new Date().toISOString()
    };
  }
};

/**
 * Runs a comprehensive diagnostic of the enhancement system
 */
export const runEnhancementDiagnostics = async (noteId?: string) => {
  console.log('🔍 Running comprehensive enhancement diagnostics...');
  
  const diagnostics = {
    timestamp: new Date().toISOString(),
    healthCheck: await checkEnhancementSystemHealth(),
    noteId: noteId?.substring(0, 8) || 'none',
    browser: {
      userAgent: navigator.userAgent,
      cookiesEnabled: navigator.cookieEnabled,
      onLine: navigator.onLine
    }
  };
  
  console.log('📊 Diagnostic results:', diagnostics);
  
  return diagnostics;
};