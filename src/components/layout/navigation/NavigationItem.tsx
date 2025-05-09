
import { Link } from "react-router-dom";
import { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface NavigationItemProps {
  title: string;
  path: string;
  icon: LucideIcon;
  isActive: boolean;
}

export const NavigationItem = ({ title, path, icon: Icon, isActive }: NavigationItemProps) => {
  return (
    <Link
      to={path}
      className={cn(
        "flex items-center gap-3 px-4 py-2 text-sm rounded-md",
        isActive
          ? "bg-accent text-accent-foreground font-medium"
          : "hover:bg-accent/50 text-foreground"
      )}
    >
      <Icon className="h-4 w-4" />
      <span>{title}</span>
    </Link>
  );
};
