
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
      className={`cursor-pointer hover:border-mint-500 transition-colors ${isSelected ? 'border-mint-500 bg-mint-50' : 'border-mint-200'}`}
      onClick={onSelect}
    >
      <CardContent className="p-4 flex flex-col items-center">
        <Icon className="h-5 w-5 text-mint-600 mb-2" />
        <p className="font-medium text-mint-800 text-sm">{name}</p>
      </CardContent>
    </Card>
  );
};
