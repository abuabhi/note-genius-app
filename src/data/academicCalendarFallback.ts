
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
  US: [
    // Academic Terms
    { id: 'us-fall-2024', name: 'Fall Semester', date: '2024-08-26', endDate: '2024-12-13', type: 'term', category: 'academic', isMultiDay: true },
    { id: 'us-spring-2025', name: 'Spring Semester', date: '2025-01-13', endDate: '2025-05-09', type: 'term', category: 'academic', isMultiDay: true },
    { id: 'us-summer-2025', name: 'Summer Session', date: '2025-05-19', endDate: '2025-08-08', type: 'term', category: 'academic', isMultiDay: true },
    
    // Public Holidays
    { id: 'us-labor-day', name: 'Labor Day', date: '2024-09-02', type: 'holiday', category: 'public', isMultiDay: false },
    { id: 'us-thanksgiving', name: 'Thanksgiving', date: '2024-11-28', endDate: '2024-11-29', type: 'holiday', category: 'public', isMultiDay: true },
    { id: 'us-winter-break', name: 'Winter Break', date: '2024-12-16', endDate: '2025-01-10', type: 'school', category: 'academic', isMultiDay: true },
    { id: 'us-spring-break', name: 'Spring Break', date: '2025-03-10', endDate: '2025-03-14', type: 'school', category: 'academic', isMultiDay: true },
    
    // Exam Periods
    { id: 'us-fall-finals', name: 'Fall Finals', date: '2024-12-09', endDate: '2024-12-13', type: 'exam', category: 'academic', isMultiDay: true },
    { id: 'us-spring-finals', name: 'Spring Finals', date: '2025-05-05', endDate: '2025-05-09', type: 'exam', category: 'academic', isMultiDay: true }
  ],

  AU: [
    // Academic Terms (Australian academic year starts in February)
    { id: 'au-semester1-2024', name: 'Semester 1', date: '2024-02-26', endDate: '2024-06-21', type: 'term', category: 'academic', isMultiDay: true },
    { id: 'au-semester2-2024', name: 'Semester 2', date: '2024-07-22', endDate: '2024-11-15', type: 'term', category: 'academic', isMultiDay: true },
    { id: 'au-semester1-2025', name: 'Semester 1', date: '2025-02-24', endDate: '2025-06-20', type: 'term', category: 'academic', isMultiDay: true },
    
    // Public Holidays
    { id: 'au-anzac-day', name: 'ANZAC Day', date: '2024-04-25', type: 'holiday', category: 'public', isMultiDay: false },
    { id: 'au-queens-birthday', name: "King's Birthday", date: '2024-06-10', type: 'holiday', category: 'public', isMultiDay: false },
    { id: 'au-melbourne-cup', name: 'Melbourne Cup', date: '2024-11-05', type: 'holiday', category: 'public', isMultiDay: false },
    
    // Academic Breaks
    { id: 'au-mid-year-break', name: 'Mid-Year Break', date: '2024-06-24', endDate: '2024-07-19', type: 'school', category: 'academic', isMultiDay: true },
    { id: 'au-summer-break', name: 'Summer Break', date: '2024-11-18', endDate: '2025-02-21', type: 'school', category: 'academic', isMultiDay: true }
  ],

  GB: [
    // Academic Terms (UK academic year starts in October)
    { id: 'gb-autumn-2024', name: 'Autumn Term', date: '2024-10-07', endDate: '2024-12-13', type: 'term', category: 'academic', isMultiDay: true },
    { id: 'gb-spring-2025', name: 'Spring Term', date: '2025-01-13', endDate: '2025-03-21', type: 'term', category: 'academic', isMultiDay: true },
    { id: 'gb-summer-2025', name: 'Summer Term', date: '2025-04-28', endDate: '2025-06-20', type: 'term', category: 'academic', isMultiDay: true },
    
    // Public Holidays
    { id: 'gb-christmas', name: 'Christmas Day', date: '2024-12-25', type: 'holiday', category: 'public', isMultiDay: false },
    { id: 'gb-boxing-day', name: 'Boxing Day', date: '2024-12-26', type: 'holiday', category: 'public', isMultiDay: false },
    { id: 'gb-easter', name: 'Easter Sunday', date: '2025-04-20', type: 'holiday', category: 'public', isMultiDay: false },
    
    // Academic Breaks
    { id: 'gb-christmas-break', name: 'Christmas Break', date: '2024-12-16', endDate: '2025-01-10', type: 'school', category: 'academic', isMultiDay: true },
    { id: 'gb-easter-break', name: 'Easter Break', date: '2025-03-24', endDate: '2025-04-25', type: 'school', category: 'academic', isMultiDay: true }
  ],

  CA: [
    // Academic Terms (Canadian academic year similar to US)
    { id: 'ca-fall-2024', name: 'Fall Term', date: '2024-09-03', endDate: '2024-12-20', type: 'term', category: 'academic', isMultiDay: true },
    { id: 'ca-winter-2025', name: 'Winter Term', date: '2025-01-06', endDate: '2025-04-30', type: 'term', category: 'academic', isMultiDay: true },
    { id: 'ca-summer-2025', name: 'Summer Term', date: '2025-05-05', endDate: '2025-08-29', type: 'term', category: 'academic', isMultiDay: true },
    
    // Public Holidays
    { id: 'ca-thanksgiving', name: 'Thanksgiving', date: '2024-10-14', type: 'holiday', category: 'public', isMultiDay: false },
    { id: 'ca-canada-day', name: 'Canada Day', date: '2024-07-01', type: 'holiday', category: 'public', isMultiDay: false },
    { id: 'ca-victoria-day', name: 'Victoria Day', date: '2024-05-20', type: 'holiday', category: 'public', isMultiDay: false }
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
