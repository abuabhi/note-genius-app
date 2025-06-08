
import Layout from '@/components/layout/Layout';
import { OptimizedNotesProvider } from '@/contexts/OptimizedNotesContext';
import { PageBreadcrumb } from '@/components/ui/page-breadcrumb';
import { FileText } from 'lucide-react';
import EnhancedErrorBoundary from '@/components/error/EnhancedErrorBoundary';
import { ProductionMonitoring } from '@/components/performance/ProductionMonitoring';
import { CacheMonitor } from '@/components/performance/CacheMonitor';
import { AdvancedCacheManager } from '@/components/performance/AdvancedCacheManager';
import { OptimizedNotesContent } from '@/components/notes/page/OptimizedNotesContent';
import { useRequireAuth } from '@/hooks/useRequireAuth';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Settings } from 'lucide-react';

const OptimizedNotesPage = () => {
  useRequireAuth();
  const [showCacheManager, setShowCacheManager] = useState(false);

  return (
    <EnhancedErrorBoundary>
      <Layout>
        <ProductionMonitoring />
        <CacheMonitor />
        
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-mint-50/30">
          <div className="container mx-auto p-4 md:p-6">
            <div className="flex items-center justify-between mb-6">
              <PageBreadcrumb 
                pageName="Notes" 
                pageIcon={<FileText className="h-3 w-3" />} 
              />
              
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowCacheManager(!showCacheManager)}
                className="flex items-center gap-2"
              >
                <Settings className="h-4 w-4" />
                {showCacheManager ? 'Hide' : 'Show'} Cache Manager
              </Button>
            </div>
            
            {showCacheManager && (
              <div className="mb-6">
                <AdvancedCacheManager />
              </div>
            )}
            
            <OptimizedNotesProvider>
              <OptimizedNotesContent />
            </OptimizedNotesProvider>
          </div>
        </div>
      </Layout>
    </EnhancedErrorBoundary>
  );
};

export default OptimizedNotesPage;
