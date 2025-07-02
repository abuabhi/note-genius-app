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
import { useSettings } from "@/contexts/settings"
import { HelpCircle, LogOut, User } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { ThemeToggle } from "../theme/ThemeToggle"
import { NotificationPopover } from '@/components/reminders/NotificationPopover';

export const Header = () => {
  const { user, signOut } = useAuth()
  const { settings, updateSettings } = useSettings()
  const router = useRouter()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  const handleSignOut = async () => {
    await signOut()
    router.push("/login")
  }

  if (!mounted) {
    return null
  }

  return (
    <header className="bg-white border-b border-gray-200 relative z-50">
      <div className="px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center space-x-4">
            <Link href="/" className="font-bold text-xl">
              PrepGenie
            </Link>
            <nav className="hidden md:flex space-x-6">
              <Link href="/dashboard" className="hover:text-gray-500 transition">
                Dashboard
              </Link>
              <Link href="/library" className="hover:text-gray-500 transition">
                Library
              </Link>
              <Link href="/community" className="hover:text-gray-500 transition">
                Community
              </Link>
            </nav>
          </div>
          
          <div className="flex items-center space-x-4">
            {user && <NotificationPopover />}
            <Button variant="ghost" size="icon" asChild>
              <Link href="/help">
                <HelpCircle className="h-5 w-5" />
              </Link>
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="h-8 w-8 p-0 rounded-full">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={user?.user_metadata?.avatar_url} />
                    <AvatarFallback>
                      <User className="h-4 w-4" />
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>My Account</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link href="/profile">Profile</Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/settings">Settings</Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuLabel>Preferences</DropdownMenuLabel>
                <DropdownMenuCheckboxItem
                  checked={settings?.aiEnabled}
                  onCheckedChange={(checked) =>
                    updateSettings({ aiEnabled: checked })
                  }
                >
                  Enable AI
                </DropdownMenuCheckboxItem>
                <DropdownMenuSeparator />
                <ThemeToggle />
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
