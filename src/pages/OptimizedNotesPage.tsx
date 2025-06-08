
import Layout from '@/components/layout/Layout';
import { OptimizedNotesProvider } from '@/contexts/OptimizedNotesContext';
import { PageBreadcrumb } from '@/components/ui/page-breadcrumb';
import { FileText } from 'lucide-react';
import { ProductionErrorBoundary } from '@/components/error/ProductionErrorBoundary';
import { ProductionMonitoring } from '@/components/performance/ProductionMonitoring';
import { CacheMonitor } from '@/components/performance/CacheMonitor';
import { OptimizedNotesContent } from '@/components/notes/page/OptimizedNotesContent';
import { useRequireAuth } from '@/hooks/useRequireAuth';

const OptimizedNotesPage = () => {
  useRequireAuth();

  return (
    <ProductionErrorBoundary
      enableReporting={true}
      showErrorDetails={process.env.NODE_ENV === 'development'}
    >
      <Layout>
        <ProductionMonitoring />
        <CacheMonitor />
        
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-mint-50/30">
          <div className="container mx-auto p-4 md:p-6">
            <PageBreadcrumb 
              pageName="Notes" 
              pageIcon={<FileText className="h-3 w-3" />} 
            />
            
            <OptimizedNotesProvider>
              <OptimizedNotesContent />
            </OptimizedNotesProvider>
          </div>
        </div>
      </Layout>
    </ProductionErrorBoundary>
  );
};

export default OptimizedNotesPage;
