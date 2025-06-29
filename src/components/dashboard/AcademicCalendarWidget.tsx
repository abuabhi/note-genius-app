
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Calendar, MapPin, Clock, ExternalLink } from 'lucide-react';
import { useAcademicCalendar } from '@/hooks/useAcademicCalendar';
import { useNavigate } from 'react-router-dom';
import { Skeleton } from '@/components/ui/skeleton';

export const AcademicCalendarWidget = () => {
  const navigate = useNavigate();
  const { 
    currentStatus, 
    upcomingEvents, 
    formatDate, 
    countryCode, 
    institutionType,
    isLoading 
  } = useAcademicCalendar();

  const handleViewFullCalendar = () => {
    navigate('/academic-calendar');
  };

  if (isLoading) {
    return (
      <Card className="h-full">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Calendar className="h-5 w-5" />
            Academic Calendar
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-16 w-full" />
          <Skeleton className="h-8 w-24" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="h-full">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-lg">
          <Calendar className="h-5 w-5 text-mint-600" />
          Academic Calendar
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Context */}
        <div className="flex items-center gap-1 text-sm text-muted-foreground">
          <MapPin className="h-3 w-3" />
          <span>{countryCode} • {institutionType}</span>
        </div>

        {/* Current Status */}
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4 text-mint-500" />
            <span className="text-sm font-medium">Current Status</span>
          </div>
          <p className="text-sm text-muted-foreground pl-6">{currentStatus}</p>
        </div>

        {/* Upcoming Events */}
        {upcomingEvents.length > 0 && (
          <div className="space-y-2">
            <h4 className="text-sm font-medium">Upcoming</h4>
            <div className="space-y-1">
              {upcomingEvents.map((event, index) => (
                <div key={index} className="flex justify-between items-center text-sm">
                  <span className="text-muted-foreground truncate">
                    {event.name}
                  </span>
                  <span className="text-xs text-mint-600 font-medium">
                    {formatDate(event.date)}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Action Button */}
        <Button 
          variant="outline" 
          size="sm" 
          onClick={handleViewFullCalendar}
          className="w-full mt-4 text-mint-600 border-mint-200 hover:bg-mint-50"
        >
          <ExternalLink className="h-3 w-3 mr-2" />
          View Full Calendar
        </Button>
      </CardContent>
    </Card>
  );
};
