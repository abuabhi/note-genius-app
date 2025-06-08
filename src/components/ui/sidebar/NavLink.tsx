
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
    <Link
      to={to}
      className={cn(
        "flex h-8 w-full flex-row items-center rounded-md px-2 py-1.5 transition hover:bg-muted hover:text-primary",
        isActive && !customClassName && "bg-muted text-mint-600",
        customClassName
      )}
    >
      <Icon className="h-4 w-4" />
      <motion.li variants={itemVariants}>
        {!isCollapsed && (
          badge ? (
            <div className="ml-2 flex items-center gap-2">
              <p className="text-sm font-medium">{label}</p>
              {badge}
            </div>
          ) : (
            <p className="ml-2 text-sm font-medium">{label}</p>
          )
        )}
      </motion.li>
    </Link>
  );
};
