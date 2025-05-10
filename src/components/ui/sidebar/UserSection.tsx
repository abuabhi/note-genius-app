
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { ChevronsUpDown, Settings, Shield } from "lucide-react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { useRequireAuth, UserTier } from "@/hooks/useRequireAuth";
import { itemVariants } from "./motion";

interface UserSectionProps {
  isCollapsed: boolean;
}

export const UserSection = ({ isCollapsed }: UserSectionProps) => {
  const { user, userProfile } = useRequireAuth();
  const isAdmin = userProfile?.user_tier === UserTier.DEAN;
  
  return (
    <div className="flex h-[54px] w-full shrink-0 border-b p-2">
      <div className="mt-[1.5px] flex w-full">
        <DropdownMenu modal={false}>
          <DropdownMenuTrigger className="w-full" asChild>
            <Button
              variant="ghost"
              size="sm"
              className="flex w-fit items-center gap-2 px-2" 
            >
              <Avatar className='rounded size-4'>
                <AvatarFallback>{user?.email?.charAt(0).toUpperCase() || "S"}</AvatarFallback>
              </Avatar>
              <motion.li
                variants={itemVariants}
                className="flex w-fit items-center gap-2"
              >
                {!isCollapsed && (
                  <>
                    <p className="text-sm font-medium">
                      {userProfile?.username || "StudyApp"}
                    </p>
                    <ChevronsUpDown className="h-4 w-4 text-muted-foreground/50" />
                  </>
                )}
              </motion.li>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start">
            <DropdownMenuItem
              asChild
              className="flex items-center gap-2"
            >
              <Link to="/settings">
                <Settings className="h-4 w-4" /> Settings
              </Link>
            </DropdownMenuItem>
            {isAdmin && (
              <DropdownMenuItem
                asChild
                className="flex items-center gap-2"
              >
                <Link to="/admin/users">
                  <Shield className="h-4 w-4" /> Admin Panel
                </Link>
              </DropdownMenuItem>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
};
