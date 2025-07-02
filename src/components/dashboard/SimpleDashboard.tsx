
import React from 'react';
import { useAuth } from '@/contexts/auth';
import { DashboardDebugger } from '@/components/debug/DashboardDebugger';

export const SimpleDashboard = () => {
  console.log('🏠 [SIMPLE DASHBOARD] Component rendering');
  
  const { user, loading } = useAuth();
  
  console.log('🏠 [SIMPLE DASHBOARD] Auth state:', { 
    userId: user?.id, 
    userEmail: user?.email,
    loading 
  });

  if (loading) {
    console.log('🏠 [SIMPLE DASHBOARD] Showing loading state');
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-mint-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    console.log('🏠 [SIMPLE DASHBOARD] No user found, should redirect to login');
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600">No user authenticated</p>
          <p className="text-gray-600">You should be redirected to login...</p>
        </div>
      </div>
    );
  }

  console.log('🏠 [SIMPLE DASHBOARD] Rendering main dashboard for user:', user.email);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto p-6">
        <div className="space-y-6">
          {/* Debug Information */}
          <DashboardDebugger />
          
          {/* Simple Welcome Message */}
          <div className="bg-white rounded-lg shadow p-6">
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              Welcome to PrepGenie, {user.email}!
            </h1>
            <p className="text-gray-600">
              This is a simplified dashboard to test if the basic functionality is working.
            </p>
          </div>

          {/* Basic Stats Card */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Basic Information</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-mint-50 p-4 rounded-lg">
                <div className="text-2xl font-bold text-mint-600">✓</div>
                <div className="text-sm text-gray-600">Authentication Working</div>
              </div>
              <div className="bg-blue-50 p-4 rounded-lg">
                <div className="text-2xl font-bold text-blue-600">✓</div>
                <div className="text-sm text-gray-600">Dashboard Rendering</div>
              </div>
              <div className="bg-green-50 p-4 rounded-lg">
                <div className="text-2xl font-bold text-green-600">✓</div>
                <div className="text-sm text-gray-600">Components Loading</div>
              </div>
            </div>
          </div>

          {/* Test Actions */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Test Actions</h2>
            <div className="flex gap-4">
              <button 
                onClick={() => console.log('🔍 [TEST] Button clicked')}
                className="bg-mint-500 text-white px-4 py-2 rounded hover:bg-mint-600"
              >
                Test Console Log
              </button>
              <button 
                onClick={() => alert('Dashboard is working!')}
                className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
              >
                Test Alert
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
