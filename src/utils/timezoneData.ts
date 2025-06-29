
// Comprehensive timezone data with proper labels and regional grouping
export interface TimezoneOption {
  value: string;
  label: string;
  region: string;
  offset?: string;
}

export const TIMEZONE_REGIONS = {
  AMERICAS: 'Americas',
  EUROPE: 'Europe & Africa',
  ASIA_PACIFIC: 'Asia & Pacific',
  AUSTRALIA: 'Australia & New Zealand'
} as const;

export const COMPREHENSIVE_TIMEZONES: TimezoneOption[] = [
  // Americas
  {
    value: 'America/New_York',
    label: 'Eastern Time (EST/EDT) - New York',
    region: TIMEZONE_REGIONS.AMERICAS,
    offset: 'UTC-5/-4'
  },
  {
    value: 'America/Chicago',
    label: 'Central Time (CST/CDT) - Chicago',
    region: TIMEZONE_REGIONS.AMERICAS,
    offset: 'UTC-6/-5'
  },
  {
    value: 'America/Denver',
    label: 'Mountain Time (MST/MDT) - Denver',
    region: TIMEZONE_REGIONS.AMERICAS,
    offset: 'UTC-7/-6'
  },
  {
    value: 'America/Los_Angeles',
    label: 'Pacific Time (PST/PDT) - Los Angeles',
    region: TIMEZONE_REGIONS.AMERICAS,
    offset: 'UTC-8/-7'
  },
  {
    value: 'America/Phoenix',
    label: 'Mountain Standard Time (MST) - Phoenix',
    region: TIMEZONE_REGIONS.AMERICAS,
    offset: 'UTC-7'
  },
  {
    value: 'America/Anchorage',
    label: 'Alaska Time (AKST/AKDT) - Anchorage',
    region: TIMEZONE_REGIONS.AMERICAS,
    offset: 'UTC-9/-8'
  },
  {
    value: 'Pacific/Honolulu',
    label: 'Hawaii Time (HST) - Honolulu',
    region: TIMEZONE_REGIONS.AMERICAS,
    offset: 'UTC-10'
  },
  {
    value: 'America/Toronto',
    label: 'Eastern Time (EST/EDT) - Toronto',
    region: TIMEZONE_REGIONS.AMERICAS,
    offset: 'UTC-5/-4'
  },
  {
    value: 'America/Vancouver',
    label: 'Pacific Time (PST/PDT) - Vancouver',
    region: TIMEZONE_REGIONS.AMERICAS,
    offset: 'UTC-8/-7'
  },
  {
    value: 'America/Mexico_City',
    label: 'Central Time (CST/CDT) - Mexico City',
    region: TIMEZONE_REGIONS.AMERICAS,
    offset: 'UTC-6/-5'
  },
  {
    value: 'America/Sao_Paulo',
    label: 'Brasília Time (BRT/BRST) - São Paulo',
    region: TIMEZONE_REGIONS.AMERICAS,
    offset: 'UTC-3/-2'
  },
  {
    value: 'America/Argentina/Buenos_Aires',
    label: 'Argentina Time (ART) - Buenos Aires',
    region: TIMEZONE_REGIONS.AMERICAS,
    offset: 'UTC-3'
  },

  // Europe & Africa
  {
    value: 'UTC',
    label: 'Coordinated Universal Time (UTC)',
    region: TIMEZONE_REGIONS.EUROPE,
    offset: 'UTC+0'
  },
  {
    value: 'Europe/London',
    label: 'Greenwich Mean Time (GMT/BST) - London',
    region: TIMEZONE_REGIONS.EUROPE,
    offset: 'UTC+0/+1'
  },
  {
    value: 'Europe/Paris',
    label: 'Central European Time (CET/CEST) - Paris',
    region: TIMEZONE_REGIONS.EUROPE,
    offset: 'UTC+1/+2'
  },
  {
    value: 'Europe/Berlin',
    label: 'Central European Time (CET/CEST) - Berlin',
    region: TIMEZONE_REGIONS.EUROPE,
    offset: 'UTC+1/+2'
  },
  {
    value: 'Europe/Rome',
    label: 'Central European Time (CET/CEST) - Rome',
    region: TIMEZONE_REGIONS.EUROPE,
    offset: 'UTC+1/+2'
  },
  {
    value: 'Europe/Madrid',
    label: 'Central European Time (CET/CEST) - Madrid',
    region: TIMEZONE_REGIONS.EUROPE,
    offset: 'UTC+1/+2'
  },
  {
    value: 'Europe/Amsterdam',
    label: 'Central European Time (CET/CEST) - Amsterdam',
    region: TIMEZONE_REGIONS.EUROPE,
    offset: 'UTC+1/+2'
  },
  {
    value: 'Europe/Zurich',
    label: 'Central European Time (CET/CEST) - Zurich',
    region: TIMEZONE_REGIONS.EUROPE,
    offset: 'UTC+1/+2'
  },
  {
    value: 'Europe/Stockholm',
    label: 'Central European Time (CET/CEST) - Stockholm',
    region: TIMEZONE_REGIONS.EUROPE,
    offset: 'UTC+1/+2'
  },
  {
    value: 'Europe/Helsinki',
    label: 'Eastern European Time (EET/EEST) - Helsinki',
    region: TIMEZONE_REGIONS.EUROPE,
    offset: 'UTC+2/+3'
  },
  {
    value: 'Europe/Moscow',
    label: 'Moscow Standard Time (MSK) - Moscow',
    region: TIMEZONE_REGIONS.EUROPE,
    offset: 'UTC+3'
  },
  {
    value: 'Africa/Cairo',
    label: 'Eastern European Time (EET) - Cairo',
    region: TIMEZONE_REGIONS.EUROPE,
    offset: 'UTC+2'
  },
  {
    value: 'Africa/Johannesburg',
    label: 'South Africa Standard Time (SAST) - Johannesburg',
    region: TIMEZONE_REGIONS.EUROPE,
    offset: 'UTC+2'
  },

  // Asia & Pacific
  {
    value: 'Asia/Dubai',
    label: 'Gulf Standard Time (GST) - Dubai',
    region: TIMEZONE_REGIONS.ASIA_PACIFIC,
    offset: 'UTC+4'
  },
  {
    value: 'Asia/Kolkata',
    label: 'India Standard Time (IST) - Mumbai/Delhi',
    region: TIMEZONE_REGIONS.ASIA_PACIFIC,
    offset: 'UTC+5:30'
  },
  {
    value: 'Asia/Dhaka',
    label: 'Bangladesh Standard Time (BST) - Dhaka',
    region: TIMEZONE_REGIONS.ASIA_PACIFIC,
    offset: 'UTC+6'
  },
  {
    value: 'Asia/Bangkok',
    label: 'Indochina Time (ICT) - Bangkok',
    region: TIMEZONE_REGIONS.ASIA_PACIFIC,
    offset: 'UTC+7'
  },
  {
    value: 'Asia/Singapore',
    label: 'Singapore Standard Time (SGT) - Singapore',
    region: TIMEZONE_REGIONS.ASIA_PACIFIC,
    offset: 'UTC+8'
  },
  {
    value: 'Asia/Hong_Kong',
    label: 'Hong Kong Time (HKT) - Hong Kong',
    region: TIMEZONE_REGIONS.ASIA_PACIFIC,
    offset: 'UTC+8'
  },
  {
    value: 'Asia/Shanghai',
    label: 'China Standard Time (CST) - Shanghai/Beijing',
    region: TIMEZONE_REGIONS.ASIA_PACIFIC,
    offset: 'UTC+8'
  },
  {
    value: 'Asia/Taipei',
    label: 'Taipei Standard Time (TST) - Taipei',
    region: TIMEZONE_REGIONS.ASIA_PACIFIC,
    offset: 'UTC+8'
  },
  {
    value: 'Asia/Tokyo',
    label: 'Japan Standard Time (JST) - Tokyo',
    region: TIMEZONE_REGIONS.ASIA_PACIFIC,
    offset: 'UTC+9'
  },
  {
    value: 'Asia/Seoul',
    label: 'Korea Standard Time (KST) - Seoul',
    region: TIMEZONE_REGIONS.ASIA_PACIFIC,
    offset: 'UTC+9'
  },

  // Australia & New Zealand
  {
    value: 'Australia/Perth',
    label: 'Australian Western Standard Time (AWST) - Perth',
    region: TIMEZONE_REGIONS.AUSTRALIA,
    offset: 'UTC+8'
  },
  {
    value: 'Australia/Adelaide',
    label: 'Australian Central Standard Time (ACST/ACDT) - Adelaide',
    region: TIMEZONE_REGIONS.AUSTRALIA,
    offset: 'UTC+9:30/+10:30'
  },
  {
    value: 'Australia/Darwin',
    label: 'Australian Central Standard Time (ACST) - Darwin',
    region: TIMEZONE_REGIONS.AUSTRALIA,
    offset: 'UTC+9:30'
  },
  {
    value: 'Australia/Brisbane',
    label: 'Australian Eastern Standard Time (AEST) - Brisbane',
    region: TIMEZONE_REGIONS.AUSTRALIA,
    offset: 'UTC+10'
  },
  {
    value: 'Australia/Sydney',
    label: 'Australian Eastern Standard Time (AEST/AEDT) - Sydney',
    region: TIMEZONE_REGIONS.AUSTRALIA,
    offset: 'UTC+10/+11'
  },
  {
    value: 'Australia/Melbourne',
    label: 'Australian Eastern Standard Time (AEST/AEDT) - Melbourne',
    region: TIMEZONE_REGIONS.AUSTRALIA,
    offset: 'UTC+10/+11'
  },
  {
    value: 'Australia/Hobart',
    label: 'Australian Eastern Standard Time (AEST/AEDT) - Hobart',
    region: TIMEZONE_REGIONS.AUSTRALIA,
    offset: 'UTC+10/+11'
  },
  {
    value: 'Pacific/Auckland',
    label: 'New Zealand Standard Time (NZST/NZDT) - Auckland',
    region: TIMEZONE_REGIONS.AUSTRALIA,
    offset: 'UTC+12/+13'
  },
  {
    value: 'Pacific/Fiji',
    label: 'Fiji Time (FJT) - Suva',
    region: TIMEZONE_REGIONS.AUSTRALIA,
    offset: 'UTC+12'
  }
];

// Helper function to get timezones grouped by region
export const getTimezonesByRegion = () => {
  const grouped: Record<string, TimezoneOption[]> = {};
  
  COMPREHENSIVE_TIMEZONES.forEach(timezone => {
    if (!grouped[timezone.region]) {
      grouped[timezone.region] = [];
    }
    grouped[timezone.region].push(timezone);
  });
  
  return grouped;
};

// Helper function to find timezone by value
export const findTimezoneByValue = (value: string): TimezoneOption | undefined => {
  return COMPREHENSIVE_TIMEZONES.find(tz => tz.value === value);
};

// Helper function to get current time in a timezone
export const getCurrentTimeInTimezone = (timezone: string): string => {
  try {
    return new Date().toLocaleString(undefined, { 
      timeZone: timezone, 
      hour12: true,
      year: 'numeric', 
      month: 'short', 
      day: 'numeric',
      hour: '2-digit', 
      minute: '2-digit'
    });
  } catch (error) {
    return 'Invalid timezone';
  }
};
