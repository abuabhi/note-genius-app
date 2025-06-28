
interface TimingContext {
  currentHour: number;
  dayOfWeek: number; // 0 = Sunday, 6 = Saturday
  userTimezone: string;
  studyProgress: number;
  lastStudyTime?: Date;
  preferredStudyHours?: number[];
}

interface OptimalTiming {
  shouldNotify: boolean;
  priority: 'low' | 'medium' | 'high';
  delayMinutes: number;
  reason: string;
}

export class NotificationTimingEngine {
  private static readonly OPTIMAL_STUDY_HOURS = {
    morning: [8, 9, 10],
    lunch: [12, 13],
    evening: [17, 18, 19, 20],
    weekend: [10, 11, 14, 15, 16]
  };

  private static readonly QUIET_HOURS = [22, 23, 0, 1, 2, 3, 4, 5, 6, 7];

  static calculateOptimalTiming(context: TimingContext): OptimalTiming {
    const { currentHour, dayOfWeek, studyProgress, lastStudyTime } = context;
    const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
    
    // Never notify during quiet hours
    if (this.QUIET_HOURS.includes(currentHour)) {
      return {
        shouldNotify: false,
        priority: 'low',
        delayMinutes: this.getMinutesUntilNextOptimalTime(currentHour),
        reason: 'Quiet hours - delaying until morning'
      };
    }

    // High priority: User is behind on daily goal and it's evening
    if (studyProgress < 50 && this.OPTIMAL_STUDY_HOURS.evening.includes(currentHour)) {
      return {
        shouldNotify: true,
        priority: 'high',
        delayMinutes: 0,
        reason: 'Behind on daily goal - evening catch-up time'
      };
    }

    // Medium priority: Optimal study times
    const optimalHours = isWeekend 
      ? this.OPTIMAL_STUDY_HOURS.weekend
      : [...this.OPTIMAL_STUDY_HOURS.morning, ...this.OPTIMAL_STUDY_HOURS.lunch, ...this.OPTIMAL_STUDY_HOURS.evening];

    if (optimalHours.includes(currentHour)) {
      return {
        shouldNotify: true,
        priority: 'medium',
        delayMinutes: 0,
        reason: `Optimal study time - ${this.getTimeOfDayLabel(currentHour)}`
      };
    }

    // Low priority: Haven't studied today and it's past lunch
    if (studyProgress === 0 && currentHour > 13) {
      return {
        shouldNotify: true,
        priority: 'low',
        delayMinutes: this.getMinutesUntilNextOptimalTime(currentHour),
        reason: 'Gentle reminder - no study activity today'
      };
    }

    // Default: Don't notify now, wait for optimal time
    return {
      shouldNotify: false,
      priority: 'low',
      delayMinutes: this.getMinutesUntilNextOptimalTime(currentHour),
      reason: 'Waiting for optimal study time'
    };
  }

  private static getTimeOfDayLabel(hour: number): string {
    if (hour >= 8 && hour <= 10) return 'morning productivity';
    if (hour >= 12 && hour <= 13) return 'lunch break learning';
    if (hour >= 17 && hour <= 20) return 'evening focus time';
    return 'study time';
  }

  private static getMinutesUntilNextOptimalTime(currentHour: number): number {
    const allOptimalHours = [
      ...this.OPTIMAL_STUDY_HOURS.morning,
      ...this.OPTIMAL_STUDY_HOURS.lunch,
      ...this.OPTIMAL_STUDY_HOURS.evening
    ].sort((a, b) => a - b);

    // Find next optimal hour
    const nextHour = allOptimalHours.find(hour => hour > currentHour);
    
    if (nextHour) {
      return (nextHour - currentHour) * 60;
    } else {
      // Next optimal time is tomorrow morning
      return (24 - currentHour + 8) * 60;
    }
  }

  static shouldShowBrowserNotification(context: TimingContext): boolean {
    const timing = this.calculateOptimalTiming(context);
    return timing.shouldNotify && timing.priority !== 'low' && 'Notification' in window;
  }

  static getBrowserNotificationPermission(): Promise<NotificationPermission> {
    if (!('Notification' in window)) {
      return Promise.resolve('denied');
    }

    if (Notification.permission === 'default') {
      return Notification.requestPermission();
    }

    return Promise.resolve(Notification.permission);
  }
}
