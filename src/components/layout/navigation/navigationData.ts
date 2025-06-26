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
  Flask,
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
} from "lucide-react";

type Route = {
  label: string;
  icon: LucideIcon;
  href: string;
  color?: string;
  description?: string;
};

type Group = {
  title: string;
  routes?: Route[];
  items?: Route[];
};

export const routes: Route[] = [
  {
    label: "Home",
    icon: Home,
    href: "/",
  },
  {
    label: "Explore",
    icon: Compass,
    href: "/explore",
  },
  {
    label: "Bookmarks",
    icon: Bookmark,
    href: "/bookmarks",
  },
  {
    label: "Settings",
    icon: Settings,
    href: "/settings",
  },
];

export const navigationGroups: Group[] = [
  {
    title: "Getting Started",
    items: [
      {
        label: "Dashboard",
        icon: Home,
        href: "/dashboard",
        description: "Your personal overview",
      },
      {
        label: "Explore",
        icon: Compass,
        href: "/explore",
        description: "Discover new content and creators",
      },
    ],
  },
  {
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
        label: "Reminders",
        href: "/reminders",
        icon: Calendar,
        description: "Set reminders for your study sessions",
      },
    ],
  },
  {
    title: "Community",
    items: [
      {
        label: "Forums",
        href: "/forums",
        icon: MessageSquare,
        description: "Discuss topics with other learners",
      },
      {
        label: "Groups",
        href: "/groups",
        icon: Users,
        description: "Join or create study groups",
      },
    ],
  },
  {
    title: "Account",
    items: [
      {
        label: "Profile",
        href: "/profile",
        icon: User,
        description: "View and edit your profile",
      },
      {
        label: "Settings",
        href: "/settings",
        icon: Sliders,
        description: "Manage your account settings",
      },
    ],
  },
];
