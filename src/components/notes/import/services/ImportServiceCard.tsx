
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
      className={`cursor-pointer transition-all duration-200 hover:shadow-md ${
        isSelected 
          ? 'border-mint-500 bg-mint-50 shadow-sm' 
          : 'border-gray-200 bg-white hover:border-gray-300'
      }`}
      onClick={onSelect}
    >
      <CardContent className="p-4 flex flex-col items-center text-center">
        <Icon className={`h-6 w-6 mb-3 ${isSelected ? 'text-mint-600' : 'text-gray-500'}`} />
        <p className={`font-medium text-sm ${isSelected ? 'text-mint-800' : 'text-gray-800'}`}>
          {name}
        </p>
      </CardContent>
    </Card>
  );
};
