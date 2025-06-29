
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ContactSubmissionsManagement } from '@/components/admin/ContactSubmissionsManagement';
import { MessageSquare, Inbox, Clock, CheckCircle } from 'lucide-react';
import Layout from '@/components/layout/Layout';
import { StandardPageHeader } from '@/components/ui/StandardPageHeader';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

const AdminContactSubmissionsPage = () => {
  const { data: submissions } = useQuery({
    queryKey: ['admin-contact-submissions'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('contact_submissions')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    },
  });

  const stats = {
    total: submissions?.length || 0,
    new: submissions?.filter(s => s.status === 'new').length || 0,
    inProgress: submissions?.filter(s => s.status === 'in_progress').length || 0,
    responded: submissions?.filter(s => s.status === 'responded').length || 0,
  };

  const breadcrumbs = [
    { label: "Admin Dashboard", href: "/admin" },
    { label: "Contact Submissions" }
  ];

  return (
    <Layout>
      <div className="min-h-screen bg-gradient-to-br from-mint-50/30 via-white to-blue-50/30">
        <StandardPageHeader
          title="Contact Submissions"
          description="Manage and respond to user contact form submissions"
          icon={<MessageSquare className="h-6 w-6 text-white" />}
          breadcrumbs={breadcrumbs}
        />

        <div className="container mx-auto py-8 space-y-8">
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Submissions</CardTitle>
                <Inbox className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.total}</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">New</CardTitle>
                <MessageSquare className="h-4 w-4 text-blue-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-blue-600">{stats.new}</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">In Progress</CardTitle>
                <Clock className="h-4 w-4 text-yellow-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-yellow-600">{stats.inProgress}</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Responded</CardTitle>
                <CheckCircle className="h-4 w-4 text-green-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">{stats.responded}</div>
              </CardContent>
            </Card>
          </div>

          {/* Contact Submissions Management */}
          <Card>
            <CardHeader>
              <CardTitle>Contact Submissions</CardTitle>
              <CardDescription>
                Review and respond to user contact form submissions
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ContactSubmissionsManagement />
            </CardContent>
          </Card>
        </div>
      </div>
    </Layout>
  );
};

export default AdminContactSubmissionsPage;
