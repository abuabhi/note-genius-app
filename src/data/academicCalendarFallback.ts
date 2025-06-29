
interface AcademicEvent {
  id: string;
  name: string;
  date: string;
  endDate?: string;
  type: 'holiday' | 'school' | 'term' | 'exam';
  category: 'public' | 'academic';
  isMultiDay: boolean;
}

export const fallbackCalendarData: Record<string, AcademicEvent[]> = {
  AU: [
    // Academic Terms (Australian academic year starts in February)
    { id: 'au-semester1-2025', name: 'Semester 1', date: '2025-02-24', endDate: '2025-06-20', type: 'term', category: 'academic', isMultiDay: true },
    { id: 'au-semester2-2025', name: 'Semester 2', date: '2025-07-21', endDate: '2025-11-14', type: 'term', category: 'academic', isMultiDay: true },
    { id: 'au-semester1-2026', name: 'Semester 1', date: '2026-02-23', endDate: '2026-06-19', type: 'term', category: 'academic', isMultiDay: true },
    
    // Public Holidays 2025
    { id: 'au-new-year', name: 'New Year\'s Day', date: '2025-01-01', type: 'holiday', category: 'public', isMultiDay: false },
    { id: 'au-australia-day', name: 'Australia Day', date: '2025-01-26', type: 'holiday', category: 'public', isMultiDay: false },
    { id: 'au-anzac-day-2025', name: 'ANZAC Day', date: '2025-04-25', type: 'holiday', category: 'public', isMultiDay: false },
    { id: 'au-kings-birthday-2025', name: "King's Birthday", date: '2025-06-09', type: 'holiday', category: 'public', isMultiDay: false },
    { id: 'au-melbourne-cup-2025', name: 'Melbourne Cup', date: '2025-11-04', type: 'holiday', category: 'public', isMultiDay: false },
    { id: 'au-christmas-2025', name: 'Christmas Day', date: '2025-12-25', type: 'holiday', category: 'public', isMultiDay: false },
    { id: 'au-boxing-day-2025', name: 'Boxing Day', date: '2025-12-26', type: 'holiday', category: 'public', isMultiDay: false },
    
    // Academic Breaks
    { id: 'au-mid-year-break-2025', name: 'Mid-Year Break', date: '2025-06-23', endDate: '2025-07-18', type: 'school', category: 'academic', isMultiDay: true },
    { id: 'au-summer-break-2025', name: 'Summer Break', date: '2025-11-17', endDate: '2025-02-21', type: 'school', category: 'academic', isMultiDay: true },
    
    // Exam Periods
    { id: 'au-semester1-exams-2025', name: 'Semester 1 Exams', date: '2025-06-16', endDate: '2025-06-20', type: 'exam', category: 'academic', isMultiDay: true },
    { id: 'au-semester2-exams-2025', name: 'Semester 2 Exams', date: '2025-11-10', endDate: '2025-11-14', type: 'exam', category: 'academic', isMultiDay: true }
  ],

  US: [
    // Academic Terms
    { id: 'us-fall-2025', name: 'Fall Semester', date: '2025-08-25', endDate: '2025-12-12', type: 'term', category: 'academic', isMultiDay: true },
    { id: 'us-spring-2026', name: 'Spring Semester', date: '2026-01-12', endDate: '2026-05-08', type: 'term', category: 'academic', isMultiDay: true },
    { id: 'us-summer-2026', name: 'Summer Session', date: '2026-05-18', endDate: '2026-08-07', type: 'term', category: 'academic', isMultiDay: true },
    
    // Public Holidays 2025
    { id: 'us-new-year', name: 'New Year\'s Day', date: '2025-01-01', type: 'holiday', category: 'public', isMultiDay: false },
    { id: 'us-mlk-day', name: 'Martin Luther King Jr. Day', date: '2025-01-20', type: 'holiday', category: 'public', isMultiDay: false },
    { id: 'us-presidents-day', name: 'Presidents\' Day', date: '2025-02-17', type: 'holiday', category: 'public', isMultiDay: false },
    { id: 'us-memorial-day', name: 'Memorial Day', date: '2025-05-26', type: 'holiday', category: 'public', isMultiDay: false },
    { id: 'us-independence-day', name: 'Independence Day', date: '2025-07-04', type: 'holiday', category: 'public', isMultiDay: false },
    { id: 'us-labor-day-2025', name: 'Labor Day', date: '2025-09-01', type: 'holiday', category: 'public', isMultiDay: false },
    { id: 'us-thanksgiving-2025', name: 'Thanksgiving', date: '2025-11-27', endDate: '2025-11-28', type: 'holiday', category: 'public', isMultiDay: true },
    { id: 'us-christmas-2025', name: 'Christmas Day', date: '2025-12-25', type: 'holiday', category: 'public', isMultiDay: false },
    
    // Academic Breaks
    { id: 'us-winter-break-2025', name: 'Winter Break', date: '2025-12-15', endDate: '2026-01-09', type: 'school', category: 'academic', isMultiDay: true },
    { id: 'us-spring-break-2026', name: 'Spring Break', date: '2026-03-09', endDate: '2026-03-13', type: 'school', category: 'academic', isMultiDay: true },
    
    // Exam Periods
    { id: 'us-fall-finals-2025', name: 'Fall Finals', date: '2025-12-08', endDate: '2025-12-12', type: 'exam', category: 'academic', isMultiDay: true },
    { id: 'us-spring-finals-2026', name: 'Spring Finals', date: '2026-05-04', endDate: '2026-05-08', type: 'exam', category: 'academic', isMultiDay: true }
  ],

  GB: [
    // Academic Terms (UK academic year starts in October)
    { id: 'gb-autumn-2025', name: 'Autumn Term', date: '2025-10-06', endDate: '2025-12-12', type: 'term', category: 'academic', isMultiDay: true },
    { id: 'gb-spring-2026', name: 'Spring Term', date: '2026-01-12', endDate: '2026-03-20', type: 'term', category: 'academic', isMultiDay: true },
    { id: 'gb-summer-2026', name: 'Summer Term', date: '2026-04-27', endDate: '2026-06-19', type: 'term', category: 'academic', isMultiDay: true },
    
    // Public Holidays 2025
    { id: 'gb-new-year', name: 'New Year\'s Day', date: '2025-01-01', type: 'holiday', category: 'public', isMultiDay: false },
    { id: 'gb-good-friday', name: 'Good Friday', date: '2025-04-18', type: 'holiday', category: 'public', isMultiDay: false },
    { id: 'gb-easter-monday', name: 'Easter Monday', date: '2025-04-21', type: 'holiday', category: 'public', isMultiDay: false },
    { id: 'gb-early-may', name: 'Early May Bank Holiday', date: '2025-05-05', type: 'holiday', category: 'public', isMultiDay: false },
    { id: 'gb-spring-bank', name: 'Spring Bank Holiday', date: '2025-05-26', type: 'holiday', category: 'public', isMultiDay: false },
    { id: 'gb-summer-bank', name: 'Summer Bank Holiday', date: '2025-08-25', type: 'holiday', category: 'public', isMultiDay: false },
    { id: 'gb-christmas-2025', name: 'Christmas Day', date: '2025-12-25', type: 'holiday', category: 'public', isMultiDay: false },
    { id: 'gb-boxing-day-2025', name: 'Boxing Day', date: '2025-12-26', type: 'holiday', category: 'public', isMultiDay: false },
    
    // Academic Breaks
    { id: 'gb-christmas-break-2025', name: 'Christmas Break', date: '2025-12-15', endDate: '2026-01-09', type: 'school', category: 'academic', isMultiDay: true },
    { id: 'gb-easter-break-2026', name: 'Easter Break', date: '2026-03-23', endDate: '2026-04-24', type: 'school', category: 'academic', isMultiDay: true }
  ],

  CA: [
    // Academic Terms (Canadian academic year similar to US)
    { id: 'ca-fall-2025', name: 'Fall Term', date: '2025-09-02', endDate: '2025-12-19', type: 'term', category: 'academic', isMultiDay: true },
    { id: 'ca-winter-2026', name: 'Winter Term', date: '2026-01-05', endDate: '2026-04-29', type: 'term', category: 'academic', isMultiDay: true },
    { id: 'ca-summer-2026', name: 'Summer Term', date: '2026-05-04', endDate: '2026-08-28', type: 'term', category: 'academic', isMultiDay: true },
    
    // Public Holidays 2025
    { id: 'ca-new-year', name: 'New Year\'s Day', date: '2025-01-01', type: 'holiday', category: 'public', isMultiDay: false },
    { id: 'ca-family-day', name: 'Family Day', date: '2025-02-17', type: 'holiday', category: 'public', isMultiDay: false },
    { id: 'ca-good-friday', name: 'Good Friday', date: '2025-04-18', type: 'holiday', category: 'public', isMultiDay: false },
    { id: 'ca-victoria-day-2025', name: 'Victoria Day', date: '2025-05-19', type: 'holiday', category: 'public', isMultiDay: false },
    { id: 'ca-canada-day-2025', name: 'Canada Day', date: '2025-07-01', type: 'holiday', category: 'public', isMultiDay: false },
    { id: 'ca-labour-day', name: 'Labour Day', date: '2025-09-01', type: 'holiday', category: 'public', isMultiDay: false },
    { id: 'ca-thanksgiving-2025', name: 'Thanksgiving', date: '2025-10-13', type: 'holiday', category: 'public', isMultiDay: false },
    { id: 'ca-christmas-2025', name: 'Christmas Day', date: '2025-12-25', type: 'holiday', category: 'public', isMultiDay: false },
    { id: 'ca-boxing-day-2025', name: 'Boxing Day', date: '2025-12-26', type: 'holiday', category: 'public', isMultiDay: false }
  ]
};

export const getCurrentPeriod = (events: AcademicEvent[]): string => {
  const today = new Date().toISOString().split('T')[0];
  
  // Check if we're in a term
  for (const event of events) {
    if (event.type === 'term' && event.endDate && today >= event.date && today <= event.endDate) {
      return event.name;
    }
  }
  
  // Check if we're in an exam period
  for (const event of events) {
    if (event.type === 'exam' && event.endDate && today >= event.date && today <= event.endDate) {
      return event.name;
    }
  }
  
  // Check if we're in a break
  for (const event of events) {
    if (event.type === 'school' && event.endDate && today >= event.date && today <= event.endDate) {
      return event.name;
    }
  }
  
  return 'Between Terms';
};
