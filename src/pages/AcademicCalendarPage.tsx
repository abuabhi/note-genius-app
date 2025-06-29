
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar, MapPin, Settings, Download, Clock, BookOpen, GraduationCap } from 'lucide-react';
import { useAcademicCalendar } from '@/hooks/useAcademicCalendar';
import { StandardPageHeader } from '@/components/ui/StandardPageHeader';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { useRequireAuth } from '@/hooks/useRequireAuth';
import { toast } from 'sonner';

const AcademicCalendarPage = () => {
  const { user } = useRequireAuth();
  const { 
    userPreferences, 
    calendarData, 
    isLoading, 
    currentStatus,
    countryCode,
    institutionType
  } = useAcademicCalendar();

  const [selectedCountry, setSelectedCountry] = useState(userPreferences?.country_code || 'US');
  const [selectedInstitution, setSelectedInstitution] = useState(userPreferences?.institution_type || 'university');

  const breadcrumbs = [
    { label: "Academic Calendar" }
  ];

  const handleSavePreferences = async () => {
    if (!user?.id) return;

    try {
      const { error } = await supabase
        .from('user_academic_preferences')
        .upsert({
          user_id: user.id,
          country_code: selectedCountry,
          institution_type: selectedInstitution,
        }, {
          onConflict: 'user_id'
        });

      if (error) throw error;
      toast.success('Academic calendar preferences saved!');
    } catch (error) {
      console.error('Error saving preferences:', error);
      toast.error('Failed to save preferences');
    }
  };

  const formatDateRange = (start: string, end: string) => {
    const startDate = new Date(start);
    const endDate = new Date(end);
    return `${startDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - ${endDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`;
  };

  const formatSingleDate = (date: string) => {
    return new Date(date).toLocaleDateString('en-US', { 
      weekday: 'long',
      month: 'long', 
      day: 'numeric', 
      year: 'numeric' 
    });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-mint-50/30 via-white to-blue-50/30">
        <StandardPageHeader
          title="Academic Calendar"
          description="View your academic year schedule, holidays, and important dates"
          icon={<Calendar className="h-6 w-6 text-white" />}
          breadcrumbs={breadcrumbs}
        />
        
        <div className="container mx-auto px-6 py-8">
          <div className="grid gap-6 lg:grid-cols-3">
            <div className="lg:col-span-2 space-y-6">
              <Skeleton className="h-64 w-full" />
              <Skeleton className="h-48 w-full" />
            </div>
            <div className="space-y-6">
              <Skeleton className="h-48 w-full" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-mint-50/30 via-white to-blue-50/30">
      <StandardPageHeader
        title="Academic Calendar"
        description="View your academic year schedule, holidays, and important dates"
        icon={<Calendar className="h-6 w-6 text-white" />}
        breadcrumbs={breadcrumbs}
      />
      
      <div className="container mx-auto px-6 py-8">
        <div className="grid gap-6 lg:grid-cols-3">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Current Status Card */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="h-5 w-5 text-mint-600" />
                  Current Status
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-3">
                  <Badge variant="secondary" className="bg-mint-100 text-mint-700 px-3 py-1">
                    {currentStatus}
                  </Badge>
                  <span className="text-sm text-muted-foreground">
                    {countryCode} • {institutionType}
                  </span>
                </div>
              </CardContent>
            </Card>

            {/* Terms/Semesters */}
            {calendarData?.terms && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BookOpen className="h-5 w-5 text-blue-600" />
                    Academic Terms
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {calendarData.terms.map((term, index) => (
                      <div key={index} className="flex justify-between items-center p-3 bg-blue-50 rounded-lg">
                        <div>
                          <h4 className="font-medium text-blue-900">{term.name}</h4>
                          {term.start && term.end && (
                            <p className="text-sm text-blue-700">
                              {formatDateRange(term.start, term.end)}
                            </p>
                          )}
                        </div>
                        <Badge variant="outline" className="border-blue-200 text-blue-700">
                          Term
                        </Badge>
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
                    <Calendar className="h-5 w-5 text-green-600" />
                    Holidays & Breaks
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {calendarData.holidays.map((holiday, index) => (
                      <div key={index} className="flex justify-between items-center p-3 bg-green-50 rounded-lg">
                        <div>
                          <h4 className="font-medium text-green-900">{holiday.name}</h4>
                          <p className="text-sm text-green-700">
                            {holiday.date ? formatSingleDate(holiday.date) : 
                             holiday.start && holiday.end ? formatDateRange(holiday.start, holiday.end) : ''}
                          </p>
                        </div>
                        <Badge variant="outline" className="border-green-200 text-green-700">
                          Holiday
                        </Badge>
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
                    <GraduationCap className="h-5 w-5 text-purple-600" />
                    Exam Periods
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {calendarData.exam_periods.map((exam, index) => (
                      <div key={index} className="flex justify-between items-center p-3 bg-purple-50 rounded-lg">
                        <div>
                          <h4 className="font-medium text-purple-900">{exam.name}</h4>
                          {exam.start && exam.end && (
                            <p className="text-sm text-purple-700">
                              {formatDateRange(exam.start, exam.end)}
                            </p>
                          )}
                        </div>
                        <Badge variant="outline" className="border-purple-200 text-purple-700">
                          Exams
                        </Badge>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Settings */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Settings className="h-5 w-5" />
                  Calendar Settings
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Country</label>
                  <Select value={selectedCountry} onValueChange={setSelectedCountry}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="US">United States</SelectItem>
                      <SelectItem value="GB">United Kingdom</SelectItem>
                      <SelectItem value="CA">Canada</SelectItem>
                      <SelectItem value="AU">Australia</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Institution Type</label>
                  <Select value={selectedInstitution} onValueChange={setSelectedInstitution}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="university">University</SelectItem>
                      <SelectItem value="college">College</SelectItem>
                      <SelectItem value="high_school">High School</SelectItem>
                      <SelectItem value="k12">K-12 School</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <Button onClick={handleSavePreferences} className="w-full">
                  Save Preferences
                </Button>
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button variant="outline" className="w-full justify-start">
                  <Download className="h-4 w-4 mr-2" />
                  Export Calendar
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <Calendar className="h-4 w-4 mr-2" />
                  Add to Google Calendar
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <MapPin className="h-4 w-4 mr-2" />
                  Change Location
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AcademicCalendarPage;
