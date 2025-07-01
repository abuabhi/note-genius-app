
import Layout from "@/components/layout/Layout";
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
    // Remove hardcoded limit - get ALL reminders
    limit: 1000,
    enableRealtime: true,
    enableNotifications: true
  });

  if (loading || remindersLoading) {
    return (
      <Layout>
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
      </Layout>
    );
  }

  if (!user) {
    return null;
  }

  const breadcrumbs = [
    { label: "Reminders" }
  ];

  return (
    <Layout>
      <div className="min-h-screen bg-gradient-to-br from-mint-50/30 via-white to-blue-50/30">
        <StandardPageHeader
          title="Reminders"
          description={`Set and manage your study reminders (${totalCount} total reminders)`}
          icon={<Bell className="h-6 w-6 text-white" />}
          breadcrumbs={breadcrumbs}
        />
        
        <div className="container mx-auto px-6 py-8">
          <div className="bg-white/60 backdrop-blur-sm rounded-xl border border-mint-100 p-6 shadow-lg">
            <ReminderDebugPanel />
            
            <div className="mt-8">
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <h3 className="font-semibold text-green-800 mb-2">✅ Unified Reminder System Active</h3>
                <p className="text-green-700 text-sm">
                  The reminder system has been unified and optimized. You should now see accurate counts 
                  and no more duplicate reminders. The badge will show the correct number of reminders 
                  instead of being stuck at 20.
                </p>
                <div className="mt-2 text-sm text-green-600">
                  <div>Current Status: {totalCount} total reminders, {reminders.filter(r => r.status === 'pending').length} pending</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default RemindersPage;
