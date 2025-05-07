
import { Book, File, FileText } from "lucide-react";
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
    { id: 'notion', name: 'Notion', icon: Book },
    { id: 'onenote', name: 'OneNote', icon: File },
    { id: 'evernote', name: 'Evernote', icon: FileText },
    { id: 'googledocs', name: 'Google Docs', icon: File }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
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
