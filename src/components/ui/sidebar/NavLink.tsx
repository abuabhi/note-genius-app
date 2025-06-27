
import { cn } from "@/lib/utils";
import { LucideIcon } from "lucide-react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { itemVariants } from "./motion";

interface NavLinkProps {
  to: string;
  icon: LucideIcon;
  label: string;
  isActive: boolean;
  isCollapsed: boolean;
  badge?: React.ReactNode;
  customClassName?: string;
}

export const NavLink = ({
  to,
  icon: Icon,
  label,
  isActive,
  isCollapsed,
  badge,
  customClassName
}: NavLinkProps) => {
  return (
    <motion.div variants={itemVariants} className="relative">
      <Link
        to={to}
        className={cn(
          "flex items-center w-full px-4 py-3 rounded-xl text-sm font-medium transition-all duration-300 group relative",
          "hover:bg-mint-50 hover:text-mint-700",
          isActive && !customClassName && "bg-mint-100 text-mint-700 shadow-sm",
          customClassName
        )}
      >
        {/* Active indicator - left border */}
        {isActive && (
          <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-mint-500 rounded-r-full" />
        )}
        
        <Icon className={cn(
          "h-5 w-5 transition-colors duration-300",
          isActive ? "text-mint-600" : "text-gray-600 group-hover:text-mint-600"
        )} />
        
        {!isCollapsed && (
          <div className="ml-4 flex items-center justify-between flex-1">
            <span className="truncate font-medium">{label}</span>
            {badge}
          </div>
        )}
      </Link>
    </motion.div>
  );
};
