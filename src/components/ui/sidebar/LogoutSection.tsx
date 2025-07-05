
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
import { useAuth } from "@/contexts/auth"; // Updated import path
import { useUserTier, UserTier } from "@/hooks/useUserTier";  
import { useSubscription } from "@/contexts/SubscriptionContext";
import { itemVariants } from "./motion";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import { Badge } from "@/components/ui/badge";
import { ArrowUp, Crown, Zap } from "lucide-react";

interface LogoutSectionProps {
  isCollapsed: boolean;
}

export const LogoutSection = ({ isCollapsed }: LogoutSectionProps) => {
  const { user, userProfile } = useRequireAuth();
  const { signOut } = useAuth();
  const { userTier, isLoading } = useUserTier();
  const { createCheckoutSession } = useSubscription();
  const navigate = useNavigate();

  // Debug logging
  console.log('🔧 [SIDEBAR] User tier:', userTier, 'Loading:', isLoading);
  console.log('🔧 [SIDEBAR] Is collapsed:', isCollapsed);

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

  const handleUpgrade = async (targetTier: 'GRADUATE' | 'MASTER') => {
    try {
      await createCheckoutSession(targetTier, 'monthly');
    } catch (error) {
      console.error('Error upgrading:', error);
      toast.error('Failed to start upgrade process');
    }
  };

  // Determine upgrade suggestion based on current tier
  const getUpgradeSuggestion = () => {
    console.log('🔧 [SIDEBAR] Calculating upgrade suggestion for tier:', userTier);
    
    if (userTier === UserTier.SCHOLAR) {
      console.log('🔧 [SIDEBAR] Scholar tier - showing Graduate upgrade');
      return {
        tier: 'GRADUATE' as const,
        name: 'Graduate',
        icon: Crown,
        price: '$9.99/mo',
        badgeText: 'Upgrade Available'
      };
    } else if (userTier === UserTier.GRADUATE) {
      console.log('🔧 [SIDEBAR] Graduate tier - showing Master upgrade');
      return {
        tier: 'MASTER' as const,
        name: 'Master', 
        icon: Zap,
        price: '$19.99/mo',
        badgeText: 'Master Available'
      };
    }
    
    console.log('🔧 [SIDEBAR] No upgrade suggestion for tier:', userTier);
    return null;
  };

  const upgradeSuggestion = getUpgradeSuggestion();
  console.log('🔧 [SIDEBAR] Upgrade suggestion:', upgradeSuggestion, 'Collapsed:', isCollapsed);

  // Don't render anything if still loading
  if (isLoading) {
    console.log('🔧 [SIDEBAR] Still loading, not rendering upgrade section');
    return (
      <div className="flex flex-col p-2 space-y-2">
        <div className="h-8 w-full bg-gray-100 animate-pulse rounded"></div>
      </div>
    );
  }

  return (
    <div className="flex flex-col p-2 space-y-2">
      {/* Upgrade Suggestion - Always show for Scholar tier */}
      {upgradeSuggestion && !isCollapsed && (
        <div 
          className="bg-gradient-to-r from-mint-50 to-emerald-50 border border-mint-200/50 rounded-md p-2"
          style={{ minHeight: '60px' }} // Ensure minimum height for visibility
        >
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <upgradeSuggestion.icon className="h-3 w-3 text-mint-600" />
              <div>
                <p className="text-xs font-medium text-gray-900">{upgradeSuggestion.name}</p>
                <p className="text-xs text-gray-600">{upgradeSuggestion.price}</p>
              </div>
            </div>
            <button
              onClick={() => handleUpgrade(upgradeSuggestion.tier)}
              className="text-xs bg-mint-600 text-white px-2 py-1 rounded hover:bg-mint-700 transition-colors flex items-center"
            >
              <ArrowUp className="h-3 w-3" />
            </button>
          </div>
        </div>
      )}

      {/* Compact upgrade badge for collapsed sidebar */}
      {upgradeSuggestion && isCollapsed && (
        <div className="flex justify-center">
          <Badge 
            onClick={() => handleUpgrade(upgradeSuggestion.tier)}
            className="bg-mint-500 hover:bg-mint-600 text-white cursor-pointer text-xs px-1 py-0.5"
          >
            <ArrowUp className="h-2 w-2" />
          </Badge>
        </div>
      )}

      {/* Debug info - only in development */}
      {process.env.NODE_ENV === 'development' && !isCollapsed && (
        <div className="text-xs text-gray-500 p-1 bg-gray-50 rounded">
          Tier: {userTier} | Suggestion: {upgradeSuggestion ? 'Yes' : 'No'}
        </div>
      )}

      {/* User Menu */}
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
              onClick={handleLogout}
            >
              <LogOut className="h-4 w-4" /> Sign out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
};
