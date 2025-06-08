
export interface Feedback {
  id: string;
  user_id: string;
  type: 'rating' | 'feature_request' | 'bug_report';
  title: string;
  description?: string;
  rating?: number;
  status: 'pending' | 'in_progress' | 'resolved' | 'closed';
  priority: 'low' | 'medium' | 'high' | 'critical';
  severity: 'minor' | 'major' | 'critical';
  admin_response?: string;
  responded_at?: string;
  responded_by?: string;
  created_at: string;
  updated_at: string;
}

export interface FeedbackAttachment {
  id: string;
  feedback_id: string;
  file_name: string;
  file_url: string;
  file_type: string;
  file_size?: number;
  created_at: string;
}

export interface CreateFeedbackData {
  type: 'rating' | 'feature_request' | 'bug_report';
  title: string;
  description?: string;
  rating?: number;
  priority?: 'low' | 'medium' | 'high' | 'critical';
  severity?: 'minor' | 'major' | 'critical';
}
