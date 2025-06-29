
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Calendar } from '@/components/ui/calendar';
import { CalendarDays, GraduationCap, MapPin, Settings, Download, Filter } from 'lucide-react';
import { useOpenHolidaysCalendar } from '@/hooks/useOpenHolidaysCalendar';
import { useState } from 'react';

const AcademicCalendarPage = () => {
  const { 
    events, 
    academicProgress,
    formatDate, 
    countryCode,
    getCountryName,
    isLoading 
  } = useOpenHolidaysCalendar();
  
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [filter, setFilter] = useState<'all' | 'academic' | 'public'>('all');

  const filteredEvents = events.filter(event => {
    if (filter === 'all') return true;
    return event.category === filter;
  });

  const getEventDates = () => {
    return events.map(event => new Date(event.date));
  };

  const getEventsForDate = (date: Date) => {
    const dateStr = date.toISOString().split('T')[0];
    return events.filter(event => 
      event.date === dateStr || 
      (event.endDate && dateStr >= event.date && dateStr <= event.endDate)
    );
  };

  if (isLoading) {
    return (
      <div className="container mx-auto p-6">
        <div className="space-y-6">
          <div className="text-center">
            <h1 className="text-3xl font-bold">Loading Academic Calendar...</h1>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-gradient-to-br from-purple-600 to-amber-500 rounded-2xl shadow-lg">
            <GraduationCap className="h-8 w-8 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-700 to-amber-600 bg-clip-text text-transparent">
              Academic Calendar
            </h1>
            <div className="flex items-center gap-2 text-gray-600 mt-1">
              <MapPin className="h-4 w-4" />
              <span>{countryCode}</span>
              <span>•</span>
              <span>{events.length} events loaded</span>
            </div>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm">
            <Settings className="h-4 w-4 mr-2" />
            Settings
          </Button>
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* Progress Overview */}
      <Card className="bg-gradient-to-r from-purple-50 to-amber-50 border-purple-200">
        <CardHeader>
          <CardTitle className="text-lg text-purple-700">Academic Year Progress</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-700">{academicProgress.yearProgress}%</div>
              <div className="text-sm text-gray-600">Year Complete</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-amber-600">{academicProgress.daysUntilNext}</div>
              <div className="text-sm text-gray-600">Days Until Next Event</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-semibold text-emerald-600">{academicProgress.currentPeriod}</div>
              <div className="text-sm text-gray-600">Current Period</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Calendar */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <CalendarDays className="h-5 w-5" />
                Calendar View
              </CardTitle>
              <div className="flex gap-2">
                <Button
                  variant={filter === 'all' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setFilter('all')}
                >
                  All
                </Button>
                <Button
                  variant={filter === 'academic' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setFilter('academic')}
                >
                  Academic
                </Button>
                <Button
                  variant={filter === 'public' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setFilter('public')}
                >
                  Public
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <Calendar
              mode="single"
              selected={selectedDate}
              onSelect={setSelectedDate}
              className="rounded-md border"
              modifiers={{
                eventDay: getEventDates()
              }}
              modifiersStyles={{
                eventDay: { 
                  backgroundColor: '#fbbf24', 
                  color: 'white',
                  fontWeight: 'bold'
                }
              }}
            />
          </CardContent>
        </Card>

        {/* Events List */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle>
              {selectedDate ? 
                `Events for ${selectedDate.toLocaleDateString()}` : 
                'Upcoming Events'
              }
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {selectedDate ? (
                getEventsForDate(selectedDate).length > 0 ? (
                  getEventsForDate(selectedDate).map((event, index) => (
                    <div key={index} className="p-3 rounded-lg border bg-white/50 hover:bg-white/80 transition-colors">
                      <div className="font-medium text-sm">{event.name}</div>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge 
                          variant="outline" 
                          className={`text-xs ${
                            event.category === 'public' ? 'text-emerald-600 border-emerald-200' : 
                            'text-purple-600 border-purple-200'
                          }`}
                        >
                          {event.category}
                        </Badge>
                        {event.isMultiDay && (
                          <Badge variant="outline" className="text-xs">
                            Multi-day
                          </Badge>
                        )}
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-4 text-gray-500">
                    No events on this date
                  </div>
                )
              ) : (
                filteredEvents.slice(0, 10).map((event, index) => (
                  <div key={index} className="p-3 rounded-lg border bg-white/50 hover:bg-white/80 transition-colors">
                    <div className="font-medium text-sm">{event.name}</div>
                    <div className="flex items-center justify-between mt-1">
                      <Badge 
                        variant="outline" 
                        className={`text-xs ${
                          event.category === 'public' ? 'text-emerald-600 border-emerald-200' : 
                          'text-purple-600 border-purple-200'
                        }`}
                      >
                        {event.category}
                      </Badge>
                      <span className="text-xs text-gray-600">
                        {formatDate(event.date)}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AcademicCalendarPage;
