
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { ChevronsUpDown, Settings, Shield, LogOut } from "lucide-react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger,
  DropdownMenuSeparator 
} from "@/components/ui/dropdown-menu";
import { useRequireAuth, UserTier } from "@/hooks/useRequireAuth";
import { itemVariants } from "./motion";
import { useAuth } from "@/contexts/auth";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";

interface UserSectionProps {
  isCollapsed: boolean;
}

export const UserSection = ({ isCollapsed }: UserSectionProps) => {
  const { user, userProfile } = useRequireAuth();
  const { signOut } = useAuth();
  const navigate = useNavigate();
  const isAdmin = userProfile?.user_tier === UserTier.DEAN;
  
  const handleLogout = async () => {
    try {
      await signOut();
      toast.success("You've been successfully logged out");
      navigate('/login');
    } catch (error) {
      console.error("Logout error:", error);
      toast.error("Failed to log out. Please try again.");
    }
  };
  
  return (
    <div className="flex items-center">
      <DropdownMenu modal={false}>
        <DropdownMenuTrigger className="w-full" asChild>
          <Button
            variant="ghost"
            size="sm"
            className="flex items-center gap-3 px-3 py-2 h-auto hover:bg-mint-50 rounded-lg transition-all duration-200" 
          >
            <Avatar className='rounded-full size-8 ring-2 ring-mint-100'>
              <AvatarFallback className="bg-gradient-to-br from-mint-500 to-mint-600 text-white font-medium">
                {userProfile?.first_name?.charAt(0).toUpperCase() || user?.email?.charAt(0).toUpperCase() || "P"}
              </AvatarFallback>
            </Avatar>
            <motion.div
              variants={itemVariants}
              className="flex items-center gap-2"
            >
              {!isCollapsed && (
                <>
                   <div className="text-left">
                     <p className="text-sm font-medium text-gray-900">
                       {userProfile?.first_name || "PrepGenie User"}
                     </p>
                     <p className="text-xs text-gray-500">
                       {user?.email}
                     </p>
                   </div>
                  <ChevronsUpDown className="h-4 w-4 text-gray-400" />
                </>
              )}
            </motion.div>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent 
          align="end" 
          className="w-56 bg-white/95 backdrop-blur-md border border-gray-200/60 shadow-lg"
        >
          <DropdownMenuItem
            asChild
            className="flex items-center gap-3 px-3 py-2 cursor-pointer hover:bg-mint-50"
          >
            <Link to="/settings">
              <Settings className="h-4 w-4 text-gray-600" /> 
              <span>Settings</span>
            </Link>
          </DropdownMenuItem>
          {isAdmin && (
            <>
              <DropdownMenuSeparator className="bg-gray-200/60" />
              <DropdownMenuItem
                asChild
                className="flex items-center gap-3 px-3 py-2 cursor-pointer hover:bg-mint-50"
              >
                <Link to="/admin">
                  <Shield className="h-4 w-4 text-gray-600" /> 
                  <span>Admin Dashboard</span>
                </Link>
              </DropdownMenuItem>
            </>
          )}
          <DropdownMenuSeparator className="bg-gray-200/60" />
          <DropdownMenuItem
            onClick={handleLogout}
            className="flex items-center gap-3 px-3 py-2 cursor-pointer hover:bg-red-50 text-red-600"
          >
            <LogOut className="h-4 w-4" /> 
            <span>Sign out</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
};
