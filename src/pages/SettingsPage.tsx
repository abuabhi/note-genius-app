
import { SettingsFormProvider } from '@/components/settings/SettingsFormProvider';
import { useRequireAuth } from '@/hooks/useRequireAuth';
import { StandardPageHeader } from '@/components/ui/StandardPageHeader';
import { Settings } from 'lucide-react';
import { Helmet } from 'react-helmet';

const SettingsPage = () => {
  const { loading } = useRequireAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-mint-50/30 via-white to-blue-50/30">
        <div className="container mx-auto p-4 md:p-6 h-full">
          <div className="flex justify-center items-center h-[80vh]">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary" />
          </div>
        </div>
      </div>
    );
  }

  const breadcrumbs = [
    { label: "Settings" }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-mint-50/30 via-white to-blue-50/30">
      <Helmet>
        <meta name="robots" content="noindex,nofollow" />
      </Helmet>
      <StandardPageHeader
        title="Settings"
        description="Manage your account preferences and application settings"
        icon={<Settings className="h-6 w-6 text-white" />}
        breadcrumbs={breadcrumbs}
      />
      
      <div className="container mx-auto px-6 py-8">
        <SettingsFormProvider />
      </div>
    </div>
  );
};

export default SettingsPage;
