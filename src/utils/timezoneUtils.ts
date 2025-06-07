
// Enhanced timezone utility functions with proper Intl.DateTimeFormat support

export const getDateInTimezone = (date: Date, timezone: string): Date => {
  // Get the date as it appears in the specified timezone
  const formatter = new Intl.DateTimeFormat('en-CA', {
    timeZone: timezone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false
  });
  
  const parts = formatter.formatToParts(date);
  const year = parseInt(parts.find(p => p.type === 'year')?.value || '0');
  const month = parseInt(parts.find(p => p.type === 'month')?.value || '0') - 1;
  const day = parseInt(parts.find(p => p.type === 'day')?.value || '0');
  const hour = parseInt(parts.find(p => p.type === 'hour')?.value || '0');
  const minute = parseInt(parts.find(p => p.type === 'minute')?.value || '0');
  const second = parseInt(parts.find(p => p.type === 'second')?.value || '0');
  
  return new Date(year, month, day, hour, minute, second);
};

export const getTodayInTimezone = (timezone: string): string => {
  // Get today's date in YYYY-MM-DD format for the specified timezone
  const now = new Date();
  const formatter = new Intl.DateTimeFormat('en-CA', {
    timeZone: timezone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  });
  
  return formatter.format(now);
};

export const getStartOfDayInTimezone = (timezone: string): Date => {
  // Get start of today (00:00:00) in the specified timezone, returned as UTC
  const todayString = getTodayInTimezone(timezone);
  
  // Create a date object in the target timezone at midnight
  const localMidnight = new Date(`${todayString}T00:00:00`);
  
  // Convert to what this represents in UTC
  const utcFormatter = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'UTC',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false
  });
  
  const targetFormatter = new Intl.DateTimeFormat('en-CA', {
    timeZone: timezone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false
  });
  
  // Find the UTC time that represents midnight in the target timezone
  let testDate = new Date();
  testDate.setHours(0, 0, 0, 0);
  
  // Adjust until we find the UTC time that shows as midnight in target timezone
  for (let i = 0; i < 25; i++) { // 25 hours to handle all timezone offsets
    const targetTime = targetFormatter.format(testDate);
    if (targetTime.includes(`${todayString} 00:00:00`)) {
      return testDate;
    }
    testDate = new Date(testDate.getTime() - 60 * 60 * 1000); // Go back 1 hour
  }
  
  // Fallback: create the date directly
  return new Date(`${todayString}T00:00:00Z`);
};

export const getEndOfDayInTimezone = (timezone: string): Date => {
  // Get end of today (23:59:59.999) in the specified timezone, returned as UTC
  const startOfDay = getStartOfDayInTimezone(timezone);
  return new Date(startOfDay.getTime() + 24 * 60 * 60 * 1000 - 1);
};

export const getWeekStartInTimezone = (timezone: string, weeksAgo: number = 0): Date => {
  // Get start of the week (Monday 00:00:00) in the specified timezone
  const today = getTodayInTimezone(timezone);
  const todayDate = new Date(`${today}T00:00:00`);
  
  // Get day of week (0 = Sunday, 1 = Monday, etc.)
  const dayOfWeek = todayDate.getDay();
  const daysToMonday = dayOfWeek === 0 ? 6 : dayOfWeek - 1; // Sunday = 0, so Sunday needs to go back 6 days
  
  const monday = new Date(todayDate);
  monday.setDate(monday.getDate() - daysToMonday - (weeksAgo * 7));
  
  // Convert Monday in target timezone to UTC equivalent
  const mondayString = monday.toISOString().split('T')[0];
  return getStartOfDayInTimezone(timezone);
};

export const isDateInTimezone = (utcDateString: string, targetDate: string, timezone: string): boolean => {
  // Check if a UTC date string falls on a specific date in the given timezone
  const utcDate = new Date(utcDateString);
  const dateInTimezone = getTodayInTimezone(timezone);
  return dateInTimezone === targetDate;
};

// Debug helper for timezone calculations
export const debugTimezone = (timezone: string) => {
  const now = new Date();
  const today = getTodayInTimezone(timezone);
  const startOfDay = getStartOfDayInTimezone(timezone);
  const endOfDay = getEndOfDayInTimezone(timezone);
  
  console.log(`🌏 Timezone Debug for ${timezone}:`, {
    now: now.toISOString(),
    todayInTimezone: today,
    startOfDayUTC: startOfDay.toISOString(),
    endOfDayUTC: endOfDay.toISOString(),
    nowInTimezone: new Intl.DateTimeFormat('en-AU', {
      timeZone: timezone,
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      timeZoneName: 'short'
    }).format(now)
  });
};

// Legacy function for backwards compatibility - now deprecated
export const getTimezoneOffset = (timezone: string): number => {
  console.warn('getTimezoneOffset is deprecated, use timezone-aware date functions instead');
  return 0;
};
