import { useMemo } from "react";
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from "@/components/ui/breadcrumb";
import { Home, FileText, Filter } from "lucide-react";
import { useOptimizedNotes } from "@/contexts/OptimizedNotesContext";

export const NotesPageBreadcrumb = () => {
  const { searchTerm, selectedSubject } = useOptimizedNotes();

  const breadcrumbItems = useMemo(() => {
    const items = [
      { href: "/", icon: Home, label: "Home" },
      { href: "/notes", icon: FileText, label: "Notes" },
    ];

    if (searchTerm) {
      items.push({ label: `Search: ${searchTerm}` });
    }

    if (selectedSubject && selectedSubject !== "all") {
      items.push({ label: `Subject: ${selectedSubject}` });
    }

    return items;
  }, [searchTerm, selectedSubject]);

  return (
    <Breadcrumb className="mb-4">
      <BreadcrumbList>
        {breadcrumbItems.map((item, index) => (
          <BreadcrumbItem key={index}>
            {index === breadcrumbItems.length - 1 ? (
              <>
                {item.icon && <item.icon className="h-4 w-4 mr-2" />}
                <BreadcrumbPage>{item.label}</BreadcrumbPage>
              </>
            ) : (
              <>
                <BreadcrumbLink href={item.href}>
                  {item.icon && <item.icon className="h-4 w-4 mr-2" />}
                  {item.label}
                </BreadcrumbLink>
                <BreadcrumbSeparator />
              </>
            )}
          </BreadcrumbItem>
        ))}
      </BreadcrumbList>
    </Breadcrumb>
  );
};
