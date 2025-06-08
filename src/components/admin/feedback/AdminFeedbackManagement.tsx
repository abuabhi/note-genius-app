
import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useAdminFeedback, useUpdateFeedbackStatus, useRespondToFeedback } from '@/hooks/admin/useAdminFeedback';
import { MessageSquare, User, Calendar, Star, Send, Search, Filter } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { Feedback } from '@/types/feedback';

export const AdminFeedbackManagement = () => {
  const { data: feedbackList, isLoading } = useAdminFeedback();
  const updateStatus = useUpdateFeedbackStatus();
  const respondToFeedback = useRespondToFeedback();

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [selectedFeedback, setSelectedFeedback] = useState<any>(null);
  const [responseText, setResponseText] = useState('');

  const filteredFeedback = feedbackList?.filter(feedback => {
    const matchesSearch = feedback.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         feedback.description?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || feedback.status === statusFilter;
    const matchesType = typeFilter === 'all' || feedback.type === typeFilter;
    
    return matchesSearch && matchesStatus && matchesType;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'in_progress': return 'bg-blue-100 text-blue-800';
      case 'resolved': return 'bg-green-100 text-green-800';
      case 'closed': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'rating': return 'bg-purple-100 text-purple-800';
      case 'feature_request': return 'bg-blue-100 text-blue-800';
      case 'bug_report': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'low': return 'bg-green-100 text-green-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'high': return 'bg-orange-100 text-orange-800';
      case 'critical': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const handleStatusChange = (feedbackId: string, newStatus: string) => {
    updateStatus.mutate({ id: feedbackId, status: newStatus });
  };

  const handleSendResponse = () => {
    if (!selectedFeedback || !responseText.trim()) return;
    
    respondToFeedback.mutate({
      id: selectedFeedback.id,
      adminResponse: responseText.trim()
    });
    
    setResponseText('');
    setSelectedFeedback(null);
  };

  if (isLoading) {
    return <div className="flex items-center justify-center p-8">Loading feedback...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search feedback..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[140px]">
            <Filter className="h-4 w-4 mr-2" />
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="in_progress">In Progress</SelectItem>
            <SelectItem value="resolved">Resolved</SelectItem>
            <SelectItem value="closed">Closed</SelectItem>
          </SelectContent>
        </Select>

        <Select value={typeFilter} onValueChange={setTypeFilter}>
          <SelectTrigger className="w-[140px]">
            <SelectValue placeholder="Type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Types</SelectItem>
            <SelectItem value="rating">Rating</SelectItem>
            <SelectItem value="feature_request">Feature Request</SelectItem>
            <SelectItem value="bug_report">Bug Report</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Feedback List */}
      <div className="grid gap-4">
        {filteredFeedback?.map((feedback) => (
          <Card key={feedback.id} className="hover:shadow-md transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="space-y-2">
                  <CardTitle className="text-lg">{feedback.title}</CardTitle>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <User className="h-4 w-4" />
                    <span>{feedback.profiles?.username || 'Unknown User'}</span>
                    <Calendar className="h-4 w-4 ml-2" />
                    <span>{formatDistanceToNow(new Date(feedback.created_at), { addSuffix: true })}</span>
                    {feedback.rating && (
                      <>
                        <Star className="h-4 w-4 ml-2" />
                        <span>{feedback.rating}/5</span>
                      </>
                    )}
                  </div>
                </div>
                
                <div className="flex flex-col items-end gap-2">
                  <div className="flex gap-2">
                    <Badge className={getTypeColor(feedback.type)}>
                      {feedback.type.replace('_', ' ')}
                    </Badge>
                    <Badge className={getStatusColor(feedback.status)}>
                      {feedback.status.replace('_', ' ')}
                    </Badge>
                    {feedback.priority && (
                      <Badge className={getPriorityColor(feedback.priority)}>
                        {feedback.priority}
                      </Badge>
                    )}
                  </div>
                  
                  <Select 
                    value={feedback.status} 
                    onValueChange={(value) => handleStatusChange(feedback.id, value)}
                  >
                    <SelectTrigger className="w-[120px] h-8">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="in_progress">In Progress</SelectItem>
                      <SelectItem value="resolved">Resolved</SelectItem>
                      <SelectItem value="closed">Closed</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardHeader>
            
            <CardContent className="pt-0">
              {feedback.description && (
                <p className="text-muted-foreground mb-4 line-clamp-2">
                  {feedback.description}
                </p>
              )}
              
              {feedback.admin_response && (
                <div className="bg-muted p-3 rounded-md mb-4">
                  <p className="text-sm font-medium mb-1">Admin Response:</p>
                  <p className="text-sm">{feedback.admin_response}</p>
                  {feedback.responded_at && (
                    <p className="text-xs text-muted-foreground mt-1">
                      Responded {formatDistanceToNow(new Date(feedback.responded_at), { addSuffix: true })}
                    </p>
                  )}
                </div>
              )}
              
              <div className="flex gap-2">
                <Dialog>
                  <DialogTrigger asChild>
                    <Button variant="outline" size="sm">
                      View Details
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-2xl">
                    <DialogHeader>
                      <DialogTitle>{feedback.title}</DialogTitle>
                      <DialogDescription>
                        {feedback.type.replace('_', ' ')} • {feedback.status.replace('_', ' ')}
                      </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div>
                        <h4 className="font-medium mb-2">Description</h4>
                        <p className="text-muted-foreground">
                          {feedback.description || 'No description provided'}
                        </p>
                      </div>
                      
                      {feedback.admin_response && (
                        <div>
                          <h4 className="font-medium mb-2">Previous Response</h4>
                          <div className="bg-muted p-3 rounded-md">
                            <p>{feedback.admin_response}</p>
                          </div>
                        </div>
                      )}
                    </div>
                  </DialogContent>
                </Dialog>
                
                <Dialog open={selectedFeedback?.id === feedback.id} onOpenChange={(open) => {
                  if (!open) {
                    setSelectedFeedback(null);
                    setResponseText('');
                  }
                }}>
                  <DialogTrigger asChild>
                    <Button 
                      variant="default" 
                      size="sm"
                      onClick={() => setSelectedFeedback(feedback)}
                    >
                      <MessageSquare className="h-4 w-4 mr-1" />
                      Respond
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Respond to Feedback</DialogTitle>
                      <DialogDescription>
                        Send a response to {feedback.profiles?.username} about "{feedback.title}"
                      </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                      <Textarea
                        placeholder="Type your response here..."
                        value={responseText}
                        onChange={(e) => setResponseText(e.target.value)}
                        className="min-h-[100px]"
                      />
                      <div className="flex justify-end gap-2">
                        <Button 
                          variant="outline" 
                          onClick={() => {
                            setSelectedFeedback(null);
                            setResponseText('');
                          }}
                        >
                          Cancel
                        </Button>
                        <Button 
                          onClick={handleSendResponse}
                          disabled={!responseText.trim() || respondToFeedback.isPending}
                        >
                          <Send className="h-4 w-4 mr-2" />
                          {respondToFeedback.isPending ? 'Sending...' : 'Send Response'}
                        </Button>
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
      
      {filteredFeedback?.length === 0 && (
        <div className="text-center py-8 text-muted-foreground">
          No feedback found matching your filters.
        </div>
      )}
    </div>
  );
};
