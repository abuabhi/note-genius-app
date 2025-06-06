
export interface AnnouncementFormData {
  title: string;
  content: string;
  compact_text?: string;
  cta_text?: string;
  cta_url?: string;
  background_color: string;
  text_color: string;
  is_active: boolean;
  start_date: string;
  end_date: string;
  target_tier: string;
  target_pages: string;
  mobile_layout: string;
  priority: number;
  dismissible: boolean;
}

export interface Announcement {
  id: string;
  title: string;
  content: string;
  compact_text?: string;
  cta_text?: string;
  cta_url?: string;
  background_color: string;
  text_color: string;
  is_active: boolean;
  start_date: string;
  end_date: string;
  target_tier: string;
  target_pages: string[];
  mobile_layout: string;
  priority: number;
  dismissible: boolean;
  created_at: string;
}

export interface AnnouncementFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  announcement?: Announcement;
}
