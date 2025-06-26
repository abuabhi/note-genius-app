
import Layout from "@/components/layout/Layout";
import { StandardPageHeader } from "@/components/ui/StandardPageHeader";
import { AdvancedAnalyticsDashboard } from "@/components/analytics/AdvancedAnalyticsDashboard";
import { BarChart3 } from "lucide-react";
import { useRequireAuth } from "@/hooks/useRequireAuth";

const AnalyticsPage = () => {
  useRequireAuth();

  const breadcrumbs = [
    { label: "Analytics" }
  ];

  return (
    <Layout>
      <div className="min-h-screen bg-gradient-to-br from-blue-50/30 via-white to-purple-50/30">
        <StandardPageHeader
          title="Advanced Analytics"
          description="Deep insights into your learning performance and patterns"
          icon={<BarChart3 className="h-6 w-6 text-white" />}
          breadcrumbs={breadcrumbs}
        />
        
        <div className="container mx-auto px-6 py-8">
          <AdvancedAnalyticsDashboard />
        </div>
      </div>
    </Layout>
  );
};

export default AnalyticsPage;
