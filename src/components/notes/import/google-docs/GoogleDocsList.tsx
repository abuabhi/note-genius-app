
import { ScrollArea } from "@/components/ui/scroll-area";
import { Checkbox } from "@/components/ui/checkbox";
import { FileText } from "lucide-react";

interface GoogleDocsListProps {
  documents: any[];
  selectedDocs: string[];
  onToggleSelection: (docId: string) => void;
  onSelectionChange: (docId: string, checked: boolean) => void;
}

export const GoogleDocsList = ({ 
  documents, 
  selectedDocs, 
  onToggleSelection, 
  onSelectionChange 
}: GoogleDocsListProps) => {
  if (documents.length === 0) return null;

  return (
    <div className="flex-1 border rounded-lg overflow-hidden bg-white">
      <ScrollArea className="h-full" style={{ height: '100%' }}>
        <div className="p-1">
          {documents.map((doc) => (
            <div 
              key={doc.id} 
              className={`p-4 border-b last:border-b-0 hover:bg-gray-50 transition-colors ${
                selectedDocs.includes(doc.id) ? 'bg-blue-50 border-blue-200' : ''
              }`}
            >
              <div className="flex items-start gap-3">
                <Checkbox
                  id={`doc-${doc.id}`}
                  checked={selectedDocs.includes(doc.id)}
                  onCheckedChange={(checked) => {
                    console.log('Checkbox changed:', doc.id, checked);
                    onSelectionChange(doc.id, !!checked);
                  }}
                  className="mt-1"
                />
                <FileText className="h-4 w-4 text-blue-600 mt-1 flex-shrink-0" />
                <div 
                  className="flex-1 min-w-0 cursor-pointer"
                  onClick={() => onToggleSelection(doc.id)}
                >
                  <div className="font-medium text-sm truncate">{doc.name}</div>
                  <div className="text-xs text-muted-foreground mt-1">
                    Created: {new Date(doc.createdTime).toLocaleDateString()}
                    {doc.modifiedTime && (
                      <> • Modified: {new Date(doc.modifiedTime).toLocaleDateString()}</>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </ScrollArea>
    </div>
  );
};
