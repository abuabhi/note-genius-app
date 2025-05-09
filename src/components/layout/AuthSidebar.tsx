
import { Link, useLocation } from "react-router-dom";
import {
  Sidebar,
  SidebarContent,
  SidebarSeparator,
  SidebarFooter,
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
import { UserTierDisplay } from "./UserTierDisplay";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { cn } from "@/lib/utils";

// Main navigation items grouped by category
const navigationGroups = [
  {
    id: "main",
    title: "Main",
    items: [
      {
        title: "Dashboard",
        path: "/dashboard",
        icon: LayoutDashboard,
      },
    ]
  },
  {
    id: "study",
    title: "Study Tools",
    items: [
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
    ]
  },
  {
    id: "planning",
    title: "Planning",
    items: [
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
    ]
  },
  {
    id: "progress",
    title: "Progress",
    items: [
      {
        title: "Progress",
        path: "/progress",
        icon: Activity,
      },
    ]
  },
  {
    id: "communication",
    title: "Communication",
    items: [
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
    ]
  },
  {
    id: "settings",
    title: "Settings",
    items: [
      {
        title: "Settings",
        path: "/settings",
        icon: Settings,
      },
    ]
  },
];

const adminItems = [
  {
    title: "Flashcards",
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
  
  // Find which accordion items should be open by default based on current path
  const getDefaultAccordionValue = () => {
    const currentPath = location.pathname;
    const openGroups = [];
    
    // Check main navigation items
    for (const group of navigationGroups) {
      for (const item of group.items) {
        if (currentPath === item.path) {
          openGroups.push(group.id);
          break;
        }
      }
    }
    
    // Check admin items
    if (currentPath.startsWith('/admin')) {
      openGroups.push('admin');
    }
    
    return openGroups;
  };

  return (
    <Sidebar>
      <SidebarContent>
        {/* Main Navigation */}
        <Accordion type="multiple" defaultValue={getDefaultAccordionValue()} className="w-full">
          {navigationGroups.map((group) => (
            <AccordionItem key={group.id} value={group.id} className="border-none">
              <AccordionTrigger className="py-2 px-4 text-sm font-medium hover:no-underline">
                {group.title}
              </AccordionTrigger>
              <AccordionContent className="pb-1">
                <div className="flex flex-col gap-1 pl-2">
                  {group.items.map((item) => {
                    const isActive = location.pathname === item.path;
                    return (
                      <Link
                        key={item.path}
                        to={item.path}
                        className={cn(
                          "flex items-center gap-3 px-4 py-2 text-sm rounded-md",
                          isActive
                            ? "bg-accent text-accent-foreground font-medium"
                            : "hover:bg-accent/50 text-foreground"
                        )}
                      >
                        <item.icon className="h-4 w-4" />
                        <span>{item.title}</span>
                      </Link>
                    );
                  })}
                </div>
              </AccordionContent>
            </AccordionItem>
          ))}

          {/* Admin Navigation */}
          {isAdmin && (
            <AccordionItem value="admin" className="border-none">
              <AccordionTrigger className="py-2 px-4 text-sm font-medium hover:no-underline text-amber-500">
                Admin
              </AccordionTrigger>
              <AccordionContent className="pb-1">
                <div className="flex flex-col gap-1 pl-2">
                  {adminItems.map((item) => {
                    const isActive = location.pathname === item.path;
                    return (
                      <Link
                        key={item.path}
                        to={item.path}
                        className={cn(
                          "flex items-center gap-3 px-4 py-2 text-sm rounded-md",
                          isActive
                            ? "bg-accent text-accent-foreground font-medium"
                            : "hover:bg-accent/50 text-foreground"
                        )}
                      >
                        <item.icon className="h-4 w-4" />
                        <span>{item.title}</span>
                      </Link>
                    );
                  })}
                </div>
              </AccordionContent>
            </AccordionItem>
          )}
        </Accordion>
      </SidebarContent>
      
      {/* Footer with User Tier Display */}
      <SidebarFooter>
        <SidebarSeparator />
        <UserTierDisplay />
      </SidebarFooter>
    </Sidebar>
  );
};

export default AuthSidebar;
