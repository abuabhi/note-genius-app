
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
      className={`cursor-pointer transition-all duration-200 hover:scale-105 relative overflow-visible ${
        comingSoon 
          ? 'border-gray-200 bg-gray-50 opacity-75' 
          : isSelected 
            ? 'border-green-500 bg-green-50 shadow-md' 
            : 'border-gray-200 bg-white hover:border-green-300 hover:bg-green-50/30'
      }`}
      onClick={comingSoon ? undefined : onSelect}
    >
      <CardContent className="p-6 flex flex-col items-center text-center min-h-[120px]">
        {comingSoon && (
          <Badge 
            variant="outline" 
            className="absolute -top-3 -right-3 bg-orange-100 text-orange-700 border-orange-300 text-xs font-medium px-2 py-1 whitespace-nowrap z-10"
          >
            Coming Soon
          </Badge>
        )}
        
        <div className={`p-4 rounded-lg mb-4 transition-colors ${
          comingSoon
            ? 'bg-gray-200'
            : isSelected 
              ? 'bg-green-500 shadow-sm' 
              : 'bg-gray-100 group-hover:bg-green-500'
        }`}>
          <Icon className={`h-6 w-6 transition-colors ${
            comingSoon
              ? 'text-gray-500'
              : isSelected 
                ? 'text-white' 
                : 'text-gray-600 group-hover:text-white'
          }`} />
        </div>
        
        <p className={`font-medium text-sm transition-colors break-words ${
          comingSoon
            ? 'text-gray-500'
            : isSelected 
              ? 'text-green-800' 
              : 'text-gray-700'
        }`}>
          {name}
        </p>
        
        {isSelected && !comingSoon && (
          <div className="absolute -top-2 -right-2 w-5 h-5 bg-green-500 rounded-full flex items-center justify-center">
            <div className="w-2 h-2 bg-white rounded-full" />
          </div>
        )}
      </CardContent>
    </Card>
  );
};
