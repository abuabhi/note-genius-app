
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from "@/components/ui/breadcrumb";

interface StudySessionsBreadcrumbProps {
  activeFilter: string;
}

export const StudySessionsBreadcrumb = ({ activeFilter }: StudySessionsBreadcrumbProps) => {
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
  );
};
