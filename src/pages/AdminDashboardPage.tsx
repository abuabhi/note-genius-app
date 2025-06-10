
import React from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  Users, 
  MessageSquare, 
  BarChart3, 
  Megaphone, 
  CreditCard,
  Layers,
  GraduationCap,
  BookOpen,
  Upload,
  Settings,
  CreditCard as CreditCardIcon
} from 'lucide-react';

const AdminDashboardPage = () => {
  const adminSections = [
    {
      title: 'User Management',
      description: 'Manage users, roles, and permissions',
      icon: Users,
      href: '/admin/users',
      color: 'bg-blue-500'
    },
    {
      title: 'Feedback Management',
      description: 'Review and respond to user feedback',
      icon: MessageSquare,
      href: '/admin/feedback',
      color: 'bg-green-500'
    },
    {
      title: 'Analytics & Reports',
      description: 'View system analytics and generate reports',
      icon: BarChart3,
      href: '/admin/analytics',
      color: 'bg-purple-500'
    },
    {
      title: 'Announcements',
      description: 'Create and manage system announcements',
      icon: Megaphone,
      href: '/admin/announcements',
      color: 'bg-orange-500'
    },
    {
      title: 'Credit Monitoring',
      description: 'Monitor Supadata.ai API usage and credits',
      icon: CreditCardIcon,
      href: '/admin/credits',
      color: 'bg-indigo-500'
    },
    {
      title: 'Flashcard Management',
      description: 'Manage flashcard sets and content',
      icon: Layers,
      href: '/admin/flashcards',
      color: 'bg-pink-500'
    },
    {
      title: 'Sections Management',
      description: 'Organize content into sections',
      icon: BookOpen,
      href: '/admin/sections',
      color: 'bg-teal-500'
    },
    {
      title: 'Grades Management',
      description: 'Manage grade levels and classifications',
      icon: GraduationCap,
      href: '/admin/grades',
      color: 'bg-red-500'
    },
    {
      title: 'Subjects Management',
      description: 'Manage subject categories and topics',
      icon: BookOpen,
      href: '/admin/subjects',
      color: 'bg-yellow-500'
    },
    {
      title: 'CSV Import Tools',
      description: 'Import data from CSV files',
      icon: Upload,
      href: '/admin/csv-import',
      color: 'bg-cyan-500'
    },
    {
      title: 'Tier Limits',
      description: 'Configure limits for different user tiers',
      icon: Settings,
      href: '/admin/tier-limits',
      color: 'bg-gray-500'
    }
  ];

  return (
    <div className="container mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Admin Dashboard</h1>
        <p className="text-muted-foreground">
          Welcome to the admin panel. Select a section below to get started.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {adminSections.map((section) => {
          const IconComponent = section.icon;
          return (
            <Card key={section.href} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-center space-x-2">
                  <div className={`p-2 rounded-lg ${section.color} text-white`}>
                    <IconComponent className="h-5 w-5" />
                  </div>
                  <CardTitle className="text-lg">{section.title}</CardTitle>
                </div>
                <CardDescription>{section.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <Button asChild className="w-full">
                  <Link to={section.href}>Access {section.title}</Link>
                </Button>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
};

export default AdminDashboardPage;
