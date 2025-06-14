
import Layout from '@/components/layout/Layout';
import { OptimizedNotesProvider } from '@/contexts/OptimizedNotesContext';
import { PageBreadcrumb } from '@/components/ui/page-breadcrumb';
import { FileText } from 'lucide-react';
import EnhancedErrorBoundary from '@/components/error/EnhancedErrorBoundary';
import { CacheMonitor } from '@/components/performance/CacheMonitor';
import { SecureOptimizedNotesContent } from '@/components/notes/page/SecureOptimizedNotesContent';
import { useRequireAuth } from '@/hooks/useRequireAuth';

const OptimizedNotesPage = () => {
  useRequireAuth();

  return (
    <EnhancedErrorBoundary>
      <Layout>
        <CacheMonitor />
        
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-mint-50/30">
          <div className="container mx-auto p-4 md:p-6">
            <div className="flex items-center justify-between mb-6">
              <PageBreadcrumb 
                pageName="Notes" 
                pageIcon={<FileText className="h-3 w-3" />} 
              />
            </div>
            
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
