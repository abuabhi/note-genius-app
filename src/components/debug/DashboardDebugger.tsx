
import React from 'react';
import { useAuth } from '@/contexts/auth';

export const DashboardDebugger = () => {
  const { user, loading } = useAuth();
  
  console.log('🔍 [DASHBOARD DEBUG] DashboardDebugger rendering');
  console.log('🔍 [DASHBOARD DEBUG] Auth state:', { user: user?.id, loading });
  
  return (
    <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
      <h2 className="text-lg font-semibold text-yellow-800 mb-2">Dashboard Debug Info</h2>
      <div className="space-y-2 text-sm">
        <p><strong>User ID:</strong> {user?.id || 'No user'}</p>
        <p><strong>User Email:</strong> {user?.email || 'No email'}</p>
        <p><strong>Auth Loading:</strong> {loading ? 'Yes' : 'No'}</p>
        <p><strong>Timestamp:</strong> {new Date().toISOString()}</p>
      </div>
    </div>
  );
};
