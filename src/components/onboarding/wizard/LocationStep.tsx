import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { MapPin, Clock, Info } from "lucide-react";
import { OnboardingData } from "../OnboardingWizard";
import { useCountries, Country } from "@/hooks/useCountries";
import { getTimezonesByRegion, getCurrentTimeInTimezone } from "@/utils/timezoneData";

interface LocationStepProps {
  data: OnboardingData;
  updateData: (updates: Partial<OnboardingData>) => void;
  onNext: () => void;
  onPrev: () => void;
}

// Helper function to detect country from browser locale
const detectCountryFromLocale = (countries: Country[]): Country | null => {
  try {
    const locale = Intl.DateTimeFormat().resolvedOptions().locale;
    const countryCode = locale.split('-')[1]?.toUpperCase();
    
    if (countryCode) {
      return countries.find(c => c.code === countryCode) || null;
    }
    return null;
  } catch {
    return null;
  }
};

// Helper function to detect timezone
const detectTimezone = (): string => {
  try {
    return Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC';
  } catch {
    return 'UTC';
  }
};

export const LocationStep = ({ data, updateData, onNext, onPrev }: LocationStepProps) => {
  const { countries, isLoading: countriesLoading } = useCountries();
  const [isAutoDetecting, setIsAutoDetecting] = useState(true);
  const timezonesByRegion = getTimezonesByRegion();

  // Auto-detect location and timezone on component mount
  useEffect(() => {
    if (!countriesLoading && countries.length > 0 && isAutoDetecting) {
      const detectedCountry = detectCountryFromLocale(countries);
      const detectedTimezone = detectTimezone();

      updateData({
        countryId: detectedCountry?.id || '',
        timezone: detectedTimezone
      });

      setIsAutoDetecting(false);
    }
  }, [countries, countriesLoading, isAutoDetecting, updateData]);

  const selectedCountry = countries.find(c => c.id === data.countryId);
  const canProceed = data.countryId && data.timezone;

  if (countriesLoading) {
    return (
      <div className="space-y-8">
        <div className="text-center">
          <div className="flex justify-center mb-4">
            <div className="w-16 h-16 bg-gradient-to-br from-mint-500 to-blue-600 rounded-2xl flex items-center justify-center shadow-lg">
              <MapPin className="h-8 w-8 text-white" />
            </div>
          </div>
          <h2 className="text-3xl font-bold bg-gradient-to-r from-mint-700 to-blue-700 bg-clip-text text-transparent mb-3">
            Setting up your location...
          </h2>
          <p className="text-lg text-slate-600">
            Please wait while we detect your location and timezone.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="text-center">
        <div className="flex justify-center mb-4">
          <div className="w-16 h-16 bg-gradient-to-br from-mint-500 to-blue-600 rounded-2xl flex items-center justify-center shadow-lg">
            <MapPin className="h-8 w-8 text-white" />
          </div>
        </div>
        <h2 className="text-3xl font-bold bg-gradient-to-r from-mint-700 to-blue-700 bg-clip-text text-transparent mb-3">
          Your Location & Timezone
        </h2>
        <p className="text-lg text-slate-600 max-w-md mx-auto">
          We've auto-detected your location and timezone. Please confirm or adjust them to ensure you receive your daily study digest at 8 AM local time.
        </p>
      </div>

      <div className="bg-blue-50/50 rounded-xl p-4 border border-blue-100">
        <div className="flex items-start gap-3">
          <Info className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
          <div className="text-sm text-blue-800">
            <p className="font-medium mb-1">Why do we need this information?</p>
            <p>Your location and timezone help us send you daily study insights and reminders at the perfect time - 8 AM in your local timezone.</p>
          </div>
        </div>
      </div>

      <div className="bg-mint-50/50 rounded-xl p-6 border border-mint-100">
        <div className="flex items-center gap-3 mb-6">
          <MapPin className="h-5 w-5 text-mint-600" />
          <h3 className="font-semibold text-slate-800">Location Settings</h3>
        </div>
        
        <div className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="country" className="text-sm font-medium text-slate-700 flex items-center gap-2">
              <MapPin className="h-4 w-4 text-mint-600" />
              Country <span className="text-red-500">*</span>
            </Label>
            <Select value={data.countryId} onValueChange={(value) => updateData({ countryId: value })}>
              <SelectTrigger id="country" className="border-mint-200 focus:border-mint-500 focus:ring-mint-500">
                <SelectValue placeholder="Select your country" />
              </SelectTrigger>
              <SelectContent className="max-h-60">
                {countries.map((country) => (
                  <SelectItem key={country.id} value={country.id}>
                    <div className="flex items-center gap-2">
                      {country.flag_url && (
                        <img 
                          src={country.flag_url} 
                          alt={`${country.name} flag`} 
                          className="w-4 h-3 object-cover rounded-sm"
                        />
                      )}
                      <span>{country.name}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {selectedCountry && (
              <p className="text-xs text-slate-500">
                Selected: {selectedCountry.name} ({selectedCountry.code})
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="timezone" className="text-sm font-medium text-slate-700 flex items-center gap-2">
              <Clock className="h-4 w-4 text-mint-600" />
              Timezone <span className="text-red-500">*</span>
            </Label>
            <Select value={data.timezone} onValueChange={(value) => updateData({ timezone: value })}>
              <SelectTrigger id="timezone" className="border-mint-200 focus:border-mint-500 focus:ring-mint-500">
                <SelectValue placeholder="Select your timezone" />
              </SelectTrigger>
              <SelectContent className="max-h-80">
                {Object.entries(timezonesByRegion).map(([region, timezones]) => (
                  <div key={region}>
                    <div className="px-2 py-1.5 text-sm font-semibold text-muted-foreground border-b">
                      {region}
                    </div>
                    {timezones.map((tz) => (
                      <SelectItem key={tz.value} value={tz.value}>
                        <div className="flex flex-col">
                          <span>{tz.label}</span>
                          <span className="text-xs text-muted-foreground">
                            {tz.offset} • Current: {getCurrentTimeInTimezone(tz.value)}
                          </span>
                        </div>
                      </SelectItem>
                    ))}
                  </div>
                ))}
              </SelectContent>
            </Select>
            {data.timezone && (
              <p className="text-xs text-slate-500">
                Current time in {data.timezone}: {getCurrentTimeInTimezone(data.timezone)}
              </p>
            )}
          </div>
        </div>
      </div>

      <div className="flex justify-between">
        <Button
          variant="outline"
          onClick={onPrev}
          className="border-mint-200 text-mint-700 hover:bg-mint-50"
        >
          Back
        </Button>
        <Button
          onClick={onNext}
          disabled={!canProceed}
          className="bg-mint-600 hover:bg-mint-700 px-8"
        >
          Continue
        </Button>
      </div>
    </div>
  );
};