
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { LucideIcon } from "lucide-react";

interface ImportServiceCardProps {
  icon: LucideIcon;
  name: string;
  isSelected: boolean;
  onSelect: () => void;
  comingSoon?: boolean;
}

export const ImportServiceCard = ({ 
  icon: Icon, 
  name, 
  isSelected, 
  onSelect,
  comingSoon = false
}: ImportServiceCardProps) => {
  return (
    <Card 
      className={`cursor-pointer transition-all duration-200 hover:scale-105 relative ${
        comingSoon 
          ? 'border-gray-200 bg-gray-50 opacity-75' 
          : isSelected 
            ? 'border-mint-500 bg-mint-50 shadow-md' 
            : 'border-gray-200 bg-white hover:border-mint-300 hover:bg-mint-50/30'
      }`}
      onClick={comingSoon ? undefined : onSelect}
    >
      <CardContent className="p-4 flex flex-col items-center text-center">
        {comingSoon && (
          <Badge 
            variant="outline" 
            className="absolute -top-2 -right-2 bg-mint-100 text-mint-700 border-mint-300 text-xs font-medium"
          >
            Coming Soon
          </Badge>
        )}
        
        <div className={`p-3 rounded-lg mb-3 transition-colors ${
          comingSoon
            ? 'bg-gray-200'
            : isSelected 
              ? 'bg-mint-500 shadow-sm' 
              : 'bg-gray-100 group-hover:bg-mint-500'
        }`}>
          <Icon className={`h-5 w-5 transition-colors ${
            comingSoon
              ? 'text-gray-500'
              : isSelected 
                ? 'text-white' 
                : 'text-gray-600'
          }`} />
        </div>
        
        <p className={`font-medium text-sm transition-colors ${
          comingSoon
            ? 'text-gray-500'
            : isSelected 
              ? 'text-mint-800' 
              : 'text-gray-700'
        }`}>
          {name}
        </p>
        
        {isSelected && !comingSoon && (
          <div className="absolute -top-1 -right-1 w-4 h-4 bg-mint-500 rounded-full flex items-center justify-center">
            <div className="w-1.5 h-1.5 bg-white rounded-full" />
          </div>
        )}
      </CardContent>
    </Card>
  );
};
