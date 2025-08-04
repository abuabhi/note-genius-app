
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
      <CardContent className="p-4 flex flex-col items-center text-center min-h-[100px]">
        {comingSoon && (
          <Badge 
            variant="outline" 
            className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-orange-100 text-orange-700 border-orange-300 text-xs font-medium px-2 py-1 whitespace-nowrap z-10"
          >
            Coming Soon
          </Badge>
        )}
        
        <div className={`p-3 rounded-lg mb-3 transition-colors ${
          comingSoon
            ? 'bg-muted'
            : isSelected 
              ? 'bg-primary shadow-sm' 
              : 'bg-muted group-hover:bg-primary'
        }`}>
          <Icon className={`h-5 w-5 transition-colors ${
            comingSoon
              ? 'text-muted-foreground'
              : isSelected 
                ? 'text-primary-foreground' 
                : 'text-muted-foreground group-hover:text-primary-foreground'
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
