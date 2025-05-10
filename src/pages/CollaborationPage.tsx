
import Layout from "@/components/layout/Layout";
import CollaborationHub from "@/components/collaboration/CollaborationHub";
import { FeatureDisabledAlert } from "@/components/routes/FeatureProtectedRoute";

const CollaborationPage = () => {
  return (
    <Layout>
      <div className="container mx-auto p-6">
        <h1 className="text-3xl font-bold mb-6">Collaboration Hub</h1>
        <FeatureDisabledAlert featureKey="collaboration" featureDisplayName="Collaboration" />
        <CollaborationHub />
      </div>
    </Layout>
  );
};

export default CollaborationPage;
