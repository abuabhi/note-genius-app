
import { Link } from "react-router-dom";
import Layout from "@/components/layout/Layout";
import { useRequireAuth } from "@/hooks/useRequireAuth";
import { UserTier } from "@/hooks/useRequireAuth";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  Users, 
  CreditCard, 
  BookOpen, 
  Layers, 
  GraduationCap, 
  Award,
  Upload,
  Settings,
  BarChart3,
  Megaphone,
  Shield,
  MessageSquare
} from "lucide-react";

const AdminDashboardPage = () => {
  const { user, userProfile } = useRequireAuth();

  if (!user || userProfile?.user_tier !== UserTier.DEAN) {
    return (
      <Layout>
        <div className="container mx-auto p-6">
          <Card>
            <CardHeader>
              <CardTitle>Access Denied</CardTitle>
              <CardDescription>
                You need Dean-tier access to view the admin dashboard.
              </CardDescription>
            </CardHeader>
          </Card>
        </div>
      </Layout>
    );
  }

  const adminCards = [
    {
      title: "User Management",
      description: "Manage user accounts, tiers, and permissions",
      icon: Users,
      href: "/admin/users",
      color: "text-blue-600"
    },
    {
      title: "Tier Limits Management",
      description: "Configure usage limits and features for each tier",
      icon: Shield,
      href: "/admin/tier-limits",
      color: "text-purple-600"
    },
    {
      title: "Analytics & KPIs",
      description: "View business metrics, revenue, and user analytics",
      icon: BarChart3,
      href: "/admin/analytics",
      color: "text-green-600"
    },
    {
      title: "Announcements",
      description: "Create and manage announcement bars for users",
      icon: Megaphone,
      href: "/admin/announcements",
      color: "text-yellow-600"
    },
    {
      title: "Feedback Management",
      description: "Manage user feedback and support requests",
      icon: MessageSquare,
      href: "/admin/feedback",
      color: "text-pink-600"
    },
    {
      title: "Feedback Settings",
      description: "Configure feedback handling mode and support email",
      icon: Settings,
      href: "/admin/feedback/settings",
      color: "text-gray-600"
    },
    {
      title: "Flashcard Management",
      description: "Manage flashcard sets and content",
      icon: CreditCard,
      href: "/admin/flashcards",
      color: "text-purple-600"
    },
    {
      title: "Sections Management",
      description: "Organize and manage subject sections",
      icon: Layers,
      href: "/admin/sections",
      color: "text-orange-600"
    },
    {
      title: "Subjects Management",
      description: "Manage academic subjects and categories",
      icon: BookOpen,
      href: "/admin/subjects",
      color: "text-indigo-600"
    },
    {
      title: "Grades Management",
      description: "Manage grade levels and academic standards",
      icon: GraduationCap,
      href: "/admin/grades",
      color: "text-teal-600"
    },
    {
      title: "CSV Import",
      description: "Import data from CSV files",
      icon: Upload,
      href: "/admin/csv-import",
      color: "text-amber-600"
    }
  ];

  return (
    <Layout>
      <div className="container mx-auto p-6">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Admin Dashboard</h1>
          <p className="text-muted-foreground">
            Manage your application's users, content, and settings
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {adminCards.map((card) => {
            const IconComponent = card.icon;
            return (
              <Link key={card.href} to={card.href}>
                <Card className="hover:shadow-lg transition-all duration-200 hover:scale-105">
                  <CardHeader>
                    <div className="flex items-center space-x-3">
                      <IconComponent className={`h-8 w-8 ${card.color}`} />
                      <div>
                        <CardTitle className="text-lg">{card.title}</CardTitle>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <CardDescription>{card.description}</CardDescription>
                  </CardContent>
                </Card>
              </Link>
            );
          })}
        </div>
      </div>
    </Layout>
  );
};

export default AdminDashboardPage;
