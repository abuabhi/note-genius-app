
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Calendar, MapPin, Clock, ExternalLink, GraduationCap, BookOpen, CalendarDays, Timer, TrendingUp } from 'lucide-react';
import { useOpenHolidaysCalendar } from '@/hooks/useOpenHolidaysCalendar';
import { useNavigate } from 'react-router-dom';
import { Skeleton } from '@/components/ui/skeleton';

export const AcademicCalendarWidget = () => {
  const navigate = useNavigate();
  const { 
    upcomingEvents, 
    academicProgress,
    formatDate, 
    countryCode,
    getCountryName,
    isLoading 
  } = useOpenHolidaysCalendar();

  const handleViewFullCalendar = () => {
    navigate('/academic-calendar');
  };

  if (isLoading) {
    return (
      <Card className="h-full bg-gradient-to-br from-purple-900/5 via-amber-50/30 to-emerald-50/20 border-purple-200/40 shadow-xl">
        <CardHeader className="pb-4">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-gradient-to-br from-purple-600 to-amber-500 rounded-2xl shadow-lg">
              <GraduationCap className="h-6 w-6 text-white" />
            </div>
            <div>
              <CardTitle className="text-lg font-bold bg-gradient-to-r from-purple-700 to-amber-600 bg-clip-text text-transparent">
                Academic Calendar
              </CardTitle>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-16 w-full" />
          <Skeleton className="h-20 w-full" />
        </CardContent>
      </Card>
    );
  }

  const getEventIcon = (type: string) => {
    switch (type) {
      case 'exam': return <BookOpen className="h-3.5 w-3.5" />;
      case 'term': return <GraduationCap className="h-3.5 w-3.5" />;
      case 'school': return <CalendarDays className="h-3.5 w-3.5" />;
      default: return <Calendar className="h-3.5 w-3.5" />;
    }
  };

  const getEventColor = (type: string, category: string) => {
    if (category === 'public') return 'text-emerald-600 bg-emerald-50 border-emerald-200';
    switch (type) {
      case 'exam': return 'text-red-600 bg-red-50 border-red-200';
      case 'term': return 'text-purple-600 bg-purple-50 border-purple-200';
      case 'school': return 'text-amber-600 bg-amber-50 border-amber-200';
      default: return 'text-blue-600 bg-blue-50 border-blue-200';
    }
  };

  const progressColor = academicProgress.periodProgress > 75 ? 'bg-red-500' : 
                      academicProgress.periodProgress > 50 ? 'bg-amber-500' : 'bg-emerald-500';

  return (
    <Card className="h-full bg-gradient-to-br from-purple-900/5 via-amber-50/30 to-emerald-50/20 border-purple-200/40 shadow-xl hover:shadow-2xl transition-all duration-300 group relative overflow-hidden">
      {/* Decorative academic-themed background pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute top-4 right-4 text-6xl">🎓</div>
        <div className="absolute bottom-4 left-4 text-4xl">📚</div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-8xl opacity-30">📅</div>
      </div>

      <CardHeader className="pb-4 relative z-10">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-gradient-to-br from-purple-600 to-amber-500 rounded-2xl shadow-lg group-hover:shadow-xl transition-all duration-300 group-hover:scale-105">
              <GraduationCap className="h-6 w-6 text-white" />
            </div>
            <div>
              <CardTitle className="text-lg font-bold bg-gradient-to-r from-purple-700 to-amber-600 bg-clip-text text-transparent">
                Academic Calendar
              </CardTitle>
              <div className="flex items-center gap-1.5 text-xs text-purple-600/70 mt-0.5">
                <MapPin className="h-3 w-3" />
                <span>{countryCode}</span>
              </div>
            </div>
          </div>
          {academicProgress.nextEvent && (
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-700">{academicProgress.daysUntilNext}</div>
              <div className="text-xs text-purple-600">days left</div>
            </div>
          )}
        </div>
      </CardHeader>

      <CardContent className="space-y-5 relative z-10">
        {/* Academic Progress Section */}
        <div className="space-y-3 p-4 rounded-xl bg-gradient-to-r from-purple-50 to-amber-50 border border-purple-200/50">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-purple-600" />
              <span className="text-sm font-semibold text-purple-700">Academic Year Progress</span>
            </div>
            <span className="text-sm font-bold text-purple-700">{academicProgress.yearProgress}%</span>
          </div>
          <div className="w-full bg-purple-200 rounded-full h-2.5">
            <div 
              className="bg-gradient-to-r from-purple-500 to-amber-500 h-2.5 rounded-full transition-all duration-500" 
              style={{ width: `${academicProgress.yearProgress}%` }}
            />
          </div>
        </div>

        {/* Current Status */}
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4 text-amber-600" />
            <span className="text-sm font-semibold text-gray-700">Current Period</span>
          </div>
          <div className="flex items-center gap-3">
            <Badge className="bg-gradient-to-r from-purple-600 to-amber-600 text-white font-medium shadow-md">
              {academicProgress.currentPeriod}
            </Badge>
            {academicProgress.nextEvent && (
              <div className="flex items-center gap-1 text-xs text-gray-600">
                <Timer className="h-3 w-3" />
                <span>Next: {academicProgress.nextEvent.name}</span>
              </div>
            )}
          </div>
        </div>

        {/* Upcoming Events */}
        {upcomingEvents.length > 0 && (
          <div className="space-y-3">
            <h4 className="text-sm font-semibold text-gray-700 flex items-center gap-2">
              <CalendarDays className="h-4 w-4 text-purple-500" />
              Upcoming Events
            </h4>
            <div className="space-y-2 max-h-32 overflow-y-auto">
              {upcomingEvents.slice(0, 3).map((event, index) => (
                <div key={index} className="flex items-center justify-between p-3 rounded-lg bg-white/70 hover:bg-white/90 transition-all duration-200 border border-gray-100/50 group/item">
                  <div className="flex items-center gap-2.5 flex-1 min-w-0">
                    <div className={`p-1.5 rounded-full ${getEventColor(event.type, event.category)}`}>
                      {getEventIcon(event.type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <span className="text-sm text-gray-700 truncate block font-medium">
                        {event.name}
                      </span>
                      {event.isMultiDay && (
                        <span className="text-xs text-gray-500">Multi-day event</span>
                      )}
                    </div>
                  </div>
                  <Badge 
                    variant="outline" 
                    className={`text-xs font-medium ml-2 flex-shrink-0 ${getEventColor(event.type, event.category)}`}
                  >
                    {formatDate(event.date)}
                  </Badge>
                </div>
              ))}
            </div>
          </div>
        )}

        {upcomingEvents.length === 0 && (
          <div className="text-center py-6">
            <div className="p-4 rounded-full bg-purple-100 w-16 h-16 mx-auto mb-3 flex items-center justify-center">
              <Calendar className="h-8 w-8 text-purple-400" />
            </div>
            <p className="text-sm text-gray-500 font-medium">No upcoming events</p>
            <p className="text-xs text-gray-400 mt-1">Check back later for updates</p>
          </div>
        )}

        {/* Action Button */}
        <Button 
          variant="outline" 
          size="sm" 
          onClick={handleViewFullCalendar}
          className="w-full mt-4 bg-gradient-to-r from-purple-50 to-amber-50 hover:from-purple-100 hover:to-amber-100 text-purple-700 border-purple-300/50 hover:border-purple-400/50 shadow-md hover:shadow-lg transition-all duration-300 group/btn font-semibold"
        >
          <ExternalLink className="h-4 w-4 mr-2 group-hover/btn:scale-110 transition-transform duration-200" />
          View Full Calendar
        </Button>
      </CardContent>
    </Card>
  );
};
