-- Create help_topics table for database-driven help content
CREATE TABLE public.help_topics (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text NOT NULL,
  content text NOT NULL,
  category text NOT NULL,
  priority integer NOT NULL DEFAULT 1,
  tags jsonb DEFAULT '[]'::jsonb,
  video_url text,
  video_title text,
  video_duration text,
  video_chapters jsonb DEFAULT '[]'::jsonb,
  quick_tips jsonb DEFAULT '[]'::jsonb,
  is_active boolean DEFAULT true,
  created_by uuid REFERENCES auth.users(id),
  last_edited_by uuid REFERENCES auth.users(id),
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.help_topics ENABLE ROW LEVEL SECURITY;

-- Allow everyone to read active help topics
CREATE POLICY "Anyone can view active help topics"
ON public.help_topics
FOR SELECT
USING (is_active = true);

-- Only DEAN tier users can manage help topics
CREATE POLICY "DEAN users can manage help topics"
ON public.help_topics
FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM public.profiles
    WHERE profiles.id = auth.uid()
    AND profiles.user_tier = 'DEAN'
  )
);

-- Add updated_at trigger
CREATE TRIGGER update_help_topics_updated_at
  BEFORE UPDATE ON public.help_topics
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Insert initial help content from static data
INSERT INTO public.help_topics (title, description, content, category, priority, tags, video_url, video_title, video_duration, video_chapters, quick_tips) VALUES
('Understanding Your Dashboard', 'Learn how to navigate and use your PrepGenie dashboard effectively', 'Your dashboard is your central hub for all study activities. Here you can:

• **Welcome Banner**: View your daily study statistics and progress
• **Quick Actions**: Fast access to create notes, flashcards, and start study sessions
• **Recent Activity**: Track your latest study sessions and achievements
• **Today''s Focus**: See reminders, overdue items, and daily goals
• **Study Analytics**: Monitor your progress with detailed charts and insights

**Navigation Tips:**
- Use the sidebar to access different sections of the app
- The floating help button provides contextual assistance
- Reminders appear in the top navigation bar
- Your profile and settings are accessible from the user menu', 'getting-started', 1, '["dashboard", "overview", "navigation", "getting-started"]'::jsonb, null, 'Dashboard Tour - PrepGenie (Coming Soon)', '4:30', '[{"time": 0, "title": "Welcome Banner Overview", "description": "Daily stats and progress"}, {"time": 60, "title": "Quick Actions Guide", "description": "Creating content quickly"}, {"time": 150, "title": "Navigation & Sidebar", "description": "Moving around the app"}, {"time": 210, "title": "Today''s Focus Section", "description": "Managing daily tasks"}]'::jsonb, '["Check your daily stats in the welcome banner each morning", "Use quick actions for fastest content creation", "Enable notifications to stay on top of reminders", "Customize your dashboard layout in settings"]'::jsonb),

('Complete Guide to Creating Notes', 'Master all methods of creating and organizing notes in PrepGenie', 'PrepGenie offers multiple ways to create notes:

**Manual Creation:**
1. Click "Add Note" button
2. Choose "Create Manually"
3. Fill in title, subject, and content
4. Add tags for better organization
5. Save your note

**Document Scanning (OCR):**
1. Click "Add Note" → "Scan Document"
2. Take photo or upload image
3. Select OCR language if needed
4. Review extracted text
5. Edit and save the note

**File Import:**
1. Click "Add Note" → "Import File"
2. Upload PDF, DOCX, or TXT files
3. Choose processing options
4. Review imported content
5. Organize and save

**Best Practices:**
- Use consistent naming conventions
- Add relevant tags for searchability
- Organize by subject for easy access
- Include source information for references', 'notes', 2, '["notes", "creation", "ocr", "import", "scanning"]'::jsonb, null, 'Complete Note Creation Guide (Coming Soon)', '8:15', '[{"time": 0, "title": "Manual Note Creation", "description": "Step-by-step manual process"}, {"time": 120, "title": "OCR Scanning Features", "description": "Document scanning and extraction"}, {"time": 300, "title": "File Import Methods", "description": "Uploading and processing files"}]'::jsonb, '["Use clear, descriptive titles for easy searching", "Scan documents in good lighting for better OCR results", "Tag notes immediately after creation", "Use subjects to group related notes together"]'::jsonb),

('AI-Powered Note Enhancement', 'Transform your notes with AI-powered summaries, explanations, and improvements', 'PrepGenie''s AI enhancement features help you get more from your notes:

**Available Enhancements:**
• **Smart Summary**: Generate concise summaries of long notes
• **Detailed Explanation**: Get in-depth explanations of complex topics
• **Key Points**: Extract the most important information
• **Study Questions**: Generate practice questions from your content
• **Spelling & Grammar**: Improve writing quality automatically

**How to Use AI Enhancements:**
1. Open any note in study view
2. Click the "Enhance" dropdown in the header
3. Select the type of enhancement you want
4. Wait for AI processing (usually 10-30 seconds)
5. Review and apply the enhancement

**Tips for Best Results:**
- Use clear, well-structured notes as input
- Longer notes generally produce better summaries
- Review AI suggestions before applying them
- Combine multiple enhancement types for comprehensive study materials', 'ai-features', 3, '["ai", "enhancement", "summary", "explanation", "study"]'::jsonb, null, 'AI Note Enhancement Tutorial (Coming Soon)', '6:45', '[{"time": 0, "title": "Enhancement Overview", "description": "Available AI features"}, {"time": 90, "title": "Using Enhancement Tools", "description": "Step-by-step process"}, {"time": 240, "title": "Enhancement Types", "description": "Different enhancement options"}]'::jsonb, '["Start with well-written, structured notes for best AI results", "Use multiple enhancement types for comprehensive study materials", "Review AI suggestions before applying them to your notes"]'::jsonb),

('Master Flashcard Creation', 'Learn all methods to create effective flashcards for optimal studying', 'PrepGenie offers multiple ways to create flashcards:

**Manual Creation:**
1. Go to Flashcards section
2. Click "Create Set" or "Add Flashcard"
3. Enter front and back content
4. Add images, formatting, or audio if needed
5. Organize into sets by topic

**AI-Generated from Notes:**
1. Open any note in study view
2. Click "Convert to Flashcards"
3. Select content portions to convert
4. Choose flashcard type (basic, cloze, multiple choice)
5. Review and edit generated cards

**Flashcard Types:**
• **Basic**: Question/answer format
• **Cloze Deletion**: Fill-in-the-blank style
• **Multiple Choice**: Question with options
• **Image-based**: Visual learning cards

**Best Practices:**
- Keep cards simple and focused
- Use images when possible
- Create cards immediately after learning
- Review and update cards regularly
- Use spaced repetition for optimal retention', 'flashcards', 5, '["flashcards", "creation", "ai-generation", "study-cards"]'::jsonb, null, 'Flashcard Creation Complete Guide (Coming Soon)', '9:30', '[{"time": 0, "title": "Manual Creation", "description": "Creating cards from scratch"}, {"time": 150, "title": "AI Generation", "description": "Converting notes to flashcards"}, {"time": 350, "title": "Import Methods", "description": "Bulk importing flashcards"}]'::jsonb, '["Create cards immediately after learning new concepts", "Use images and visual cues when possible", "Keep flashcards simple and focused on one concept"]'::jsonb),

('Complete Reminders System Guide', 'Master the reminder system to stay on top of your study schedule', 'PrepGenie''s reminder system helps you stay organized and on track:

**Types of Reminders:**
• **Study Events**: Scheduled study sessions
• **Goal Deadlines**: Important milestone dates
• **Flashcard Reviews**: Spaced repetition reminders
• **Todo Items**: Task-based reminders
• **Custom Reminders**: Personalized notifications

**Creating Reminders:**
1. Click the bell icon in the navigation
2. Select "Add Reminder" or use quick creation
3. Choose reminder type and set details
4. Set date, time, and recurrence options
5. Configure notification preferences

**Smart Features:**
- Automatic reminders for overdue flashcard reviews
- Goal deadline notifications
- Study session reminders based on your schedule
- Adaptive timing based on your study patterns

**Best Practices:**
- Set reminders 15-30 minutes before study sessions
- Use recurring reminders for regular study blocks
- Review and update reminders weekly
- Don''t over-schedule - leave buffer time between tasks', 'reminders', 6, '["reminders", "notifications", "scheduling", "study-planning"]'::jsonb, null, 'Reminders System Tutorial (Coming Soon)', '5:45', '[{"time": 0, "title": "Reminder Types", "description": "Different reminder categories"}, {"time": 120, "title": "Creating Reminders", "description": "Step-by-step creation process"}, {"time": 240, "title": "Management Features", "description": "Organizing and handling reminders"}]'::jsonb, '["Set reminders 15-30 minutes before study sessions", "Use recurring reminders for regular study blocks", "Review overdue reminders daily to stay on track"]'::jsonb);