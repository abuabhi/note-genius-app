

import { useRequireAuth } from "@/hooks/useRequireAuth";
import { StandardPageHeader } from "@/components/ui/StandardPageHeader";
import { ReminderDebugPanel } from "@/components/debug/ReminderDebugPanel";
import { Bell } from "lucide-react";
import { useUnifiedReminderSystem } from "@/hooks/useUnifiedReminderSystem";

const RemindersPage = () => {
  const { user, loading } = useRequireAuth();
  const { 
    reminders, 
    totalCount, 
    isLoading: remindersLoading 
  } = useUnifiedReminderSystem({
    limit: 1000,
    enableRealtime: true,
    enableNotifications: true
  });

  if (loading || remindersLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-mint-50/30 via-white to-blue-50/30">
        <div className="container mx-auto p-4 md:p-6">
          <div className="flex items-center justify-center h-[80vh]">
            <div className="relative w-12 h-12">
              <div className="absolute inset-0 border-4 border-mint-100 rounded-full"></div>
              <div className="absolute inset-0 border-4 border-mint-500 rounded-full border-t-transparent animate-spin"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  const breadcrumbs = [
    { label: "Reminders" }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-mint-50/30 via-white to-blue-50/30">
      <StandardPageHeader
        title="🎯 UNIFIED Reminder System"
        description={`Single source of truth for reminders (${totalCount} total) - All other systems DELETED`}
        icon={<Bell className="h-6 w-6 text-white" />}
        breadcrumbs={breadcrumbs}
      />
      
      <div className="container mx-auto px-6 py-8">
        <div className="bg-white/60 backdrop-blur-sm rounded-xl border border-mint-100 p-6 shadow-lg">
          <ReminderDebugPanel />
          
          <div className="mt-8">
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <h3 className="font-semibold text-green-800 mb-2">✅ UNIFIED Reminder System - SINGLE SOURCE OF TRUTH</h3>
              <p className="text-green-700 text-sm">
                🎯 All other reminder systems have been DELETED. Only useUnifiedReminderSystem exists now.
                <br />
                🗑️ When you dismiss reminders, they are marked as 'cancelled' and excluded from all queries.
                <br />
                🔄 No more competing systems or cache conflicts - dismissed reminders will STAY dismissed.
              </p>
              <div className="mt-2 text-sm text-green-600">
                <div>Status: {totalCount} total reminders, {reminders.filter(r => r.status === 'pending').length} pending</div>
                <div>System: UNIFIED ONLY (all deprecated hooks deleted)</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RemindersPage;
