
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { AdminFeedbackManagement } from '@/components/admin/feedback/AdminFeedbackManagement';
import { useAdminFeedback } from '@/hooks/admin/useAdminFeedback';
import { MessageSquare, TrendingUp, Clock, CheckCircle } from 'lucide-react';

const AdminFeedbackPage = () => {
  const { data: feedbackList } = useAdminFeedback();

  const stats = {
    total: feedbackList?.length || 0,
    pending: feedbackList?.filter(f => f.status === 'pending').length || 0,
    inProgress: feedbackList?.filter(f => f.status === 'in_progress').length || 0,
    resolved: feedbackList?.filter(f => f.status === 'resolved').length || 0,
  };

  return (
    <div className="container mx-auto py-8 space-y-8">
      <div>
        <h1 className="text-3xl font-bold">Feedback Management</h1>
        <p className="text-muted-foreground mt-2">
          Manage user feedback, feature requests, and bug reports
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Feedback</CardTitle>
            <MessageSquare className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending</CardTitle>
            <Clock className="h-4 w-4 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{stats.pending}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">In Progress</CardTitle>
            <TrendingUp className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{stats.inProgress}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Resolved</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stats.resolved}</div>
          </CardContent>
        </Card>
      </div>

      {/* Feedback Management */}
      <Card>
        <CardHeader>
          <CardTitle>Feedback & Support Requests</CardTitle>
          <CardDescription>
            Review and respond to user feedback, feature requests, and bug reports
          </CardDescription>
        </CardHeader>
        <CardContent>
          <AdminFeedbackManagement />
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminFeedbackPage;
