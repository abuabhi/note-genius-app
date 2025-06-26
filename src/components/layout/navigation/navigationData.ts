
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
  icon: any;
  description?: string;
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
        icon: Brain,
        description: "Create and study flashcards"
      },
      {
        label: "Notes",
        path: "/notes",
        icon: PenTool,
        description: "Organize your study notes"
      },
      {
        label: "Quiz",
        path: "/quiz",
        icon: GraduationCap,
        description: "Test your knowledge"
      },
      {
        label: "Study Planner",
        path: "/study-planner",
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
        icon: Target,
        description: "Set and track study goals"
      },
      {
        label: "Todos",
        path: "/todos",
        icon: CheckSquare,
        description: "Manage your tasks"
      },
      {
        label: "Calendar",
        path: "/calendar",
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
        icon: MessageSquare,
        description: "Connect with others"
      },
      {
        label: "Collaboration",
        path: "/collaboration",
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
        icon: Settings,
        description: "Customize your experience"
      }
    ]
  }
];
