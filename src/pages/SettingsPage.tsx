
import Layout from '@/components/layout/Layout';
import { SettingsFormProvider } from '@/components/settings/SettingsFormProvider';
import { SettingsForm } from '@/components/settings/SettingsForm';
import { useRequireAuth } from '@/hooks/useRequireAuth';
import { PageBreadcrumb } from '@/components/ui/page-breadcrumb';
import { Settings } from 'lucide-react';

const SettingsPage = () => {
  const { loading } = useRequireAuth();

  if (loading) {
    return (
      <Layout>
        <div className="container mx-auto p-4 md:p-6 h-full">
          <div className="flex justify-center items-center h-[80vh]">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary" />
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container mx-auto p-4 md:p-6">
        <PageBreadcrumb pageName="Settings" pageIcon={<Settings className="h-3 w-3" />} />
        <SettingsFormProvider>
          <SettingsForm />
        </SettingsFormProvider>
      </div>
    </Layout>
  );
};

export default SettingsPage;
