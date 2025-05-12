
import React from 'react';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card';
import { FileText, ListChecks, HelpCircle, Lightbulb, FileSymlink, Pencil, Check, Code, Brush } from 'lucide-react';
import { EnhancementFunction, EnhancementOption } from '@/hooks/noteEnrichment/types';
import { Separator } from '@/components/ui/separator';

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
      case 'Check': return <Check className="h-5 w-5" />;
      case 'Code': return <Code className="h-5 w-5" />;
      case 'Brush': return <Brush className="h-5 w-5" />;
      default: return <FileText className="h-5 w-5" />;
    }
  };

  // Group enhancement options by category
  const nonReplacementOptions = options.filter(opt => !opt.replaceContent);
  const replacementOptions = options.filter(opt => opt.replaceContent);

  return (
    <div className="space-y-4">
      {/* Non-replacement options (Summary, Key Points, etc.) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {nonReplacementOptions.map((option) => {
          const isSelected = selectedEnhancement === option.value;
          
          return (
            <Card 
              key={option.id}
              className={`cursor-pointer border transition-colors ${
                isSelected 
                  ? 'border-mint-500 bg-mint-50 shadow-sm' 
                  : 'hover:border-mint-300 hover:bg-mint-50/50'
              }`}
              onClick={() => {
                console.log(`Selecting enhancement: ${option.value}`);
                onSelect(option.value);
              }}
            >
              <CardHeader className="p-4 pb-2">
                <div className="flex items-center gap-2">
                  <div className={`text-mint-600 ${isSelected ? 'text-mint-700' : ''}`}>
                    {getIconComponent(option.icon)}
                  </div>
                  <CardTitle className="text-base">{option.title}</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="p-4 pt-0">
                <CardDescription className={isSelected ? 'text-mint-700' : ''}>
                  {option.description}
                </CardDescription>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Add divider between categories */}
      {nonReplacementOptions.length > 0 && replacementOptions.length > 0 && (
        <div className="px-2 py-1">
          <Separator className="my-2" />
          <p className="text-sm text-muted-foreground py-1">Content Improvements</p>
        </div>
      )}

      {/* Replacement options (Fix Grammar, Improve Clarity, etc.) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {replacementOptions.map((option) => {
          const isSelected = selectedEnhancement === option.value;
          
          return (
            <Card 
              key={option.id}
              className={`cursor-pointer border transition-colors ${
                isSelected 
                  ? 'border-mint-500 bg-mint-50 shadow-sm' 
                  : 'hover:border-mint-300 hover:bg-mint-50/50'
              }`}
              onClick={() => {
                console.log(`Selecting enhancement: ${option.value}`);
                onSelect(option.value);
              }}
            >
              <CardHeader className="p-4 pb-2">
                <div className="flex items-center gap-2">
                  <div className={`text-mint-600 ${isSelected ? 'text-mint-700' : ''}`}>
                    {getIconComponent(option.icon)}
                  </div>
                  <CardTitle className="text-base">{option.title}</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="p-4 pt-0">
                <CardDescription className={isSelected ? 'text-mint-700' : ''}>
                  {option.description}
                </CardDescription>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
};
