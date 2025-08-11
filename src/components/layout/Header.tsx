
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import {
  DropdownMenuCheckboxItem,
} from "@/components/ui/dropdown-menu"
import { useAuth } from "@/contexts/auth"
import { LogOut, User } from "lucide-react"
import { Link, useNavigate } from "react-router-dom"
import { useEffect, useState } from "react"
import { NotificationPopover } from '@/components/reminders/NotificationPopover';
import { VersionDisplay } from '@/components/version/VersionDisplay';

export const Header = () => {
  const { user, signOut } = useAuth()
  const navigate = useNavigate()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  const handleSignOut = async () => {
    await signOut()
    navigate("/login")
  }

  if (!mounted) {
    return null
  }

  return (
    <header className="bg-white border-b border-gray-200 relative z-50">
      <div className="px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center space-x-4">
            <Link to="/" className="font-bold text-xl">
              PrepGenie
            </Link>
            <nav className="hidden md:flex space-x-6">
              <Link to="/dashboard" className="hover:text-gray-500 transition">
                Dashboard
              </Link>
              <Link to="/library" className="hover:text-gray-500 transition">
                Library
              </Link>
              <Link to="/community" className="hover:text-gray-500 transition">
                Community
              </Link>
            </nav>
          </div>
          
          <div className="flex items-center space-x-3">
            <VersionDisplay variant="badge" className="bg-primary/10 border-primary/20" />
            {user && <NotificationPopover />}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="h-8 w-8 p-0 rounded-full flex-shrink-0">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={user?.user_metadata?.avatar_url || ''} alt="User avatar" />
                    <AvatarFallback className="text-xs font-medium">
                      {(user?.email?.substring(0,2) || 'U').toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>My Account</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link to="/profile">Profile</Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link to="/settings">Settings</Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleSignOut}>
                  <LogOut className="h-4 w-4 mr-2" />
                  Sign Out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>
    </header>
  );
};
