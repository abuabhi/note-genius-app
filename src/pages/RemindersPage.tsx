
import Layout from "@/components/layout/Layout";
import { useRequireAuth } from "@/hooks/useRequireAuth";
import { StandardPageHeader } from "@/components/ui/StandardPageHeader";
import { Bell } from "lucide-react";

const RemindersPage = () => {
  const { user, loading } = useRequireAuth();

  if (loading) {
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
          description="Set and manage your study reminders"
          icon={<Bell className="h-6 w-6 text-white" />}
          breadcrumbs={breadcrumbs}
        />
        
        <div className="container mx-auto px-6 py-8">
          <div className="bg-white/60 backdrop-blur-sm rounded-xl border border-mint-100 p-6 shadow-lg">
            <div className="mt-8">
              <p className="text-gray-500">Reminders functionality coming soon...</p>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default RemindersPage;
