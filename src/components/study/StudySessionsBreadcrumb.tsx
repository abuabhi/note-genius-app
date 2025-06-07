
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from "@/components/ui/breadcrumb";
import { useUnifiedStudyStats } from "@/hooks/useUnifiedStudyStats";

interface StudySessionsBreadcrumbProps {
  activeFilter: string;
  sessionCount?: number; // Make this optional since we'll use unified stats
}

export const StudySessionsBreadcrumb = ({ activeFilter }: StudySessionsBreadcrumbProps) => {
  const { stats } = useUnifiedStudyStats();

  const getFilterDisplayName = (filter: string) => {
    switch (filter) {
      case 'analytics':
        return 'Analytics Overview';
      case 'recent':
        return 'Recent Sessions';
      case 'archived':
        return 'Archived Sessions';
      case 'all':
      default:
        return 'All Sessions';
    }
  };

  return (
    <div className="flex flex-col md:flex-row md:items-center justify-between">
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink href="/dashboard">Dashboard</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>Study Sessions</BreadcrumbPage>
          </BreadcrumbItem>
          {activeFilter !== 'analytics' && (
            <>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbPage>{getFilterDisplayName(activeFilter)}</BreadcrumbPage>
              </BreadcrumbItem>
            </>
          )}
        </BreadcrumbList>
      </Breadcrumb>
      
      <div className="mt-2 md:mt-0">
        <span className="text-sm text-mint-600">
          {stats.totalSessions} sessions
        </span>
      </div>
    </div>
  );
};
