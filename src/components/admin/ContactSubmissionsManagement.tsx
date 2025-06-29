
import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';

interface ContactSubmission {
  id: string;
  name: string;
  email: string;
  subject: string | null;
  message: string;
  status: string;
  created_at: string;
  updated_at: string;
  responded_at: string | null;
  admin_notes: string | null;
}

export const ContactSubmissionsManagement = () => {
  const [submissions, setSubmissions] = useState<ContactSubmission[]>([]);
  const [loading, setLoading] = useState(true);
  const [adminNotes, setAdminNotes] = useState<{ [key: string]: string }>({});
  const { toast } = useToast();

  const fetchSubmissions = async () => {
    try {
      // Use type assertion to bypass the type checking issue
      const { data, error } = await (supabase as any)
        .from('contact_submissions')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching contact submissions:', error);
        toast({
          title: "Error",
          description: "Failed to fetch contact submissions",
          variant: "destructive",
        });
        return;
      }

      setSubmissions(data || []);
    } catch (error) {
      console.error('Unexpected error:', error);
      toast({
        title: "Error",
        description: "An unexpected error occurred",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (id: string, status: string, notes?: string) => {
    try {
      const updateData: any = { 
        status, 
        updated_at: new Date().toISOString() 
      };
      
      if (status === 'responded') {
        updateData.responded_at = new Date().toISOString();
      }
      
      if (notes) {
        updateData.admin_notes = notes;
      }

      const { error } = await (supabase as any)
        .from('contact_submissions')
        .update(updateData)
        .eq('id', id);

      if (error) {
        console.error('Error updating submission:', error);
        toast({
          title: "Error",
          description: "Failed to update submission status",
          variant: "destructive",
        });
        return;
      }

      toast({
        title: "Success",
        description: "Submission status updated successfully",
      });

      // Refresh the data
      fetchSubmissions();
    } catch (error) {
      console.error('Unexpected error:', error);
      toast({
        title: "Error",
        description: "An unexpected error occurred",
        variant: "destructive",
      });
    }
  };

  useEffect(() => {
    fetchSubmissions();
  }, []);

  if (loading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <Card key={i} className="animate-pulse">
            <CardContent className="p-6">
              <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
              <div className="h-3 bg-gray-200 rounded w-1/2 mb-4"></div>
              <div className="h-20 bg-gray-200 rounded w-full"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (submissions.length === 0) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <p className="text-gray-600">No contact submissions found.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {submissions.map((submission) => (
        <Card key={submission.id} className="border-l-4 border-l-blue-500">
          <CardHeader>
            <div className="flex justify-between items-start">
              <div>
                <CardTitle className="text-lg">{submission.subject || 'Contact Form Submission'}</CardTitle>
                <div className="flex items-center gap-4 mt-2 text-sm text-gray-600">
                  <span><strong>From:</strong> {submission.name} ({submission.email})</span>
                  <span><strong>Date:</strong> {format(new Date(submission.created_at), 'MMM dd, yyyy HH:mm')}</span>
                </div>
              </div>
              <Badge variant={
                submission.status === 'new' ? 'default' :
                submission.status === 'in_progress' ? 'secondary' :
                submission.status === 'responded' ? 'outline' : 'default'
              }>
                {submission.status}
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h4 className="font-medium mb-2">Message:</h4>
              <div className="bg-gray-50 p-3 rounded-lg whitespace-pre-wrap">
                {submission.message}
              </div>
            </div>

            {submission.admin_notes && (
              <div>
                <h4 className="font-medium mb-2">Admin Notes:</h4>
                <div className="bg-blue-50 p-3 rounded-lg">
                  {submission.admin_notes}
                </div>
              </div>
            )}

            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium mb-1">Admin Notes:</label>
                <Textarea
                  placeholder="Add notes about this submission..."
                  value={adminNotes[submission.id] || ''}
                  onChange={(e) => setAdminNotes({
                    ...adminNotes,
                    [submission.id]: e.target.value
                  })}
                />
              </div>

              <div className="flex gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => updateStatus(submission.id, 'in_progress', adminNotes[submission.id])}
                  disabled={submission.status === 'in_progress'}
                >
                  Mark In Progress
                </Button>
                <Button
                  size="sm"
                  onClick={() => updateStatus(submission.id, 'responded', adminNotes[submission.id])}
                  disabled={submission.status === 'responded'}
                >
                  Mark Responded
                </Button>
                <Button
                  size="sm"
                  variant="secondary"
                  onClick={() => updateStatus(submission.id, 'new', adminNotes[submission.id])}
                  disabled={submission.status === 'new'}
                >
                  Reset to New
                </Button>
              </div>
            </div>

            {submission.responded_at && (
              <div className="text-sm text-green-600">
                Responded on: {format(new Date(submission.responded_at), 'MMM dd, yyyy HH:mm')}
              </div>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  );
};
