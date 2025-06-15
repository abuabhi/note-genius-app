
import Layout from '@/components/layout/Layout';
import { OptimizedNotesProvider } from '@/contexts/OptimizedNotesContext';
import { StandardPageHeader } from '@/components/ui/StandardPageHeader';
import { FileText } from 'lucide-react';
import EnhancedErrorBoundary from '@/components/error/EnhancedErrorBoundary';
import { CacheMonitor } from '@/components/performance/CacheMonitor';
import { PerformanceDashboard } from '@/components/performance/PerformanceDashboard';
import { EnhancedServiceWorkerManager } from '@/components/performance/EnhancedServiceWorkerManager';
import { SecureOptimizedNotesContent } from '@/components/notes/page/SecureOptimizedNotesContent';
import { useRequireAuth } from '@/hooks/useRequireAuth';

const OptimizedNotesPage = () => {
  useRequireAuth();

  const breadcrumbs = [
    { label: "Notes" }
  ];

  return (
    <EnhancedErrorBoundary>
      <Layout>
        <CacheMonitor />
        <PerformanceDashboard />
        <EnhancedServiceWorkerManager />
        
        <div className="min-h-screen bg-gradient-to-br from-mint-50/30 via-white to-blue-50/30">
          <StandardPageHeader
            title="Notes"
            description="Create, organize, and manage your study notes"
            icon={<FileText className="h-6 w-6 text-white" />}
            breadcrumbs={breadcrumbs}
          />
          
          <div className="container mx-auto px-6 py-8">
            <OptimizedNotesProvider>
              <SecureOptimizedNotesContent />
            </OptimizedNotesProvider>
          </div>
        </div>
      </Layout>
    </EnhancedErrorBoundary>
  );
};

export default OptimizedNotesPage;
