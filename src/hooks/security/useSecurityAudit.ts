import { useCallback, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface SecurityAuditLog {
  table_name: string;
  operation: 'SELECT' | 'INSERT' | 'UPDATE' | 'DELETE';
  user_id?: string;
  timestamp: number;
  metadata?: Record<string, any>;
  risk_level: 'low' | 'medium' | 'high' | 'critical';
}

interface SensitiveTableAccess {
  subscribers: boolean;
  contact_submissions: boolean;
  referrals: boolean;
  influencer_orders: boolean;
  influencer_payouts: boolean;
  coupon_usage: boolean;
}

export const useSecurityAudit = () => {
  const auditLogRef = useRef<SecurityAuditLog[]>([]);
  const sensitiveAccessRef = useRef<SensitiveTableAccess>({
    subscribers: false,
    contact_submissions: false,
    referrals: false,
    influencer_orders: false,
    influencer_payouts: false,
    coupon_usage: false
  });

  // Log access to sensitive tables
  const logSensitiveTableAccess = useCallback((
    tableName: keyof SensitiveTableAccess,
    operation: SecurityAuditLog['operation'],
    metadata?: Record<string, any>
  ) => {
    const user = supabase.auth.getUser();
    
    const auditEntry: SecurityAuditLog = {
      table_name: tableName,
      operation,
      user_id: user ? 'authenticated' : 'anonymous',
      timestamp: Date.now(),
      metadata,
      risk_level: getRiskLevel(tableName, operation)
    };

    auditLogRef.current.push(auditEntry);
    sensitiveAccessRef.current[tableName] = true;

    // Keep only recent audit logs to prevent memory bloat
    if (auditLogRef.current.length > 100) {
      auditLogRef.current = auditLogRef.current.slice(-50);
    }

    // Log critical access patterns
    if (auditEntry.risk_level === 'critical') {
      console.warn('🚨 Critical Security Event:', auditEntry);
    }

    return auditEntry;
  }, []);

  const getRiskLevel = (tableName: string, operation: string): SecurityAuditLog['risk_level'] => {
    // Financial data access is always high/critical risk
    if (['subscribers', 'influencer_orders', 'influencer_payouts'].includes(tableName)) {
      return operation === 'SELECT' ? 'high' : 'critical';
    }
    
    // Contact and referral data is medium risk
    if (['contact_submissions', 'referrals', 'coupon_usage'].includes(tableName)) {
      return operation === 'SELECT' ? 'medium' : 'high';
    }
    
    return 'low';
  };

  // Validate RLS policy compliance
  const validateRLSCompliance = useCallback(async () => {
    try {
      // Check if user can access data they shouldn't
      const { data: user } = await supabase.auth.getUser();
      
      if (!user.user) {
        // Anonymous user should not access sensitive data
        const testQueries = [
          'subscribers',
          'contact_submissions', 
          'referrals',
          'influencer_orders',
          'influencer_payouts'
        ];

        for (const table of testQueries) {
          try {
            const { data, error } = await supabase.from(table).select('*').limit(1);
            
            if (data && data.length > 0) {
              console.error(`🚨 RLS VIOLATION: Anonymous user accessed ${table} table`);
              logSensitiveTableAccess(table as keyof SensitiveTableAccess, 'SELECT', {
                violation: 'anonymous_access',
                severity: 'critical'
              });
            }
          } catch (e) {
            // Expected to fail - this is good
          }
        }
      }
    } catch (error) {
      console.error('Error validating RLS compliance:', error);
    }
  }, [logSensitiveTableAccess]);

  // Get security audit summary
  const getAuditSummary = useCallback(() => {
    const recentLogs = auditLogRef.current.filter(log => 
      Date.now() - log.timestamp < 3600000 // Last hour
    );

    const criticalEvents = recentLogs.filter(log => log.risk_level === 'critical').length;
    const highRiskEvents = recentLogs.filter(log => log.risk_level === 'high').length;
    
    return {
      totalEvents: recentLogs.length,
      criticalEvents,
      highRiskEvents,
      sensitiveTablesAccessed: Object.entries(sensitiveAccessRef.current)
        .filter(([_, accessed]) => accessed)
        .map(([table]) => table),
      recentLogs: recentLogs.slice(-10)
    };
  }, []);

  // Reset audit logs
  const resetAuditLogs = useCallback(() => {
    auditLogRef.current = [];
    sensitiveAccessRef.current = {
      subscribers: false,
      contact_submissions: false,
      referrals: false,
      influencer_orders: false,
      influencer_payouts: false,
      coupon_usage: false
    };
  }, []);

  return {
    logSensitiveTableAccess,
    validateRLSCompliance,
    getAuditSummary,
    resetAuditLogs
  };
};
