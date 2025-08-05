
import { useNavigate } from 'react-router-dom';
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
  const navigate = useNavigate();
  const services = [
    { id: 'onenote', name: 'OneNote', icon: FileText, comingSoon: false },
    { id: 'googledocs', name: 'Google Docs', icon: GoogleDocsIcon, comingSoon: false }
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-center gap-6">
        {services.map(service => (
          <div key={service.id} className="w-48">
            <ImportServiceCard 
              icon={service.icon}
              name={service.name}
              isSelected={selectedService === service.id}
              onSelect={() => {
                if (service.id === 'googledocs') {
                  navigate('/import/google-docs');
                } else {
                  onSelectService(service.id);
                }
              }}
              comingSoon={service.comingSoon}
            />
          </div>
        ))}
      </div>
      
      <div className="space-y-4 text-center">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
          <div className="p-4 rounded-lg bg-muted/30 border border-border/50">
            <h4 className="font-medium text-foreground mb-2">OneNote</h4>
            <p className="text-sm text-muted-foreground">
              Click to authenticate with Microsoft and select pages to import from your OneNote notebooks. You'll be redirected to sign in with your Microsoft account.
            </p>
          </div>
          
          <div className="p-4 rounded-lg bg-muted/30 border border-border/50">
            <h4 className="font-medium text-foreground mb-2">Google Docs</h4>
            <p className="text-sm text-muted-foreground">
              Click to authenticate with Google and choose documents to import from your Google Drive. You'll be redirected to sign in with your Google account.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
