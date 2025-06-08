
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useAdminSettings, useUpdateAdminSettings } from '@/hooks/admin/useAdminSettings';
import { useState, useEffect } from 'react';
import { Settings, Mail, Database, ExternalLink, Save } from 'lucide-react';

const AdminFeedbackSettingsPage = () => {
  const { data: settings, isLoading } = useAdminSettings();
  const updateSettings = useUpdateAdminSettings();
  
  const [feedbackMode, setFeedbackMode] = useState<'internal' | 'external'>('internal');
  const [supportEmail, setSupportEmail] = useState('');
  const [isDirty, setIsDirty] = useState(false);

  useEffect(() => {
    if (settings) {
      setFeedbackMode(settings.feedback_mode);
      setSupportEmail(settings.support_email);
    }
  }, [settings]);

  useEffect(() => {
    if (settings) {
      const hasChanges = 
        feedbackMode !== settings.feedback_mode || 
        supportEmail !== settings.support_email;
      setIsDirty(hasChanges);
    }
  }, [feedbackMode, supportEmail, settings]);

  const handleSave = () => {
    updateSettings.mutate({
      feedback_mode: feedbackMode,
      support_email: supportEmail
    });
    setIsDirty(false);
  };

  const isEmailRequired = feedbackMode === 'external';
  const isFormValid = !isEmailRequired || (supportEmail && supportEmail.includes('@'));

  if (isLoading) {
    return (
      <div className="container mx-auto py-8">
        <div className="flex items-center justify-center">
          <div className="text-muted-foreground">Loading settings...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 space-y-8">
      <div>
        <h1 className="text-3xl font-bold">Feedback System Settings</h1>
        <p className="text-muted-foreground mt-2">
          Configure how feedback is handled in your application
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Feedback Management Mode
          </CardTitle>
          <CardDescription>
            Choose how feedback from users should be handled
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center space-x-4">
            <Switch
              id="feedback-mode"
              checked={feedbackMode === 'external'}
              onCheckedChange={(checked) => 
                setFeedbackMode(checked ? 'external' : 'internal')
              }
            />
            <div className="flex-1">
              <Label htmlFor="feedback-mode" className="text-base font-medium">
                {feedbackMode === 'internal' ? 'Internal Management' : 'External Email Forwarding'}
              </Label>
              <p className="text-sm text-muted-foreground mt-1">
                {feedbackMode === 'internal' 
                  ? 'Feedback is stored in the database and managed through the admin panel'
                  : 'Feedback is forwarded to an external email address for third-party tool handling'
                }
              </p>
            </div>
          </div>

          {feedbackMode === 'internal' && (
            <Alert>
              <Database className="h-4 w-4" />
              <AlertDescription>
                <strong>Internal Mode:</strong> Feedback will be stored in your database and you can manage responses 
                through the admin panel. This gives you full control and detailed analytics.
              </AlertDescription>
            </Alert>
          )}

          {feedbackMode === 'external' && (
            <div className="space-y-4">
              <Alert>
                <ExternalLink className="h-4 w-4" />
                <AlertDescription>
                  <strong>External Mode:</strong> Feedback will be forwarded to your support email address. 
                  This is useful when using third-party tools like Zendesk, Freshdesk, or other support systems.
                </AlertDescription>
              </Alert>
              
              <div className="space-y-2">
                <Label htmlFor="support-email">Support Email Address *</Label>
                <Input
                  id="support-email"
                  type="email"
                  placeholder="support@yourcompany.com"
                  value={supportEmail}
                  onChange={(e) => setSupportEmail(e.target.value)}
                  className={!isFormValid && isEmailRequired ? 'border-red-500' : ''}
                />
                {!isFormValid && isEmailRequired && (
                  <p className="text-sm text-red-500">
                    Please enter a valid email address
                  </p>
                )}
                <p className="text-sm text-muted-foreground">
                  All feedback submissions will be forwarded to this email address
                </p>
              </div>
            </div>
          )}

          <div className="flex items-center justify-between pt-4 border-t">
            <div className="text-sm text-muted-foreground">
              {isDirty && 'You have unsaved changes'}
            </div>
            <Button 
              onClick={handleSave}
              disabled={!isDirty || !isFormValid || updateSettings.isPending}
              className="flex items-center gap-2"
            >
              <Save className="h-4 w-4" />
              {updateSettings.isPending ? 'Saving...' : 'Save Settings'}
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Mail className="h-5 w-5" />
            Current Configuration
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label className="text-sm text-muted-foreground">Mode</Label>
              <p className="font-medium capitalize">{feedbackMode} Management</p>
            </div>
            {feedbackMode === 'external' && (
              <div>
                <Label className="text-sm text-muted-foreground">Support Email</Label>
                <p className="font-medium">{supportEmail || 'Not configured'}</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminFeedbackSettingsPage;
