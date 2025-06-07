
// Utility functions for timezone-aware date calculations

export const getDateInTimezone = (date: Date, timezone: string): Date => {
  // Convert a date to the specified timezone
  const utc = date.getTime() + (date.getTimezoneOffset() * 60000);
  return new Date(utc + getTimezoneOffset(timezone) * 60000);
};

export const getTimezoneOffset = (timezone: string): number => {
  // Get timezone offset in minutes
  const now = new Date();
  const utcDate = new Date(now.toLocaleString("en-US", { timeZone: "UTC" }));
  const timezoneDate = new Date(now.toLocaleString("en-US", { timeZone: timezone }));
  return (timezoneDate.getTime() - utcDate.getTime()) / (1000 * 60);
};

export const getTodayInTimezone = (timezone: string): string => {
  // Get today's date in YYYY-MM-DD format for the specified timezone
  const now = new Date();
  const todayInTimezone = new Date(now.toLocaleString("en-US", { timeZone: timezone }));
  return todayInTimezone.toISOString().split('T')[0];
};

export const getStartOfDayInTimezone = (timezone: string): Date => {
  // Get start of today (00:00:00) in the specified timezone, returned as UTC
  const today = getTodayInTimezone(timezone);
  const startOfDay = new Date(`${today}T00:00:00`);
  
  // Convert to UTC by subtracting the timezone offset
  const offset = getTimezoneOffset(timezone);
  return new Date(startOfDay.getTime() - offset * 60000);
};

export const getEndOfDayInTimezone = (timezone: string): Date => {
  // Get end of today (23:59:59) in the specified timezone, returned as UTC
  const today = getTodayInTimezone(timezone);
  const endOfDay = new Date(`${today}T23:59:59.999`);
  
  // Convert to UTC by subtracting the timezone offset
  const offset = getTimezoneOffset(timezone);
  return new Date(endOfDay.getTime() - offset * 60000);
};

export const getWeekStartInTimezone = (timezone: string, weeksAgo: number = 0): Date => {
  // Get start of the week (Monday 00:00:00) in the specified timezone
  const today = new Date();
  const todayInTimezone = new Date(today.toLocaleString("en-US", { timeZone: timezone }));
  
  // Get Monday of current week
  const dayOfWeek = todayInTimezone.getDay();
  const daysToMonday = dayOfWeek === 0 ? 6 : dayOfWeek - 1; // Sunday = 0, so Sunday needs to go back 6 days
  
  const monday = new Date(todayInTimezone);
  monday.setDate(monday.getDate() - daysToMonday - (weeksAgo * 7));
  monday.setHours(0, 0, 0, 0);
  
  // Convert to UTC
  const offset = getTimezoneOffset(timezone);
  return new Date(monday.getTime() - offset * 60000);
};

export const isDateInTimezone = (dateString: string, targetDate: string, timezone: string): boolean => {
  // Check if a UTC date string falls on a specific date in the given timezone
  const date = new Date(dateString);
  const dateInTimezone = new Date(date.toLocaleString("en-US", { timeZone: timezone }));
  const dateInTimezoneString = dateInTimezone.toISOString().split('T')[0];
  return dateInTimezoneString === targetDate;
};
