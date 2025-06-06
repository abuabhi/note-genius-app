
import { Link } from "react-router-dom";
import { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";

interface NavigationItemProps {
  title: string;
  path: string;
  icon: LucideIcon;
  isActive: boolean;
  isNew?: boolean;
  isAnimated?: boolean;
}

export const NavigationItem = ({ 
  title, 
  path, 
  icon: Icon, 
  isActive, 
  isNew = false,
  isAnimated = false 
}: NavigationItemProps) => {
  return (
    <Link
      to={path}
      className={cn(
        "flex items-center gap-3 px-4 py-2 text-sm rounded-md transition-all duration-200",
        isActive
          ? "bg-accent text-accent-foreground font-medium"
          : "hover:bg-accent/50 text-foreground",
        isAnimated && "hover:scale-105 transform-gpu",
        isAnimated && !isActive && "hover:shadow-md hover:bg-gradient-to-r hover:from-purple-50 hover:to-pink-50"
      )}
    >
      <Icon className={cn(
        "h-4 w-4",
        isAnimated && "animate-pulse"
      )} />
      <span className="flex-1">{title}</span>
      {isNew && (
        <Badge 
          variant="secondary" 
          className="bg-gradient-to-r from-purple-600 to-pink-600 text-white text-xs animate-pulse"
        >
          NEW
        </Badge>
      )}
    </Link>
  );
};
