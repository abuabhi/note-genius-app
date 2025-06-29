
import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Mail, Calendar, User, MessageSquare, CheckCircle, Clock } from 'lucide-react';
import { toast } from 'sonner';
import { format } from 'date-fns';

interface ContactSubmission {
  id: string;
  name: string;
  email: string;
  subject: string;
  message: string;
  status: string;
  created_at: string;
  updated_at: string;
  responded_at: string | null;
  admin_notes: string | null;
}

export const ContactSubmissionsManagement: React.FC = () => {
  const [selectedSubmission, setSelectedSubmission] = useState<ContactSubmission | null>(null);
  const [adminNotes, setAdminNotes] = useState('');
  const queryClient = useQueryClient();

  const { data: submissions, isLoading, error } = useQuery({
    queryKey: ['contact-submissions'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('contact_submissions')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data as ContactSubmission[];
    }
  });

  const updateSubmissionMutation = useMutation({
    mutationFn: async ({ id, status, adminNotes }: { id: string; status: string; adminNotes?: string }) => {
      const updates: any = { 
        status,
        updated_at: new Date().toISOString()
      };
      
      if (adminNotes !== undefined) {
        updates.admin_notes = adminNotes;
      }
      
      if (status === 'responded') {
        updates.responded_at = new Date().toISOString();
      }

      const { error } = await supabase
        .from('contact_submissions')
        .update(updates)
        .eq('id', id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['contact-submissions'] });
      toast.success('Submission updated successfully');
      setSelectedSubmission(null);
      setAdminNotes('');
    },
    onError: (error) => {
      console.error('Error updating submission:', error);
      toast.error('Failed to update submission');
    }
  });

  const handleStatusUpdate = (submission: ContactSubmission, newStatus: string) => {
    updateSubmissionMutation.mutate({
      id: submission.id,
      status: newStatus,
      adminNotes: adminNotes || submission.admin_notes || undefined
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'new': return 'bg-blue-500';
      case 'in_progress': return 'bg-yellow-500';
      case 'responded': return 'bg-green-500';
      default: return 'bg-gray-500';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'new': return <Mail className="h-4 w-4" />;
      case 'in_progress': return <Clock className="h-4 w-4" />;
      case 'responded': return <CheckCircle className="h-4 w-4" />;
      default: return <MessageSquare className="h-4 w-4" />;
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-mint-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading contact submissions...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center p-8">
        <p className="text-red-600">Error loading contact submissions</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {selectedSubmission ? (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Contact Submission Details
              </CardTitle>
              <Button 
                variant="outline" 
                onClick={() => {setSelectedSubmission(null); setAdminNotes('');}}
              >
                Back to List
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">Contact Information</h3>
                <p><strong>Name:</strong> {selectedSubmission.name}</p>
                <p><strong>Email:</strong> {selectedSubmission.email}</p>
                <p><strong>Subject:</strong> {selectedSubmission.subject}</p>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">Status & Timing</h3>
                <div className="flex items-center gap-2 mb-2">
                  <Badge className={`${getStatusColor(selectedSubmission.status)} text-white`}>
                    {getStatusIcon(selectedSubmission.status)}
                    <span className="ml-1 capitalize">{selectedSubmission.status.replace('_', ' ')}</span>
                  </Badge>
                </div>
                <p><strong>Submitted:</strong> {format(new Date(selectedSubmission.created_at), 'PPp')}</p>
                {selectedSubmission.responded_at && (
                  <p><strong>Responded:</strong> {format(new Date(selectedSubmission.responded_at), 'PPp')}</p>
                )}
              </div>
            </div>

            <div>
              <h3 className="font-semibold text-gray-900 mb-2">Message</h3>
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="whitespace-pre-wrap">{selectedSubmission.message}</p>
              </div>
            </div>

            <div>
              <h3 className="font-semibold text-gray-900 mb-2">Admin Notes</h3>
              <Textarea
                value={adminNotes || selectedSubmission.admin_notes || ''}
                onChange={(e) => setAdminNotes(e.target.value)}
                placeholder="Add admin notes..."
                rows={3}
              />
            </div>

            <div className="flex gap-2 flex-wrap">
              <Button 
                onClick={() => handleStatusUpdate(selectedSubmission, 'in_progress')}
                disabled={updateSubmissionMutation.isPending}
                variant="outline"
              >
                Mark In Progress
              </Button>
              <Button 
                onClick={() => handleStatusUpdate(selectedSubmission, 'responded')}
                disabled={updateSubmissionMutation.isPending}
                className="bg-green-600 hover:bg-green-700"
              >
                Mark as Responded
              </Button>
              <Button 
                onClick={() => window.open(`mailto:${selectedSubmission.email}?subject=Re: ${selectedSubmission.subject}&body=Hi ${selectedSubmission.name},%0A%0A`)}
                variant="outline"
              >
                <Mail className="h-4 w-4 mr-2" />
                Reply via Email
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-gray-900">Contact Submissions</h2>
            <div className="text-sm text-gray-600">
              Total: {submissions?.length || 0}
            </div>
          </div>

          {!submissions || submissions.length === 0 ? (
            <Card>
              <CardContent className="text-center py-8">
                <MessageSquare className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600">No contact submissions yet</p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4">
              {submissions.map((submission) => (
                <Card key={submission.id} className="hover:shadow-md transition-shadow cursor-pointer">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="font-semibold text-gray-900">{submission.name}</h3>
                          <Badge className={`${getStatusColor(submission.status)} text-white`}>
                            {getStatusIcon(submission.status)}
                            <span className="ml-1 capitalize">{submission.status.replace('_', ' ')}</span>
                          </Badge>
                        </div>
                        <p className="text-sm text-gray-600 mb-1">{submission.email}</p>
                        <p className="text-sm font-medium text-gray-800 mb-2">{submission.subject}</p>
                        <p className="text-sm text-gray-600 line-clamp-2">{submission.message}</p>
                        <div className="flex items-center gap-2 mt-2 text-xs text-gray-500">
                          <Calendar className="h-3 w-3" />
                          {format(new Date(submission.created_at), 'PPp')}
                        </div>
                      </div>
                      <Button 
                        onClick={() => {
                          setSelectedSubmission(submission);
                          setAdminNotes(submission.admin_notes || '');
                        }}
                        variant="outline"
                        size="sm"
                      >
                        View Details
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
