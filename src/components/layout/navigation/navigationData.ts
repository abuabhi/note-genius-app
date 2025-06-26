import { 
  Home, 
  BookOpen, 
  StickyNote, 
  Target, 
  BarChart3, 
  Calendar, 
  Settings, 
  GraduationCap,
  Users,
  MessageSquare,
  Bell,
  Shield,
  Upload,
  Database,
  Gift,
  Heart,
  CheckSquare
} from "lucide-react";

export interface NavigationItem {
  id: string;
  title: string;
  href: string;
  icon: any;
  description?: string;
  badge?: string;
  isNew?: boolean;
  isAnimated?: boolean;
  customStyle?: string;
}

export interface NavigationGroup {
  id: string;
  title: string;
  items: NavigationItem[];
}

export const navigationData: NavigationGroup[] = [
  {
    id: "main",
    title: "Main",
    items: [
      {
        id: "dashboard",
        title: "Dashboard",
        href: "/dashboard",
        icon: Home,
        description: "Overview and quick actions"
      },
      {
        id: "notes",
        title: "Notes",
        href: "/notes",
        icon: StickyNote,
        description: "Manage your study notes"
      },
      {
        id: "flashcards",
        title: "Flashcards",
        href: "/flashcards",
        icon: BookOpen,
        description: "Study with flashcards"
      },
      {
        id: "quizzes",
        title: "Quiz",
        href: "/quiz",
        icon: GraduationCap,
        description: "Multiple-choice assessments"
      },
      {
        id: "goals",
        title: "Goals",
        href: "/goals",
        icon: Target,
        description: "Set and track study goals"
      },
      {
        id: "todos",
        title: "ToDo",
        href: "/todos",
        icon: CheckSquare,
        description: "Manage your tasks"
      },
      {
        id: "analytics",
        title: "Analytics",
        href: "/analytics",
        icon: BarChart3,
        description: "View your learning progress and session history"
      }
    ]
  },
  {
    id: "feedback",
    title: "Feedback",
    items: [
      {
        id: "feedback",
        title: "Feedback",
        href: "/feedback",
        icon: Heart,
        description: "Share your thoughts and help us improve",
        badge: "FEEDBACK",
        isAnimated: true,
        customStyle: "feedback"
      }
    ]
  },
  {
    id: "rewards",
    title: "Rewards",
    items: [
      {
        id: "referrals",
        title: "Refer & Win",
        href: "/referrals",
        icon: Gift,
        description: "Refer friends and earn rewards",
        isNew: true,
        isAnimated: true
      }
    ]
  },
  {
    id: "study",
    title: "Study Tools",
    items: [
      {
        id: "schedule",
        title: "Schedule",
        href: "/schedule",
        icon: Calendar,
        description: "Plan your study sessions"
      },
      {
        id: "reminders",
        title: "Reminders",
        href: "/reminders",
        icon: Bell,
        description: "Manage study reminders"
      }
    ]
  },
  {
    id: "social",
    title: "Collaboration",
    items: [
      {
        id: "collaboration",
        title: "Study Groups",
        href: "/collaboration",
        icon: Users,
        description: "Connect and study together"
      },
      {
        id: "chat",
        title: "Messages",
        href: "/chat",
        icon: MessageSquare,
        description: "Chat with study partners"
      }
    ]
  },
  {
    id: "admin",
    title: "Administration",
    items: [
      {
        id: "admin-dashboard",
        title: "Admin Dashboard",
        href: "/admin",
        icon: Shield,
        description: "Administration overview"
      },
      {
        id: "admin-system-monitoring",
        title: "System Monitoring",
        href: "/admin/system-monitoring",
        icon: BarChart3,
        description: "Monitor system health, performance, and cache management"
      },
      {
        id: "admin-feedback",
        title: "Feedback Management",
        href: "/admin/feedback",
        icon: MessageSquare,
        description: "Manage user feedback and support requests"
      },
      {
        id: "admin-users",
        title: "User Management",
        href: "/admin/users",
        icon: Users,
        description: "Manage user accounts and permissions"
      },
      {
        id: "admin-csv-import",
        title: "CSV Import",
        href: "/admin/csv-import",
        icon: Upload,
        description: "Bulk import data from CSV files"
      },
      {
        id: "admin-grades",
        title: "Grades",
        href: "/admin/grades",
        icon: Database,
        description: "Manage grade levels"
      },
      {
        id: "admin-subjects",
        title: "Subjects",
        href: "/admin/subjects",
        icon: BookOpen,
        description: "Manage subjects"
      },
      {
        id: "admin-sections",
        title: "Sections",
        href: "/admin/sections",
        icon: Settings,
        description: "Manage sections"
      }
    ]
  },
  {
    id: "account",
    title: "Account",
    items: [
      {
        id: "settings",
        title: "Settings",
        href: "/settings",
        icon: Settings,
        description: "Manage your preferences"
      }
    ]
  }
];
