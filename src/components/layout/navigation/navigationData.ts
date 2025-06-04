
import { 
  Home, 
  BookOpen, 
  StickyNote, 
  Target, 
  BarChart3, 
  Calendar, 
  Settings, 
  GraduationCap,
  Clock,
  Users,
  MessageSquare,
  Bell
} from "lucide-react";

export interface NavigationItem {
  id: string;
  title: string;
  href: string;
  icon: any;
  description?: string;
  badge?: string;
  isNew?: boolean;
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
        title: "Formal Quizzes",
        href: "/quiz",
        icon: GraduationCap,
        description: "Multiple-choice assessments"
      }
    ]
  },
  {
    id: "study",
    title: "Study Tools",
    items: [
      {
        id: "goals",
        title: "Goals",
        href: "/goals",
        icon: Target,
        description: "Set and track study goals"
      },
      {
        id: "progress",
        title: "Progress",
        href: "/progress",
        icon: BarChart3,
        description: "View your learning analytics"
      },
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
