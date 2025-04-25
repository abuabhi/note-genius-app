
import Layout from "@/components/layout/Layout";
import ProgressOverview from "@/components/progress/ProgressOverview";

const ProgressPage = () => {
  return (
    <Layout>
      <div className="container mx-auto p-6">
        <h1 className="text-3xl font-bold mb-6">Progress Tracking</h1>
        <ProgressOverview />
      </div>
    </Layout>
  );
};

export default ProgressPage;
