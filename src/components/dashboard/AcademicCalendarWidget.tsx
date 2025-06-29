
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Calendar, MapPin, Clock, ExternalLink, GraduationCap, BookOpen } from 'lucide-react';
import { useAcademicCalendar } from '@/hooks/useAcademicCalendar';
import { useNavigate } from 'react-router-dom';
import { Skeleton } from '@/components/ui/skeleton';

export const AcademicCalendarWidget = () => {
  const navigate = useNavigate();
  const { 
    currentStatus, 
    upcomingEvents, 
    formatDate, 
    countryName, 
    institutionType,
    isLoading 
  } = useAcademicCalendar();

  const handleViewFullCalendar = () => {
    navigate('/academic-calendar');
  };

  if (isLoading) {
    return (
      <Card className="h-full bg-gradient-to-br from-white via-blue-50/30 to-mint-50/30 border-blue-100/50 shadow-lg hover:shadow-xl transition-all duration-300">
        <CardHeader className="pb-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-gradient-to-br from-blue-500 to-mint-500 rounded-xl shadow-md">
              <Calendar className="h-5 w-5 text-white" />
            </div>
            <div>
              <CardTitle className="text-lg font-semibold bg-gradient-to-r from-blue-600 to-mint-600 bg-clip-text text-transparent">
                Academic Calendar
              </CardTitle>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-16 w-full" />
          <Skeleton className="h-8 w-24" />
        </CardContent>
      </Card>
    );
  }

  const getStatusBadgeVariant = (status: string) => {
    if (status.includes('Finals') || status.includes('Exam')) return 'destructive';
    if (status.includes('Break') || status.includes('Holiday')) return 'secondary';
    if (status.includes('Semester') || status.includes('Term')) return 'default';
    return 'outline';
  };

  const getEventIcon = (type: string) => {
    switch (type) {
      case 'exam': return <BookOpen className="h-3 w-3" />;
      case 'term': return <GraduationCap className="h-3 w-3" />;
      default: return <Calendar className="h-3 w-3" />;
    }
  };

  const getEventColor = (type: string) => {
    switch (type) {
      case 'exam': return 'text-red-600';
      case 'term': return 'text-blue-600';
      case 'holiday': return 'text-green-600';
      default: return 'text-mint-600';
    }
  };

  return (
    <Card className="h-full bg-gradient-to-br from-white via-blue-50/30 to-mint-50/30 border-blue-100/50 shadow-lg hover:shadow-xl transition-all duration-300 group">
      <CardHeader className="pb-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-gradient-to-br from-blue-500 to-mint-500 rounded-xl shadow-md group-hover:shadow-lg transition-all duration-300">
            <Calendar className="h-5 w-5 text-white" />
          </div>
          <div>
            <CardTitle className="text-lg font-semibold bg-gradient-to-r from-blue-600 to-mint-600 bg-clip-text text-transparent">
              Academic Calendar
            </CardTitle>
            <div className="flex items-center gap-1.5 text-xs text-gray-500 mt-0.5">
              <MapPin className="h-3 w-3" />
              <span>{countryName} • {institutionType}</span>
            </div>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Current Status */}
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4 text-blue-500" />
            <span className="text-sm font-medium text-gray-700">Current Period</span>
          </div>
          <div className="ml-6">
            <Badge 
              variant={getStatusBadgeVariant(currentStatus)} 
              className="text-xs font-medium shadow-sm"
            >
              {currentStatus}
            </Badge>
          </div>
        </div>

        {/* Upcoming Events */}
        {upcomingEvents.length > 0 && (
          <div className="space-y-3">
            <h4 className="text-sm font-medium text-gray-700 flex items-center gap-2">
              <ExternalLink className="h-3.5 w-3.5 text-mint-500" />
              Upcoming Events
            </h4>
            <div className="space-y-2">
              {upcomingEvents.map((event, index) => (
                <div key={index} className="flex items-center justify-between p-2 rounded-lg bg-white/60 hover:bg-white/80 transition-colors duration-200 border border-gray-100/50">
                  <div className="flex items-center gap-2 flex-1 min-w-0">
                    <div className={`${getEventColor(event.type)}`}>
                      {getEventIcon(event.type)}
                    </div>
                    <span className="text-sm text-gray-600 truncate">
                      {event.name}
                    </span>
                  </div>
                  <Badge 
                    variant="outline" 
                    className={`text-xs font-medium ${getEventColor(event.type)} border-current/20 bg-current/5 ml-2 flex-shrink-0`}
                  >
                    {formatDate(event.date)}
                  </Badge>
                </div>
              ))}
            </div>
          </div>
        )}

        {upcomingEvents.length === 0 && (
          <div className="text-center py-4">
            <Calendar className="h-8 w-8 text-gray-300 mx-auto mb-2" />
            <p className="text-sm text-gray-500">No upcoming events</p>
          </div>
        )}

        {/* Action Button */}
        <Button 
          variant="outline" 
          size="sm" 
          onClick={handleViewFullCalendar}
          className="w-full mt-4 bg-gradient-to-r from-blue-50 to-mint-50 hover:from-blue-100 hover:to-mint-100 text-blue-700 border-blue-200/50 hover:border-blue-300/50 shadow-sm hover:shadow-md transition-all duration-300 group"
        >
          <ExternalLink className="h-3.5 w-3.5 mr-2 group-hover:scale-110 transition-transform duration-200" />
          View Full Calendar
        </Button>
      </CardContent>
    </Card>
  );
};
