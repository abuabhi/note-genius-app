
import {
  Book,
  BookOpen,
  Bookmark,
  Calendar,
  CheckCircle,
  ClipboardList,
  Code,
  Compass,
  FileText,
  FolderKanban,
  GraduationCap,
  HelpCircle,
  Home,
  ListChecks,
  LucideIcon,
  MessageSquare,
  Presentation,
  Settings,
  ShoppingBag,
  Sliders,
  SquareKanban,
  Star,
  StickyNote,
  Table,
  Tag,
  Target,
  Text,
  User,
  Users,
  Activity,
  BarChart3,
  CheckSquare,
  Gift,
  Heart,
} from "lucide-react";

type Route = {
  label: string;
  icon: LucideIcon;
  href: string;
  color?: string;
  description?: string;
  isNew?: boolean;
  isAnimated?: boolean;
  customStyle?: string;
  badge?: string;
};

type Group = {
  id: string;
  title: string;
  items: Route[];
};

export const routes: Route[] = [
  {
    label: "Dashboard",
    icon: Home,
    href: "/dashboard",
  },
  {
    label: "Notes",
    icon: FileText,
    href: "/notes",
  },
  {
    label: "Flashcards",
    icon: BookOpen,
    href: "/flashcards",
  },
  {
    label: "Quiz",
    icon: Activity,
    href: "/quizzes",
  },
  {
    label: "Goals",
    icon: Target,
    href: "/goals",
  },
  {
    label: "Study Planner",
    icon: Calendar,
    href: "/study-planner",
  },
  {
    label: "ToDo",
    icon: CheckSquare,
    href: "/todos",
  },
  {
    label: "Resources",
    icon: Bookmark,
    href: "/resources",
  },
  {
    label: "Analytics",
    icon: BarChart3,
    href: "/analytics",
  },
  {
    label: "Feedback",
    icon: Heart,
    href: "/feedback",
    customStyle: "feedback",
    badge: "FEEDBACK",
    isAnimated: true,
  },
  {
    label: "Refer & Win",
    icon: Gift,
    href: "/referrals",
    isNew: true,
  },
];

export const navigationData: Group[] = [
  {
    id: "getting-started",
    title: "Getting Started",
    items: [
      {
        label: "Dashboard",
        icon: Home,
        href: "/dashboard",
        description: "Your personal overview",
      },
    ],
  },
  {
    id: "content-creation",
    title: "Content Creation",
    items: [
      {
        label: "Notes",
        href: "/notes",
        icon: StickyNote,
        description: "Create and manage your notes",
      },
      {
        label: "Flashcards",
        href: "/flashcards",
        icon: BookOpen,
        description: "Create and study flashcards",
      },
      {
        label: "Quizzes",
        href: "/quizzes",
        icon: ListChecks,
        description: "Create and take quizzes",
      },
    ],
  },
  {
    id: "study-tools",
    title: "Study Tools",
    items: [
      {
        label: "Study Planner",
        href: "/study-planner",
        icon: Calendar,
        description: "Create and manage personalized study schedules"
      },
      {
        label: "Goals",
        href: "/goals",
        icon: Target,
        description: "Set and track your learning goals",
      },
      {
        label: "ToDo",
        href: "/todos",
        icon: CheckSquare,
        description: "Manage your tasks and assignments",
      },
      {
        label: "Resources",
        href: "/resources",
        icon: Bookmark,
        description: "Save and organize study resources",
      },
    ],
  },
  {
    id: "analytics",
    title: "Analytics & Progress",
    items: [
      {
        label: "Analytics",
        href: "/analytics",
        icon: BarChart3,
        description: "Track your learning progress",
      },
    ],
  },
  {
    id: "community",
    title: "Community & Support",
    items: [
      {
        label: "Feedback",
        href: "/feedback",
        icon: Heart,
        description: "Share your feedback with us",
        customStyle: "feedback",
        badge: "FEEDBACK",
        isAnimated: true,
      },
      {
        label: "Refer & Win",
        href: "/referrals",
        icon: Gift,
        description: "Invite friends and earn rewards",
        isNew: true,
      },
    ],
  },
];

export const navigationGroups = navigationData;
