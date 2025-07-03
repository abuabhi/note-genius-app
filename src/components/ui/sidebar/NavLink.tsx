
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
    <motion.div 
      variants={itemVariants} 
      className="relative"
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
    >
      <Link
        to={to}
        className={cn(
          "flex items-center w-full px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-300 group relative backdrop-blur-sm",
          "hover:bg-gradient-to-r hover:from-mint-50 hover:to-mint-100/50 hover:text-mint-700 hover:shadow-md hover:shadow-mint-200/30",
          "focus:outline-none focus:ring-2 focus:ring-mint-300 focus:ring-offset-1",
          isActive && !customClassName && "bg-gradient-to-r from-mint-100 to-mint-200/60 text-mint-700 shadow-lg shadow-mint-200/40 ring-1 ring-mint-200",
          !isActive && "hover:translate-x-1",
          customClassName
        )}
      >
        {/* Active glow effect */}
        {isActive && (
          <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-mint-300/20 to-mint-400/20 animate-pulse" />
        )}
        
        <Icon className={cn(
          "h-5 w-5 transition-all duration-300 relative z-10",
          isActive ? "text-mint-600 scale-110" : "text-gray-600 group-hover:text-mint-600 group-hover:scale-105"
        )} />
        
        {!isCollapsed && (
          <div className="ml-3 flex items-center justify-between flex-1 relative z-10">
            <span className={cn(
              "truncate transition-all duration-300",
              isActive ? "font-semibold text-mint-700" : "font-medium group-hover:font-semibold"
            )}>
              {label}
            </span>
            {badge && (
              <div className="ml-2 animate-in slide-in-from-right-2 duration-300">
                {badge}
              </div>
            )}
          </div>
        )}
        
        {/* Collapsed state tooltip trigger area */}
        {isCollapsed && (
          <div className="absolute inset-0 z-20" title={label} />
        )}
      </Link>
    </motion.div>
  );
};
