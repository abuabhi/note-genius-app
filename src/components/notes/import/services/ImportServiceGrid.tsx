
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
    { id: 'onenote', name: 'OneNote', icon: FileText, comingSoon: false },
    { id: 'googledocs', name: 'Google Docs', icon: GoogleDocsIcon, comingSoon: false }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full">
      {services.map(service => (
        <ImportServiceCard 
          key={service.id}
          icon={service.icon}
          name={service.name}
          isSelected={selectedService === service.id}
          onSelect={() => onSelectService(service.id)}
          comingSoon={service.comingSoon}
        />
      ))}
    </div>
  );
};
