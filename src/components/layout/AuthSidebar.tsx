
import { Link, useLocation } from "react-router-dom";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import {
  LayoutDashboard,
  FileText,
  Activity,
  Users,
  Settings,
  Clock,
  GraduationCap,
  BookOpen,
  FolderKanban,
  Upload,
  User,
  MessageSquare,
  Calendar,
  Target,
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { UserTier } from "@/hooks/useRequireAuth";
import { useRequireAuth } from "@/hooks/useRequireAuth";

const sidebarItems = [
  {
    title: "Dashboard",
    path: "/dashboard",
    icon: LayoutDashboard,
  },
  {
    title: "Notes",
    path: "/notes",
    icon: FileText,
  },
  {
    title: "Flashcards",
    path: "/flashcards",
    icon: BookOpen,
  },
  {
    title: "Study Sessions",
    path: "/study-sessions",
    icon: Clock,
  },
  {
    title: "Quizzes",
    path: "/quiz",
    icon: Activity,
  },
  {
    title: "Progress",
    path: "/progress",
    icon: Activity,
  },
  {
    title: "Schedule",
    path: "/schedule",
    icon: Calendar,
  },
  {
    title: "Goals",
    path: "/goals",
    icon: Target,
  },
  {
    title: "Chat",
    path: "/chat",
    icon: MessageSquare,
  },
  {
    title: "Collaboration",
    path: "/collaborate",
    icon: Users,
  },
  {
    title: "Settings",
    path: "/settings",
    icon: Settings,
  },
];

const adminItems = [
  {
    title: "Manage Flashcards",
    path: "/admin/flashcards",
    icon: FileText,
  },
  {
    title: "Grades",
    path: "/admin/grades",
    icon: GraduationCap,
  },
  {
    title: "Subjects",
    path: "/admin/subjects",
    icon: BookOpen,
  },
  {
    title: "Sections",
    path: "/admin/sections",
    icon: FolderKanban,
  },
  {
    title: "Users",
    path: "/admin/users",
    icon: User,
  },
  {
    title: "CSV Import",
    path: "/admin/csv-import",
    icon: Upload,
  },
];

const AuthSidebar = () => {
  const location = useLocation();
  const { userProfile } = useRequireAuth();
  const isAdmin = userProfile?.user_tier === UserTier.DEAN;
  
  return (
    <Sidebar>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Menu</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {sidebarItems.map((item) => (
                <SidebarMenuItem key={item.path}>
                  <SidebarMenuButton 
                    asChild 
                    tooltip={item.title}
                    isActive={location.pathname === item.path}
                  >
                    <Link to={item.path}>
                      <item.icon className="h-4 w-4" />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {isAdmin && (
          <SidebarGroup>
            <SidebarGroupLabel>Admin</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {adminItems.map((item) => (
                  <SidebarMenuItem key={item.path}>
                    <SidebarMenuButton 
                      asChild 
                      tooltip={item.title}
                      isActive={location.pathname === item.path}
                    >
                      <Link to={item.path}>
                        <item.icon className="h-4 w-4" />
                        <span>{item.title}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        )}
      </SidebarContent>
    </Sidebar>
  );
};

export default AuthSidebar;
