
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
    { id: 'googledocs', name: 'Google Docs', icon: GoogleDocsIcon, comingSoon: false },
    { id: 'notion', name: 'Notion', icon: Book, comingSoon: true }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
      {services.map(service => (
        <div key={service.id} className="flex justify-center">
          <ImportServiceCard 
            icon={service.icon}
            name={service.name}
            isSelected={selectedService === service.id}
            onSelect={() => onSelectService(service.id)}
            comingSoon={service.comingSoon}
          />
        </div>
      ))}
    </div>
  );
};
