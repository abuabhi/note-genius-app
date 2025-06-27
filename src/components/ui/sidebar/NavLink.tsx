
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
    <motion.div variants={itemVariants}>
      <Link
        to={to}
        className={cn(
          "flex items-center w-full px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 group",
          "hover:bg-mint-50 hover:text-mint-700 hover:shadow-sm",
          isActive && !customClassName && "bg-mint-100 text-mint-700 shadow-sm border-r-2 border-mint-500",
          customClassName
        )}
      >
        <Icon className={cn(
          "h-5 w-5 transition-colors duration-200",
          isActive ? "text-mint-600" : "text-gray-600 group-hover:text-mint-600"
        )} />
        {!isCollapsed && (
          <div className="ml-3 flex items-center justify-between flex-1">
            <span className="truncate">{label}</span>
            {badge}
          </div>
        )}
      </Link>
    </motion.div>
  );
};
