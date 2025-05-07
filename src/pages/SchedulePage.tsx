
import { useEffect } from "react";
import Layout from "@/components/layout/Layout";
import { ScheduleCalendar } from "@/components/schedule/ScheduleCalendar";
import { ScheduleHeader } from "@/components/schedule/ScheduleHeader";
import { useRequireAuth } from "@/hooks/useRequireAuth";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

// Create a client
const queryClient = new QueryClient();

const SchedulePage = () => {
  // Ensure user is authenticated
  const { isAuthorized, loading } = useRequireAuth();

  // If not logged in, this will redirect to login
  if (loading) {
    return (
      <Layout>
        <div className="container mx-auto p-6 flex justify-center items-center min-h-[60vh]">
          <div className="animate-pulse">Loading...</div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <QueryClientProvider client={queryClient}>
        <div className="container mx-auto p-6">
          <ScheduleHeader />
          <ScheduleCalendar />
        </div>
      </QueryClientProvider>
    </Layout>
  );
};

export default SchedulePage;
