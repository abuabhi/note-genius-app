
export interface Announcement {
  id: string;
  title: string;
  content: string; // Can contain HTML for rich text
  is_active: boolean;
  start_date: string;
  end_date: string;
  background_color: string;
  text_color: string;
  text_align: 'left' | 'center' | 'right';
  mobile_layout: 'default' | 'condensed' | 'expanded';
  priority: 'high' | 'medium' | 'low';
  target_tier: string | null;
  target_pages: string[];
  dismissible: boolean;
  cta_text?: string | null;
  cta_url?: string | null;
  created_at?: string;
}

export interface AnnouncementFormData {
  title: string;
  content: string; // Can contain HTML for rich text
  is_active: boolean;
  start_date: Date;
  end_date: Date;
  background_color: string;
  text_color: string;
  text_align: 'left' | 'center' | 'right';
  mobile_layout: 'default' | 'condensed' | 'expanded';
  priority: 'high' | 'medium' | 'low';
  target_tier: string | null;
  target_pages: string[];
  dismissible: boolean;
  cta_text?: string | null;
  cta_url?: string | null;
}
