import { useEffect, useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface DatabaseHealth {
  connection_count: number;
  query_performance: {
    avg_duration: number;
    slow_queries: number;
  };
  error_rate: number;
  uptime: number;
  last_check: string;
}

interface DatabaseAlert {
  id: string;
  type: 'slow_query' | 'high_connections' | 'error_spike' | 'downtime';
  severity: 'low' | 'medium' | 'high' | 'critical';
  message: string;
  timestamp: string;
  resolved: boolean;
}

export const useDatabaseMonitoring = () => {
  const [health, setHealth] = useState<DatabaseHealth | null>(null);
  const [alerts, setAlerts] = useState<DatabaseAlert[]>([]);
  const [isMonitoring, setIsMonitoring] = useState(false);

  // Database health check
  const checkDatabaseHealth = useCallback(async (): Promise<DatabaseHealth> => {
    const startTime = performance.now();
    
    try {
      // Test basic connectivity
      const { data: connectionTest, error: connectionError } = await supabase
        .from('profiles')
        .select('count')
        .limit(1);

      const queryTime = performance.now() - startTime;

      if (connectionError) {
        throw new Error(`Database connection failed: ${connectionError.message}`);
      }

      // Get database statistics (mock for now - in production you'd query pg_stat_database)
      const healthData: DatabaseHealth = {
        connection_count: Math.floor(Math.random() * 50) + 10, // Mock data
        query_performance: {
          avg_duration: queryTime,
          slow_queries: Math.floor(Math.random() * 5)
        },
        error_rate: Math.random() * 2, // Percentage
        uptime: 99.9, // Mock uptime percentage
        last_check: new Date().toISOString()
      };

      return healthData;
    } catch (error) {
      console.error('Database health check failed:', error);
      
      return {
        connection_count: 0,
        query_performance: {
          avg_duration: 0,
          slow_queries: 0
        },
        error_rate: 100,
        uptime: 0,
        last_check: new Date().toISOString()
      };
    }
  }, []);

  // Check for database integrity issues
  const checkDatabaseIntegrity = useCallback(async () => {
    try {
      // Check for orphaned records
      const { data: orphanedFlashcards } = await supabase
        .from('flashcards')
        .select('id, set_id')
        .not('set_id', 'in', 
          supabase.from('flashcard_sets').select('id')
        );

      if (orphanedFlashcards && orphanedFlashcards.length > 0) {
        const alert: DatabaseAlert = {
          id: Date.now().toString(),
          type: 'error_spike',
          severity: 'medium',
          message: `Found ${orphanedFlashcards.length} orphaned flashcards`,
          timestamp: new Date().toISOString(),
          resolved: false
        };
        
        setAlerts(prev => [alert, ...prev].slice(0, 50)); // Keep only last 50 alerts
      }

      // Check for duplicate data - simplified query
      const { data: allNotes } = await supabase
        .from('notes')
        .select('title');

      if (allNotes && allNotes.length > 0) {
        const titleCounts = allNotes.reduce((acc: Record<string, number>, note) => {
          acc[note.title] = (acc[note.title] || 0) + 1;
          return acc;
        }, {});

        const duplicates = Object.entries(titleCounts).filter(([_, count]) => count > 1);

        if (duplicates.length > 0) {
          const alert: DatabaseAlert = {
            id: Date.now().toString(),
            type: 'error_spike',
            severity: 'low',
            message: `Found ${duplicates.length} potential duplicate note titles`,
            timestamp: new Date().toISOString(),
            resolved: false
          };
          
          setAlerts(prev => [alert, ...prev].slice(0, 50));
        }
      }

    } catch (error) {
      console.error('Database integrity check failed:', error);
      
      const alert: DatabaseAlert = {
        id: Date.now().toString(),
        type: 'error_spike',
        severity: 'high',
        message: `Database integrity check failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
        timestamp: new Date().toISOString(),
        resolved: false
      };
      
      setAlerts(prev => [alert, ...prev].slice(0, 50));
    }
  }, []);

  // Monitor query performance
  const monitorQueryPerformance = useCallback(async () => {
    const queries = [
      { name: 'notes_list', query: () => supabase.from('notes').select('id').limit(10) },
      { name: 'flashcards_list', query: () => supabase.from('flashcard_sets').select('id').limit(10) },
      { name: 'user_profile', query: () => supabase.from('profiles').select('id').limit(1) }
    ];

    for (const { name, query } of queries) {
      const startTime = performance.now();
      
      try {
        await query();
        const duration = performance.now() - startTime;
        
        // Alert on slow queries (>2 seconds)
        if (duration > 2000) {
          const alert: DatabaseAlert = {
            id: Date.now().toString(),
            type: 'slow_query',
            severity: duration > 5000 ? 'high' : 'medium',
            message: `Slow query detected: ${name} took ${duration.toFixed(0)}ms`,
            timestamp: new Date().toISOString(),
            resolved: false
          };
          
          setAlerts(prev => [alert, ...prev].slice(0, 50));
        }
      } catch (error) {
        const alert: DatabaseAlert = {
          id: Date.now().toString(),
          type: 'error_spike',
          severity: 'high',
          message: `Query failed: ${name} - ${error instanceof Error ? error.message : 'Unknown error'}`,
          timestamp: new Date().toISOString(),
          resolved: false
        };
        
        setAlerts(prev => [alert, ...prev].slice(0, 50));
      }
    }
  }, []);

  // Start monitoring
  const startMonitoring = useCallback(() => {
    if (isMonitoring) return;
    
    setIsMonitoring(true);
    console.log('🔍 Starting database monitoring...');

    // Initial health check
    checkDatabaseHealth().then(setHealth);

    // Set up intervals
    const healthInterval = setInterval(async () => {
      const healthData = await checkDatabaseHealth();
      setHealth(healthData);
      
      // Check for health-based alerts
      if (healthData.error_rate > 10) {
        const alert: DatabaseAlert = {
          id: Date.now().toString(),
          type: 'error_spike',
          severity: 'critical',
          message: `High error rate: ${healthData.error_rate.toFixed(1)}%`,
          timestamp: new Date().toISOString(),
          resolved: false
        };
        
        setAlerts(prev => [alert, ...prev].slice(0, 50));
      }
      
      if (healthData.connection_count > 40) {
        const alert: DatabaseAlert = {
          id: Date.now().toString(),
          type: 'high_connections',
          severity: 'medium',
          message: `High connection count: ${healthData.connection_count}`,
          timestamp: new Date().toISOString(),
          resolved: false
        };
        
        setAlerts(prev => [alert, ...prev].slice(0, 50));
      }
    }, 60000); // Every minute

    const integrityInterval = setInterval(checkDatabaseIntegrity, 300000); // Every 5 minutes
    const performanceInterval = setInterval(monitorQueryPerformance, 120000); // Every 2 minutes

    return () => {
      clearInterval(healthInterval);
      clearInterval(integrityInterval);
      clearInterval(performanceInterval);
      setIsMonitoring(false);
    };
  }, [isMonitoring, checkDatabaseHealth, checkDatabaseIntegrity, monitorQueryPerformance]);

  // Stop monitoring
  const stopMonitoring = useCallback(() => {
    setIsMonitoring(false);
    console.log('⏹️ Stopped database monitoring');
  }, []);

  // Resolve alert
  const resolveAlert = useCallback((alertId: string) => {
    setAlerts(prev => 
      prev.map(alert => 
        alert.id === alertId 
          ? { ...alert, resolved: true }
          : alert
      )
    );
  }, []);

  // Clear all resolved alerts
  const clearResolvedAlerts = useCallback(() => {
    setAlerts(prev => prev.filter(alert => !alert.resolved));
  }, []);

  // Start monitoring on mount
  useEffect(() => {
    const cleanup = startMonitoring();
    return cleanup;
  }, [startMonitoring]);

  return {
    health,
    alerts: alerts.filter(alert => !alert.resolved),
    resolvedAlerts: alerts.filter(alert => alert.resolved),
    isMonitoring,
    startMonitoring,
    stopMonitoring,
    resolveAlert,
    clearResolvedAlerts,
    checkDatabaseHealth,
    checkDatabaseIntegrity
  };
};