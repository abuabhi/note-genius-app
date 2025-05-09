
import { useRequireAuth } from "@/hooks/useRequireAuth";
import Layout from "@/components/layout/Layout";
import { ConnectionsManager } from "@/components/connections/ConnectionsManager";
import { RemindersView } from "@/components/reminders/RemindersView";

const ConnectionsPage = () => {
  const { loading } = useRequireAuth();
  
  if (loading) {
    return (
      <Layout>
        <div className="container mx-auto p-6">
          <div className="flex items-center justify-center h-[50vh]">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          </div>
        </div>
      </Layout>
    );
  }
  
  return (
    <Layout>
      <div className="container mx-auto p-6">
        <h1 className="text-3xl font-bold mb-2">Connections & Reminders</h1>
        <p className="text-muted-foreground mb-6">
          Manage your connections with other users and set up study reminders
        </p>
        
        <div className="grid gap-8 grid-cols-1 lg:grid-cols-2">
          <div>
            <ConnectionsManager />
          </div>
          <div>
            <RemindersView />
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default ConnectionsPage;
