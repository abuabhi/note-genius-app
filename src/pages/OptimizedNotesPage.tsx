
import Layout from '@/components/layout/Layout';
import { StandardPageHeader } from '@/components/ui/StandardPageHeader';
import { FileText } from 'lucide-react';
import EnhancedErrorBoundary from '@/components/error/EnhancedErrorBoundary';
import { SimplifiedNotesContent } from '@/components/notes/page/SimplifiedNotesContent';
import { useRequireAuth } from '@/hooks/useRequireAuth';

const OptimizedNotesPage = () => {
  useRequireAuth();

  const breadcrumbs = [
    { label: "Notes" }
  ];

  return (
    <EnhancedErrorBoundary>
      <Layout>        
        <div className="min-h-screen bg-gradient-to-br from-mint-50/30 via-white to-blue-50/30">
          <StandardPageHeader
            title="Notes"
            description="Create, organize, and manage your study notes"
            icon={<FileText className="h-6 w-6 text-white" />}
            breadcrumbs={breadcrumbs}
          />
          
          <div className="container mx-auto px-6 py-8">
            <SimplifiedNotesContent />
          </div>
        </div>
      </Layout>
    </EnhancedErrorBoundary>
  );
};

export default OptimizedNotesPage;
