
-- Create academic calendars table to store term dates and holidays
CREATE TABLE public.academic_calendars (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  country_code TEXT NOT NULL,
  state_region TEXT,
  institution_type TEXT NOT NULL DEFAULT 'university',
  academic_year TEXT NOT NULL,
  calendar_data JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create user academic preferences table
CREATE TABLE public.user_academic_preferences (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users,
  country_code TEXT NOT NULL DEFAULT 'US',
  state_region TEXT,
  institution_type TEXT NOT NULL DEFAULT 'university',
  academic_year TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id)
);

-- Enable RLS for both tables
ALTER TABLE public.academic_calendars ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_academic_preferences ENABLE ROW LEVEL SECURITY;

-- RLS policies for academic_calendars (public read access)
CREATE POLICY "Academic calendars are publicly readable" 
  ON public.academic_calendars 
  FOR SELECT 
  USING (true);

-- RLS policies for user_academic_preferences
CREATE POLICY "Users can view their own academic preferences" 
  ON public.user_academic_preferences 
  FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own academic preferences" 
  ON public.user_academic_preferences 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own academic preferences" 
  ON public.user_academic_preferences 
  FOR UPDATE 
  USING (auth.uid() = user_id);

-- Insert some sample data for common countries
INSERT INTO public.academic_calendars (country_code, institution_type, academic_year, calendar_data) VALUES 
(
  'US', 
  'university', 
  '2024-2025',
  '{
    "terms": [
      {"name": "Fall Semester", "start": "2024-08-26", "end": "2024-12-13"},
      {"name": "Spring Semester", "start": "2025-01-13", "end": "2025-05-09"},
      {"name": "Summer Session", "start": "2025-05-19", "end": "2025-08-08"}
    ],
    "holidays": [
      {"name": "Labor Day", "date": "2024-09-02"},
      {"name": "Thanksgiving Break", "start": "2024-11-28", "end": "2024-11-29"},
      {"name": "Winter Break", "start": "2024-12-16", "end": "2025-01-10"},
      {"name": "Spring Break", "start": "2025-03-10", "end": "2025-03-14"},
      {"name": "Memorial Day", "date": "2025-05-26"}
    ],
    "exam_periods": [
      {"name": "Fall Finals", "start": "2024-12-09", "end": "2024-12-13"},
      {"name": "Spring Finals", "start": "2025-05-05", "end": "2025-05-09"}
    ]
  }'
),
(
  'GB', 
  'university', 
  '2024-2025',
  '{
    "terms": [
      {"name": "Autumn Term", "start": "2024-10-07", "end": "2024-12-13"},
      {"name": "Spring Term", "start": "2025-01-13", "end": "2025-03-21"},
      {"name": "Summer Term", "start": "2025-04-28", "end": "2025-06-20"}
    ],
    "holidays": [
      {"name": "Christmas Break", "start": "2024-12-16", "end": "2025-01-10"},
      {"name": "Easter Break", "start": "2025-03-24", "end": "2025-04-25"},
      {"name": "Summer Holiday", "start": "2025-06-23", "end": "2025-10-04"}
    ],
    "exam_periods": [
      {"name": "Christmas Exams", "start": "2024-12-09", "end": "2024-12-13"},
      {"name": "Summer Exams", "start": "2025-05-12", "end": "2025-06-20"}
    ]
  }'
);
