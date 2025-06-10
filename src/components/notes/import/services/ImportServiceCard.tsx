
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
      className={`cursor-pointer transition-all duration-300 transform hover:scale-105 hover:shadow-xl group ${
        isSelected 
          ? 'border-mint-500 bg-gradient-to-br from-mint-50 to-mint-100/50 shadow-lg scale-105' 
          : 'border-gray-200/50 bg-white/80 backdrop-blur-sm hover:border-mint-300 hover:bg-gradient-to-br hover:from-mint-50/30 hover:to-white'
      }`}
      onClick={onSelect}
    >
      <CardContent className="p-6 flex flex-col items-center text-center relative overflow-hidden">
        {/* Animated Background Effect */}
        <div className={`absolute inset-0 bg-gradient-to-br from-mint-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 ${isSelected ? 'opacity-100' : ''}`} />
        
        <div className="relative z-10">
          <div className={`p-4 rounded-xl mb-4 transition-all duration-300 ${
            isSelected 
              ? 'bg-gradient-to-br from-mint-500 to-mint-600 shadow-lg' 
              : 'bg-gray-100 group-hover:bg-gradient-to-br group-hover:from-mint-500 group-hover:to-mint-600'
          }`}>
            <Icon className={`h-6 w-6 transition-colors duration-300 ${
              isSelected ? 'text-white' : 'text-gray-600 group-hover:text-white'
            }`} />
          </div>
          
          <p className={`font-semibold text-base transition-colors duration-300 ${
            isSelected ? 'text-mint-800' : 'text-gray-700 group-hover:text-mint-700'
          }`}>
            {name}
          </p>
          
          {/* Selection Indicator */}
          {isSelected && (
            <div className="absolute -top-2 -right-2 w-6 h-6 bg-gradient-to-br from-mint-500 to-mint-600 rounded-full flex items-center justify-center shadow-lg animate-pulse">
              <div className="w-2 h-2 bg-white rounded-full" />
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
