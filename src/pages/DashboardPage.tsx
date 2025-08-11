
import { useRequireAuth } from "@/hooks/useRequireAuth";
import { Loader2 } from "lucide-react";
import { RestoreDashboard } from "@/components/dashboard/RestoreDashboard";
import { DashboardErrorBoundary } from "@/components/error/DashboardErrorBoundary";
import { Helmet } from "react-helmet";

const DashboardPage = () => {
  const {
    user,
    userProfile,
    loading
  } = useRequireAuth();
  
  if (loading) {
    return (
      <div className="container mx-auto p-6 flex items-center justify-center h-[50vh]">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto text-primary" />
          <p className="mt-2 text-muted-foreground">Loading your dashboard...</p>
        </div>
      </div>
    );
  }
  
  if (!user) {
    return null; // Will redirect via the useRequireAuth hook
  }
  
  return (
    <DashboardErrorBoundary>
      <Helmet>
        <meta name="robots" content="noindex,nofollow" />
      </Helmet>
      <RestoreDashboard />
    </DashboardErrorBoundary>
  );
};

export default DashboardPage;
