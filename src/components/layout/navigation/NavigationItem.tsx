
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
  customStyle?: string;
  badge?: string;
}

export const NavigationItem = ({ 
  title, 
  path, 
  icon: Icon, 
  isActive, 
  isNew = false,
  isAnimated = false,
  customStyle,
  badge
}: NavigationItemProps) => {
  const isFeedback = customStyle === "feedback";
  
  return (
    <Link
      to={path}
      className={cn(
        "flex items-center gap-3 px-4 py-2 text-sm rounded-md transition-all duration-200",
        isActive
          ? "bg-accent text-accent-foreground font-medium"
          : "hover:bg-accent/50 text-foreground",
        isAnimated && "hover:scale-105 transform-gpu",
        isAnimated && !isActive && "hover:shadow-md hover:bg-accent/50",
        isFeedback && !isActive && "hover:bg-accent/50",
        isFeedback && isActive && "bg-accent text-accent-foreground font-medium",
        isFeedback && "animate-pulse hover:animate-none"
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
      {badge && customStyle === "feedback" && (
        <Badge 
          variant="secondary" 
          className="bg-primary text-primary-foreground text-xs animate-bounce"
        >
          {badge}
        </Badge>
      )}
    </Link>
  );
};
