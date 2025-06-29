
interface OpenHolidaysCountry {
  isoCode: string;
  name: Array<{ language: string; text: string }>;
  officialLanguages: string[];
}

interface OpenHolidaysSubdivision {
  isoCode: string;
  shortName: string;
  name: Array<{ language: string; text: string }>;
  category: string;
}

interface OpenHolidaysEvent {
  id: string;
  startDate: string;
  endDate?: string;
  type: 'Public' | 'School' | 'Bank' | 'Optional' | 'Observance';
  nationwide: boolean;
  name: Array<{ language: string; text: string }>;
  subdivisions?: string[];
}

class OpenHolidaysService {
  private readonly baseUrl = 'https://openholidaysapi.org';
  private cache = new Map<string, any>();
  private cacheExpiry = new Map<string, number>();
  private readonly CACHE_DURATION = 60 * 60 * 1000; // 1 hour

  private isCacheValid(key: string): boolean {
    const expiry = this.cacheExpiry.get(key);
    return expiry ? Date.now() < expiry : false;
  }

  private setCache(key: string, data: any): void {
    this.cache.set(key, data);
    this.cacheExpiry.set(key, Date.now() + this.CACHE_DURATION);
  }

  private getCache(key: string): any {
    if (this.isCacheValid(key)) {
      return this.cache.get(key);
    }
    this.cache.delete(key);
    this.cacheExpiry.delete(key);
    return null;
  }

  async getCountries(): Promise<OpenHolidaysCountry[]> {
    const cacheKey = 'countries';
    const cached = this.getCache(cacheKey);
    if (cached) return cached;

    try {
      const response = await fetch(`${this.baseUrl}/Countries`);
      if (!response.ok) throw new Error('Failed to fetch countries');
      
      const data = await response.json();
      this.setCache(cacheKey, data);
      return data;
    } catch (error) {
      console.error('Error fetching countries:', error);
      return [];
    }
  }

  async getSubdivisions(countryCode: string): Promise<OpenHolidaysSubdivision[]> {
    const cacheKey = `subdivisions-${countryCode}`;
    const cached = this.getCache(cacheKey);
    if (cached) return cached;

    try {
      const response = await fetch(`${this.baseUrl}/Subdivisions?countryIsoCode=${countryCode}`);
      if (!response.ok) throw new Error('Failed to fetch subdivisions');
      
      const data = await response.json();
      this.setCache(cacheKey, data);
      return data;
    } catch (error) {
      console.error('Error fetching subdivisions:', error);
      return [];
    }
  }

  async getPublicHolidays(countryCode: string, year: number, subdivisionCode?: string): Promise<OpenHolidaysEvent[]> {
    const cacheKey = `holidays-${countryCode}-${year}-${subdivisionCode || 'nationwide'}`;
    const cached = this.getCache(cacheKey);
    if (cached) return cached;

    try {
      let url = `${this.baseUrl}/PublicHolidays?countryIsoCode=${countryCode}&validFrom=${year}-01-01&validTo=${year}-12-31`;
      if (subdivisionCode) {
        url += `&subdivisionCode=${subdivisionCode}`;
      }

      const response = await fetch(url);
      if (!response.ok) throw new Error('Failed to fetch public holidays');
      
      const data = await response.json();
      this.setCache(cacheKey, data);
      return data;
    } catch (error) {
      console.error('Error fetching public holidays:', error);
      return [];
    }
  }

  async getSchoolHolidays(countryCode: string, year: number, subdivisionCode?: string): Promise<OpenHolidaysEvent[]> {
    const cacheKey = `school-holidays-${countryCode}-${year}-${subdivisionCode || 'nationwide'}`;
    const cached = this.getCache(cacheKey);
    if (cached) return cached;

    try {
      let url = `${this.baseUrl}/SchoolHolidays?countryIsoCode=${countryCode}&validFrom=${year}-01-01&validTo=${year}-12-31`;
      if (subdivisionCode) {
        url += `&subdivisionCode=${subdivisionCode}`;
      }

      const response = await fetch(url);
      if (!response.ok) throw new Error('Failed to fetch school holidays');
      
      const data = await response.json();
      this.setCache(cacheKey, data);
      return data;
    } catch (error) {
      console.error('Error fetching school holidays:', error);
      return [];
    }
  }

  getLocalizedName(nameArray: Array<{ language: string; text: string }>, preferredLanguage = 'EN'): string {
    const preferred = nameArray.find(n => n.language === preferredLanguage);
    return preferred?.text || nameArray[0]?.text || 'Unknown';
  }
}

export const openHolidaysService = new OpenHolidaysService();
export type { OpenHolidaysEvent, OpenHolidaysCountry, OpenHolidaysSubdivision };
