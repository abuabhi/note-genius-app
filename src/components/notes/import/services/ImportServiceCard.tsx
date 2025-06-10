
import { Card, CardContent } from "@/components/ui/card";
import { LucideIcon } from "lucide-react";

interface ImportServiceCardProps {
  icon: LucideIcon;
  name: string;
  isSelected: boolean;
  onSelect: () => void;
}

export const ImportServiceCard = ({ 
  icon: Icon, 
  name, 
  isSelected, 
  onSelect 
}: ImportServiceCardProps) => {
  return (
    <Card 
      className={`cursor-pointer transition-all duration-200 hover:scale-105 ${
        isSelected 
          ? 'border-mint-500 bg-mint-50 shadow-md' 
          : 'border-gray-200 bg-white hover:border-mint-300 hover:bg-mint-50/30'
      }`}
      onClick={onSelect}
    >
      <CardContent className="p-4 flex flex-col items-center text-center">
        <div className={`p-3 rounded-lg mb-3 transition-colors ${
          isSelected 
            ? 'bg-mint-500 shadow-sm' 
            : 'bg-gray-100 group-hover:bg-mint-500'
        }`}>
          <Icon className={`h-5 w-5 transition-colors ${
            isSelected ? 'text-white' : 'text-gray-600'
          }`} />
        </div>
        
        <p className={`font-medium text-sm transition-colors ${
          isSelected ? 'text-mint-800' : 'text-gray-700'
        }`}>
          {name}
        </p>
        
        {isSelected && (
          <div className="absolute -top-1 -right-1 w-4 h-4 bg-mint-500 rounded-full flex items-center justify-center">
            <div className="w-1.5 h-1.5 bg-white rounded-full" />
          </div>
        )}
      </CardContent>
    </Card>
  );
};
