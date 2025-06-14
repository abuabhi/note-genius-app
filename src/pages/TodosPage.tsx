
import Layout from "@/components/layout/Layout";
import { useRequireAuth } from "@/hooks/useRequireAuth";

const TodosPage = () => {
  const { user, loading } = useRequireAuth();

  if (loading) {
    return (
      <Layout>
        <div className="min-h-screen bg-gradient-to-br from-mint-50 via-white to-mint-100/30">
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

  return (
    <Layout>
      <div className="min-h-screen bg-gradient-to-br from-mint-50 via-white to-mint-100/30">
        <div className="container mx-auto p-4 md:p-6">
          <div className="bg-white/60 backdrop-blur-sm rounded-xl border border-mint-100 p-6 shadow-lg">
            <h1 className="text-3xl font-bold text-mint-900 mb-4">ToDo List</h1>
            <p className="text-mint-600">Manage your tasks and stay organized.</p>
            <div className="mt-8">
              <p className="text-gray-500">ToDo functionality coming soon...</p>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default TodosPage;
