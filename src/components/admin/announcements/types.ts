
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
  start_date: string; // Changed from Date to string for datetime-local input
  end_date: string; // Changed from Date to string for datetime-local input
  background_color: string;
  text_color: string;
  text_align: 'left' | 'center' | 'right';
  mobile_layout: 'default' | 'condensed' | 'expanded';
  target_tier: string | null;
  target_pages: string;  // This will be stringified JSON
  dismissible: boolean;
  cta_text?: string | null;
  cta_url?: string | null;
}

export interface AnnouncementFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  announcement?: Announcement | null;
}
