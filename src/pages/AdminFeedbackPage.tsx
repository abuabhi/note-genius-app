
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { AdminFeedbackManagement } from '@/components/admin/feedback/AdminFeedbackManagement';
import { useAdminFeedback } from '@/hooks/admin/useAdminFeedback';
import { useAdminSettings } from '@/hooks/admin/useAdminSettings';
import { MessageSquare, TrendingUp, Clock, CheckCircle, Settings, ExternalLink, Database } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { Alert, AlertDescription } from '@/components/ui/alert';

const AdminFeedbackPage = () => {
  const { data: feedbackList } = useAdminFeedback();
  const { data: adminSettings } = useAdminSettings();

  const stats = {
    total: feedbackList?.length || 0,
    pending: feedbackList?.filter(f => f.status === 'pending').length || 0,
    inProgress: feedbackList?.filter(f => f.status === 'in_progress').length || 0,
    resolved: feedbackList?.filter(f => f.status === 'resolved').length || 0,
  };

  const isExternalMode = adminSettings?.feedback_mode === 'external';

  return (
    <div className="container mx-auto py-8 space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Feedback Management</h1>
          <p className="text-muted-foreground mt-2">
            Manage user feedback, feature requests, and bug reports
          </p>
        </div>
        
        <Button asChild variant="outline">
          <Link to="/admin/feedback/settings">
            <Settings className="h-4 w-4 mr-2" />
            Settings
          </Link>
        </Button>
      </div>

      {/* Current Mode Alert */}
      <Alert>
        {isExternalMode ? (
          <>
            <ExternalLink className="h-4 w-4" />
            <AlertDescription>
              <strong>External Mode Active:</strong> Feedback is being forwarded to {adminSettings?.support_email || 'configured email'}. 
              New feedback submissions will not appear in this dashboard.
            </AlertDescription>
          </>
        ) : (
          <>
            <Database className="h-4 w-4" />
            <AlertDescription>
              <strong>Internal Mode Active:</strong> Feedback is being stored in the database and managed through this dashboard.
            </AlertDescription>
          </>
        )}
      </Alert>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Feedback</CardTitle>
            <MessageSquare className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
            {isExternalMode && (
              <p className="text-xs text-muted-foreground mt-1">
                Historical data only
              </p>
            )}
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
            {isExternalMode 
              ? 'Historical feedback data - new submissions are forwarded to external email'
              : 'Review and respond to user feedback, feature requests, and bug reports'
            }
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
