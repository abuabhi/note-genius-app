
import { 
  BookOpen, 
  Brain, 
  Calendar,
  Users, 
  BarChart3, 
  Settings,
  MessageSquare,
  Target,
  CheckSquare,
  PenTool,
  Zap,
  GraduationCap,
  CalendarDays,
  TrendingUp,
  FolderOpen
} from "lucide-react";

export interface NavigationItem {
  label: string;
  path: string;
  href: string; // Add href property for compatibility
  icon: any;
  description?: string;
  title: string; // Add title property for compatibility
}

export interface NavigationGroup {
  id: string;
  title: string;
  items: NavigationItem[];
}

export const navigationData: NavigationGroup[] = [
  {
    id: "study-tools",
    title: "Study Tools",
    items: [
      {
        label: "Flashcards",
        path: "/flashcards",
        href: "/flashcards",
        title: "Flashcards",
        icon: Brain,
        description: "Create and study flashcards"
      },
      {
        label: "Notes",
        path: "/notes",
        href: "/notes",
        title: "Notes",
        icon: PenTool,
        description: "Organize your study notes"
      },
      {
        label: "Quiz",
        path: "/quiz",
        href: "/quiz",
        title: "Quiz",
        icon: GraduationCap,
        description: "Test your knowledge"
      },
      {
        label: "Study Planner",
        path: "/study-planner",
        href: "/study-planner",
        title: "Study Planner",
        icon: CalendarDays,
        description: "Plan your study schedule"
      }
    ]
  },
  {
    id: "planning",
    title: "Planning",
    items: [
      {
        label: "Goals",
        path: "/goals",
        href: "/goals",
        title: "Goals",
        icon: Target,
        description: "Set and track study goals"
      },
      {
        label: "Todos",
        path: "/todos",
        href: "/todos",
        title: "Todos",
        icon: CheckSquare,
        description: "Manage your tasks"
      },
      {
        label: "Calendar",
        path: "/calendar",
        href: "/calendar",
        title: "Calendar",
        icon: Calendar,
        description: "Schedule your time"
      }
    ]
  },
  {
    id: "progress",
    title: "Progress",
    items: [
      {
        label: "Analytics",
        path: "/analytics",
        href: "/analytics",
        title: "Analytics",
        icon: BarChart3,
        description: "Track your progress"
      }
    ]
  },
  {
    id: "communication",
    title: "Communication",
    items: [
      {
        label: "Chat",
        path: "/chat",
        href: "/chat",
        title: "Chat",
        icon: MessageSquare,
        description: "Connect with others"
      },
      {
        label: "Collaboration",
        path: "/collaboration",
        href: "/collaboration",
        title: "Collaboration",
        icon: Users,
        description: "Share and collaborate"
      }
    ]
  },
  {
    id: "settings",
    title: "Settings",
    items: [
      {
        label: "Settings",
        path: "/settings",
        href: "/settings",
        title: "Settings",
        icon: Settings,
        description: "Customize your experience"
      }
    ]
  }
];
