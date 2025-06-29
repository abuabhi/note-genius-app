
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

  private async makeProxyRequest(endpoint: string, params?: Record<string, string>) {
    const url = 'https://zuhcmwujzfddmafozubd.supabase.co/functions/v1/academic-calendar-proxy';
    
    console.log(`OpenHolidays Service - Making proxy request to: ${endpoint}`, params);
    
    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ endpoint, params })
      });

      console.log(`OpenHolidays Service - Proxy response status: ${response.status}`);

      if (!response.ok) {
        const errorText = await response.text();
        console.error(`OpenHolidays Service - Proxy error: ${response.status}`, errorText);
        throw new Error(`Proxy request failed: ${response.status} ${response.statusText}`);
      }

      const result = await response.json();
      console.log('OpenHolidays Service - Proxy result:', result);
      
      if (!result.success) {
        throw new Error(result.error || 'Proxy request failed');
      }
      
      return result.data;
    } catch (error) {
      console.error('OpenHolidays Service - Proxy request error:', error);
      throw error;
    }
  }

  async getCountries(): Promise<OpenHolidaysCountry[]> {
    const cacheKey = 'countries';
    const cached = this.getCache(cacheKey);
    if (cached) {
      console.log('OpenHolidays Service - Using cached countries');
      return cached;
    }

    try {
      const data = await this.makeProxyRequest('Countries');
      this.setCache(cacheKey, data);
      console.log(`OpenHolidays Service - Fetched ${data?.length || 0} countries`);
      return data || [];
    } catch (error) {
      console.error('OpenHolidays Service - Error fetching countries:', error);
      return [];
    }
  }

  async getSubdivisions(countryCode: string): Promise<OpenHolidaysSubdivision[]> {
    const cacheKey = `subdivisions-${countryCode}`;
    const cached = this.getCache(cacheKey);
    if (cached) {
      console.log(`OpenHolidays Service - Using cached subdivisions for ${countryCode}`);
      return cached;
    }

    try {
      const data = await this.makeProxyRequest('Subdivisions', { countryIsoCode: countryCode });
      this.setCache(cacheKey, data);
      console.log(`OpenHolidays Service - Fetched ${data?.length || 0} subdivisions for ${countryCode}`);
      return data || [];
    } catch (error) {
      console.error(`OpenHolidays Service - Error fetching subdivisions for ${countryCode}:`, error);
      return [];
    }
  }

  async getPublicHolidays(countryCode: string, year: number, subdivisionCode?: string): Promise<OpenHolidaysEvent[]> {
    const cacheKey = `holidays-${countryCode}-${year}-${subdivisionCode || 'nationwide'}`;
    const cached = this.getCache(cacheKey);
    if (cached) {
      console.log(`OpenHolidays Service - Using cached public holidays for ${countryCode} ${year}`);
      return cached;
    }

    try {
      const params: Record<string, string> = {
        countryIsoCode: countryCode,
        validFrom: `${year}-01-01`,
        validTo: `${year}-12-31`
      };
      
      if (subdivisionCode) {
        params.subdivisionCode = subdivisionCode;
      }

      const data = await this.makeProxyRequest('PublicHolidays', params);
      this.setCache(cacheKey, data);
      console.log(`OpenHolidays Service - Fetched ${data?.length || 0} public holidays for ${countryCode} ${year}`);
      return data || [];
    } catch (error) {
      console.error(`OpenHolidays Service - Error fetching public holidays for ${countryCode} ${year}:`, error);
      return [];
    }
  }

  async getSchoolHolidays(countryCode: string, year: number, subdivisionCode?: string): Promise<OpenHolidaysEvent[]> {
    const cacheKey = `school-holidays-${countryCode}-${year}-${subdivisionCode || 'nationwide'}`;
    const cached = this.getCache(cacheKey);
    if (cached) {
      console.log(`OpenHolidays Service - Using cached school holidays for ${countryCode} ${year}`);
      return cached;
    }

    try {
      const params: Record<string, string> = {
        countryIsoCode: countryCode,
        validFrom: `${year}-01-01`,
        validTo: `${year}-12-31`
      };
      
      if (subdivisionCode) {
        params.subdivisionCode = subdivisionCode;
      }

      const data = await this.makeProxyRequest('SchoolHolidays', params);
      this.setCache(cacheKey, data);
      console.log(`OpenHolidays Service - Fetched ${data?.length || 0} school holidays for ${countryCode} ${year}`);
      return data || [];
    } catch (error) {
      console.error(`OpenHolidays Service - Error fetching school holidays for ${countryCode} ${year}:`, error);
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
