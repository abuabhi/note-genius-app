
import Layout from "@/components/layout/Layout";
import SettingsForm from "@/components/settings/SettingsForm";

const SettingsPage = () => {
  return (
    <Layout>
      <div className="container max-w-4xl mx-auto p-6">
        <h1 className="text-3xl font-bold mb-6">Settings</h1>
        <SettingsForm />
      </div>
    </Layout>
  );
};

export default SettingsPage;
