
import { useAcademicCalendar } from '@/hooks/useAcademicCalendar';
import { StandardPageHeader } from '@/components/ui/StandardPageHeader';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { CalendarDays, MapPin, Clock, BookOpen, GraduationCap, Settings } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useRequireAuth } from '@/hooks/useRequireAuth';
import { toast } from 'sonner';

const AcademicCalendarPage = () => {
  const { user } = useRequireAuth();
  const { 
    calendarData, 
    isLoading, 
    currentStatus, 
    upcomingEvents, 
    formatDate,
    countryName,
    institutionType,
    countries,
    userPreferences
  } = useAcademicCalendar();

  const [selectedCountry, setSelectedCountry] = useState(userPreferences?.country_code || 'US');
  const [selectedInstitution, setSelectedInstitution] = useState(userPreferences?.institution_type || 'university');
  const [isUpdating, setIsUpdating] = useState(false);

  const breadcrumbs = [
    { label: "Academic Calendar" }
  ];

  const handleUpdatePreferences = async () => {
    if (!user?.id) return;

    setIsUpdating(true);
    try {
      const { error } = await supabase
        .from('user_academic_preferences')
        .upsert({
          user_id: user.id,
          country_code: selectedCountry,
          institution_type: selectedInstitution,
          updated_at: new Date().toISOString()
        });

      if (error) throw error;

      toast.success('Academic preferences updated successfully');
      // Refresh will happen automatically due to React Query
    } catch (error) {
      console.error('Failed to update preferences:', error);
      toast.error('Failed to update preferences');
    } finally {
      setIsUpdating(false);
    }
  };

  const formatDateRange = (start?: string, end?: string) => {
    if (!start && !end) return '';
    if (start && end) {
      const startDate = new Date(start);
      const endDate = new Date(end);
      return `${startDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - ${endDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`;
    }
    if (start) {
      return new Date(start).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    }
    return '';
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-mint-50/30 via-white to-blue-50/30">
        <StandardPageHeader
          title="Academic Calendar"
          description="View your personalized academic schedule and important dates"
          icon={<CalendarDays className="h-6 w-6 text-white" />}
          breadcrumbs={breadcrumbs}
        />
        
        <div className="container mx-auto px-6 py-8 space-y-6">
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3].map((i) => (
              <Card key={i}>
                <CardHeader>
                  <Skeleton className="h-6 w-32" />
                </CardHeader>
                <CardContent>
                  <Skeleton className="h-20 w-full" />
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-mint-50/30 via-white to-blue-50/30">
      <StandardPageHeader
        title="Academic Calendar"
        description={`Personalized schedule for ${countryName} ${institutionType}s`}
        icon={<CalendarDays className="h-6 w-6 text-white" />}
        breadcrumbs={breadcrumbs}
        actions={
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="text-mint-600 border-mint-200">
              <MapPin className="h-3 w-3 mr-1" />
              {countryName}
            </Badge>
          </div>
        }
      />
      
      <div className="container mx-auto px-6 py-8 space-y-8">
        {/* Settings Section */}
        <Card className="bg-gradient-to-r from-blue-50/50 to-mint-50/50 border-blue-100/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="h-5 w-5 text-blue-600" />
              Calendar Settings
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-3">
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Country</label>
                <Select value={selectedCountry} onValueChange={setSelectedCountry}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {countries.map((country) => (
                      <SelectItem key={country.code} value={country.code}>
                        {country.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Institution Type</label>
                <Select value={selectedInstitution} onValueChange={setSelectedInstitution}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="university">University</SelectItem>
                    <SelectItem value="college">College</SelectItem>
                    <SelectItem value="high_school">High School</SelectItem>
                    <SelectItem value="primary_school">Primary School</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="flex items-end">
                <Button 
                  onClick={handleUpdatePreferences}
                  disabled={isUpdating}
                  className="w-full bg-gradient-to-r from-blue-500 to-mint-500 hover:from-blue-600 hover:to-mint-600"
                >
                  {isUpdating ? 'Updating...' : 'Update Settings'}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Current Status */}
        <Card className="bg-gradient-to-br from-white to-blue-50/30 border-blue-100/50 shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-blue-600" />
              Current Status
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Badge variant="outline" className="text-lg px-4 py-2 bg-blue-50 text-blue-700 border-blue-200">
              {currentStatus}
            </Badge>
          </CardContent>
        </Card>

        {/* Academic Terms */}
        {calendarData?.terms && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <GraduationCap className="h-5 w-5 text-mint-600" />
                Academic Terms
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {calendarData.terms.map((term, index) => (
                  <div key={index} className="p-4 rounded-lg bg-gradient-to-br from-mint-50/50 to-blue-50/50 border border-mint-100/50">
                    <h3 className="font-semibold text-mint-700 mb-2">{term.name}</h3>
                    <p className="text-sm text-gray-600">
                      {formatDateRange(term.start, term.end)}
                    </p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Exam Periods */}
        {calendarData?.exam_periods && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BookOpen className="h-5 w-5 text-red-600" />
                Exam Periods
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {calendarData.exam_periods.map((exam, index) => (
                  <div key={index} className="p-4 rounded-lg bg-gradient-to-br from-red-50/50 to-orange-50/50 border border-red-100/50">
                    <h3 className="font-semibold text-red-700 mb-2">{exam.name}</h3>
                    <p className="text-sm text-gray-600">
                      {formatDateRange(exam.start, exam.end)}
                    </p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Holidays */}
        {calendarData?.holidays && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CalendarDays className="h-5 w-5 text-green-600" />
                Academic Holidays
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {calendarData.holidays.map((holiday, index) => (
                  <div key={index} className="p-4 rounded-lg bg-gradient-to-br from-green-50/50 to-emerald-50/50 border border-green-100/50">
                    <h3 className="font-semibold text-green-700 mb-2">{holiday.name}</h3>
                    <p className="text-sm text-gray-600">
                      {holiday.date ? formatDate(holiday.date) : formatDateRange(holiday.start, holiday.end)}
                    </p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* No Data State */}
        {!calendarData && (
          <Card className="text-center py-12">
            <CardContent>
              <CalendarDays className="h-12 w-12 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-600 mb-2">No Calendar Data Available</h3>
              <p className="text-gray-500 mb-4">
                We don't have academic calendar data for {countryName} {institutionType}s yet.
              </p>
              <Button variant="outline">
                Request Calendar Data
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default AcademicCalendarPage;
