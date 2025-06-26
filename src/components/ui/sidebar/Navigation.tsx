
import React from "react";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { 
  Home, 
  BookOpen, 
  CreditCard, 
  Calendar,
  Target,
  CheckSquare,
  BarChart3,
  Settings,
  HelpCircle,
  LogOut
} from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/auth";

interface NavigationProps {
  isCollapsed: boolean;
}

const navigationItems = [
  { name: "Dashboard", href: "/dashboard", icon: Home },
  { name: "Notes", href: "/notes", icon: BookOpen },
  { name: "Flashcards", href: "/flashcards", icon: CreditCard },
  { name: "Analytics", href: "/analytics", icon: BarChart3 },
  { name: "Calendar", href: "/calendar", icon: Calendar },
  { name: "Goals", href: "/goals", icon: Target },
  { name: "Todos", href: "/todos", icon: CheckSquare },
];

const bottomItems = [
  { name: "Settings", href: "/settings", icon: Settings },
  { name: "Help", href: "/help", icon: HelpCircle },
];

export const Navigation = ({ isCollapsed }: NavigationProps) => {
  const location = useLocation();
  const { logout } = useAuth();

  return (
    <div className="flex flex-col h-full">
      {/* Main Navigation */}
      <nav className="flex-1 px-2 py-4 space-y-1">
        {navigationItems.map((item) => {
          const isActive = location.pathname === item.href;
          return (
            <Link
              key={item.name}
              to={item.href}
              className={cn(
                "group flex items-center px-2 py-2 text-sm font-medium rounded-md transition-colors",
                isActive
                  ? "bg-mint-100 text-mint-900"
                  : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
              )}
            >
              <item.icon
                className={cn(
                  "mr-3 flex-shrink-0 h-5 w-5",
                  isActive ? "text-mint-500" : "text-gray-400 group-hover:text-gray-500"
                )}
              />
              {!isCollapsed && (
                <motion.span
                  initial={{ opacity: 0, width: 0 }}
                  animate={{ opacity: 1, width: "auto" }}
                  exit={{ opacity: 0, width: 0 }}
                  transition={{ duration: 0.2 }}
                >
                  {item.name}
                </motion.span>
              )}
            </Link>
          );
        })}
      </nav>

      {/* Bottom Navigation */}
      <div className="px-2 py-4 border-t border-gray-200 space-y-1">
        {bottomItems.map((item) => {
          const isActive = location.pathname === item.href;
          return (
            <Link
              key={item.name}
              to={item.href}
              className={cn(
                "group flex items-center px-2 py-2 text-sm font-medium rounded-md transition-colors",
                isActive
                  ? "bg-mint-100 text-mint-900"
                  : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
              )}
            >
              <item.icon
                className={cn(
                  "mr-3 flex-shrink-0 h-5 w-5",
                  isActive ? "text-mint-500" : "text-gray-400 group-hover:text-gray-500"
                )}
              />
              {!isCollapsed && (
                <motion.span
                  initial={{ opacity: 0, width: 0 }}
                  animate={{ opacity: 1, width: "auto" }}
                  exit={{ opacity: 0, width: 0 }}
                  transition={{ duration: 0.2 }}
                >
                  {item.name}
                </motion.span>
              )}
            </Link>
          );
        })}
        
        {/* Logout Button */}
        <button
          onClick={logout}
          className="group flex items-center w-full px-2 py-2 text-sm font-medium text-gray-600 rounded-md hover:bg-gray-50 hover:text-gray-900 transition-colors"
        >
          <LogOut className="mr-3 flex-shrink-0 h-5 w-5 text-gray-400 group-hover:text-gray-500" />
          {!isCollapsed && (
            <motion.span
              initial={{ opacity: 0, width: 0 }}
              animate={{ opacity: 1, width: "auto" }}
              exit={{ opacity: 0, width: 0 }}
              transition={{ duration: 0.2 }}
            >
              Logout
            </motion.span>
          )}
        </button>
      </div>
    </div>
  );
};
