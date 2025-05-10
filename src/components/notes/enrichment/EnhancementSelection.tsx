
import React from 'react';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card';
import { FileText, ListChecks, HelpCircle, Lightbulb, FileSymlink, Pencil } from 'lucide-react';
import { EnhancementOption, EnhancementFunction } from '@/hooks/useNoteEnrichment';

interface EnhancementSelectionProps {
  options: EnhancementOption[];
  selectedEnhancement: EnhancementFunction | null;
  onSelect: (id: EnhancementFunction) => void;
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

  const handleOptionClick = (id: EnhancementFunction) => {
    console.log("Enhancement option selected:", id);
    onSelect(id);
  };

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
      {options.map((option) => (
        <Card 
          key={option.id}
          className={`cursor-pointer border transition-colors ${
            selectedEnhancement === option.id 
              ? 'border-mint-500 bg-mint-50 shadow-sm' 
              : 'hover:border-mint-300 hover:bg-mint-50/50'
          }`}
          onClick={() => handleOptionClick(option.id)}
        >
          <CardHeader className="p-4 pb-2">
            <div className="flex items-center gap-2">
              <div className={`text-mint-600 ${selectedEnhancement === option.id ? 'text-mint-700' : ''}`}>
                {getIconComponent(option.icon)}
              </div>
              <CardTitle className="text-base">{option.name}</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="p-4 pt-0">
            <CardDescription className={selectedEnhancement === option.id ? 'text-mint-700' : ''}>
              {option.description}
            </CardDescription>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};
