
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem,
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { LogOut, ChevronsUpDown } from "lucide-react";
import { motion } from "framer-motion";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useRequireAuth } from "@/hooks/useRequireAuth";
import { itemVariants } from "./motion";

interface LogoutSectionProps {
  isCollapsed: boolean;
}

export const LogoutSection = ({ isCollapsed }: LogoutSectionProps) => {
  const { user, userProfile } = useRequireAuth();

  return (
    <div className="flex flex-col p-2">
      <div>
        <DropdownMenu modal={false}>
          <DropdownMenuTrigger className="w-full">
            <div className="flex h-8 w-full flex-row items-center gap-2 rounded-md px-2 py-1.5 transition hover:bg-muted hover:text-primary">
              <LogOut className="h-4 w-4" />
              <motion.li
                variants={itemVariants}
                className="flex w-full items-center gap-2"
              >
                {!isCollapsed && (
                  <>
                    <p className="text-sm font-medium">Logout</p>
                    <ChevronsUpDown className="ml-auto h-4 w-4 text-muted-foreground/50" />
                  </>
                )}
              </motion.li>
            </div>
          </DropdownMenuTrigger>
          <DropdownMenuContent sideOffset={5}>
            <div className="flex flex-row items-center gap-2 p-2">
              <Avatar className="size-6">
                <AvatarFallback>
                  {user?.email?.charAt(0).toUpperCase() || "S"}
                </AvatarFallback>
              </Avatar>
              <div className="flex flex-col text-left">
                <span className="text-sm font-medium">
                  {userProfile?.username || "User"}
                </span>
                <span className="line-clamp-1 text-xs text-muted-foreground">
                  {user?.email || "user@example.com"}
                </span>
              </div>
            </div>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              className="flex items-center gap-2 cursor-pointer"
              onClick={() => {
                if (window.confirm("Are you sure you want to log out?")) {
                  window.location.href = "/login";
                }
              }}
            >
              <LogOut className="h-4 w-4" /> Sign out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
};
