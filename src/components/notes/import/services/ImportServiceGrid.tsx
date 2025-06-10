
import { Book, FileText, File as GoogleDocsIcon } from "lucide-react";
import { ImportServiceCard } from "./ImportServiceCard";

interface ImportServiceGridProps {
  selectedService: string | null;
  onSelectService: (service: string) => void;
}

export const ImportServiceGrid = ({ 
  selectedService, 
  onSelectService 
}: ImportServiceGridProps) => {
  const services = [
    { id: 'onenote', name: 'OneNote', icon: FileText },
    { id: 'googledocs', name: 'Google Docs', icon: GoogleDocsIcon },
    { id: 'notion', name: 'Notion', icon: Book }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {services.map(service => (
        <ImportServiceCard 
          key={service.id}
          icon={service.icon}
          name={service.name}
          isSelected={selectedService === service.id}
          onSelect={() => onSelectService(service.id)}
        />
      ))}
    </div>
  );
};
