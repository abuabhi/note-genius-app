
import React from 'react';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card';
import { FileText, ListChecks, HelpCircle, Lightbulb, FileSymlink, Pencil } from 'lucide-react';
import { EnhancementOption } from '@/hooks/noteEnrichment/types';

interface EnhancementSelectionProps {
  options: EnhancementOption[];
  selectedEnhancement: string | null;
  onSelect: (id: string) => void;
}

export const EnhancementSelection: React.FC<EnhancementSelectionProps> = ({
  options,
  selectedEnhancement,
  onSelect
}) => {
  const getIconComponent = (iconName: string) => {
    switch (iconName) {
      case 'FileText': return <FileText className="h-5 w-5" />;
      case 'ListChecks': return <ListChecks className="h-5 w-5" />;
      case 'HelpCircle': return <HelpCircle className="h-5 w-5" />;
      case 'Lightbulb': return <Lightbulb className="h-5 w-5" />;
      case 'FileSymlink': return <FileSymlink className="h-5 w-5" />;
      case 'Pencil': return <Pencil className="h-5 w-5" />;
      default: return <FileText className="h-5 w-5" />;
    }
  };

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
      {options.map((option) => (
        <Card 
          key={option.id}
          className={`cursor-pointer hover:border-primary transition-colors ${
            selectedEnhancement === option.id ? 'border-primary bg-primary/5' : ''
          }`}
          onClick={() => onSelect(option.id)}
        >
          <CardHeader className="p-4 pb-2">
            <div className="flex items-center gap-2">
              {getIconComponent(option.icon)}
              <CardTitle className="text-base">{option.name}</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="p-4 pt-0">
            <CardDescription>{option.description}</CardDescription>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};
