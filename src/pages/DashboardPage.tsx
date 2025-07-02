
import { useRequireAuth } from "@/hooks/useRequireAuth";
import { Loader2 } from "lucide-react";
import { SimpleDashboard } from "@/components/dashboard/SimpleDashboard";
import { DashboardErrorBoundary } from "@/components/error/DashboardErrorBoundary";

const DashboardPage = () => {
  console.log('🏠 [DASHBOARD PAGE] Component rendering');
  
  const {
    user,
    userProfile,
    loading
  } = useRequireAuth();
  
  console.log('🏠 [DASHBOARD PAGE] Auth hook results:', {
    userId: user?.id,
    userEmail: user?.email,
    profileId: userProfile?.id,
    loading
  });
  
  if (loading) {
    console.log('🏠 [DASHBOARD PAGE] Showing loading spinner');
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
    console.log('🏠 [DASHBOARD PAGE] No user found - useRequireAuth should handle redirect');
    return null; // Will redirect via the useRequireAuth hook
  }

  console.log('🏠 [DASHBOARD PAGE] Rendering main dashboard');
  
  return (
    <DashboardErrorBoundary>
      <SimpleDashboard />
    </DashboardErrorBoundary>
  );
};

export default DashboardPage;
