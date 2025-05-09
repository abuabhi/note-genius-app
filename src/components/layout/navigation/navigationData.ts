
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
  Target
} from "lucide-react";
import { NavigationItemType } from "./NavigationGroup";

// Main navigation items grouped by category
export const navigationGroups = [
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

export const adminItems = [
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
