
import { GlobalSessionState } from './types';
import { logger } from '@/config/environment';

const MAX_DAILY_STUDY_TIME = 12 * 60 * 60; // 12 hours max per day
const MAX_SESSION_DURATION = 4 * 60 * 60; // 4 hours max per session
const MIN_SESSION_DURATION = 60; // 1 minute minimum

export const validateSessionDuration = (duration: number): number => {
  if (duration < MIN_SESSION_DURATION) {
    logger.warn(`Session duration too short: ${duration}s, setting to minimum`);
    return MIN_SESSION_DURATION;
  }
  
  if (duration > MAX_SESSION_DURATION) {
    logger.warn(`Session duration too long: ${duration}s, capping to maximum`);
    return MAX_SESSION_DURATION;
  }
  
  return duration;
};

export const validateSessionState = (state: GlobalSessionState): boolean => {
  if (!state.sessionId || !state.startTime) {
    return false;
  }
  
  const now = new Date();
  const elapsedTime = Math.floor((now.getTime() - state.startTime.getTime()) / 1000); // startTime is now Date
  
  // Session has been running too long
  if (elapsedTime > MAX_SESSION_DURATION) {
    logger.warn(`Session ${state.sessionId} has been running too long: ${elapsedTime}s`);
    return false;
  }
  
  return true;
};

export const sanitizeAnalyticsData = (data: any) => {
  if (!data) return data;
  
  // Cap unrealistic study times
  if (data.todayStudyTimeMinutes && data.todayStudyTimeMinutes > (MAX_DAILY_STUDY_TIME / 60)) {
    logger.warn(`Today's study time seems unrealistic: ${data.todayStudyTimeMinutes} minutes`);
    data.todayStudyTimeMinutes = Math.min(data.todayStudyTimeMinutes, MAX_DAILY_STUDY_TIME / 60);
  }
  
  if (data.totalStudyTimeMinutes && data.totalStudyTimeMinutes < 0) {
    data.totalStudyTimeMinutes = 0;
  }
  
  return data;
};
