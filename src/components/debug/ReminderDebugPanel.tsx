
import { useUnifiedReminderSystem } from '@/hooks/useUnifiedReminderSystem';
import { Button } from '@/components/ui/button';
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/auth';

export const ReminderDebugPanel = () => {
  const { user } = useAuth();
  const { reminders, totalCount, isLoading, refresh } = useUnifiedReminderSystem({
    limit: 1000,
    enableRealtime: true,
  });
  
  const [debugInfo, setDebugInfo] = useState<string>('');
  
  // Debug function to check database state
  const debugDatabaseState = async () => {
    if (!user) return;
    
    try {
      console.log('🔍 Starting database debug...');
      
      // Get ALL reminders for this user regardless of status
      const { data: allReminders, error } = await supabase
        .from('reminders')
        .select('id, title, status, created_at, updated_at')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });
      
      if (error) {
        console.error('❌ Debug query error:', error);
        setDebugInfo(`Error: ${error.message}`);
        return;
      }
      
      const statusCounts = allReminders?.reduce((acc, reminder) => {
        acc[reminder.status] = (acc[reminder.status] || 0) + 1;
        return acc;
      }, {} as Record<string, number>) || {};
      
      const debugOutput = {
        totalInDatabase: allReminders?.length || 0,
        statusBreakdown: statusCounts,
        currentlyShown: reminders.length,
        recentReminders: allReminders?.slice(0, 5).map(r => ({
          id: r.id.slice(-8),
          title: r.title,
          status: r.status,
          created: new Date(r.created_at).toLocaleString(),
          updated: new Date(r.updated_at).toLocaleString()
        })) || []
      };
      
      console.log('🔍 Database debug result:', debugOutput);
      setDebugInfo(JSON.stringify(debugOutput, null, 2));
      
    } catch (error) {
      console.error('❌ Debug error:', error);
      setDebugInfo(`Debug error: ${error}`);
    }
  };

  if (isLoading) {
    return <div className="p-4 bg-blue-50 rounded-lg">Loading debug panel...</div>;
  }

  return (
    <div className="bg-gray-50 p-6 rounded-lg border">
      <h3 className="font-semibold text-lg mb-4">🐛 Reminder System Debug Panel</h3>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
        <div className="bg-white p-3 rounded border">
          <h4 className="font-medium text-gray-700">Current Query</h4>
          <p className="text-2xl font-bold text-blue-600">{totalCount}</p>
          <p className="text-xs text-gray-500">Filtered reminders</p>
        </div>
        
        <div className="bg-white p-3 rounded border">
          <h4 className="font-medium text-gray-700">Status Breakdown</h4>
          <div className="text-sm">
            <div>Pending: {reminders.filter(r => r.status === 'pending').length}</div>
            <div>Sent: {reminders.filter(r => r.status === 'sent').length}</div>
          </div>
        </div>
        
        <div className="bg-white p-3 rounded border">
          <h4 className="font-medium text-gray-700">Actions</h4>
          <div className="space-y-2">
            <Button size="sm" onClick={refresh} className="w-full">
              Refresh Query
            </Button>
            <Button size="sm" variant="outline" onClick={debugDatabaseState} className="w-full">
              Debug Database
            </Button>
          </div>
        </div>
      </div>

      {debugInfo && (
        <div className="bg-gray-800 text-green-400 p-3 rounded font-mono text-xs overflow-auto max-h-40">
          <pre>{debugInfo}</pre>
        </div>
      )}
      
      <div className="mt-4">
        <h4 className="font-medium mb-2">Current Reminders:</h4>
        <div className="space-y-1 max-h-40 overflow-auto">
          {reminders.map((reminder) => (
            <div key={reminder.id} className="bg-white p-2 rounded border text-xs">
              <div className="flex justify-between items-center">
                <span className="font-medium">{reminder.title}</span>
                <span className={`px-2 py-1 rounded text-xs ${
                  reminder.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                  reminder.status === 'sent' ? 'bg-red-100 text-red-800' :
                  'bg-gray-100 text-gray-800'
                }`}>
                  {reminder.status}
                </span>
              </div>
              <div className="text-gray-500 mt-1">
                ID: {reminder.id.slice(-8)} | Created: {new Date(reminder.created_at).toLocaleString()}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
