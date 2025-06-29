
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar, Clock } from "lucide-react";
import { useSimplifiedAcademicCalendar } from "@/hooks/useSimplifiedAcademicCalendar";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";

export const AcademicCalendarWidget = () => {
  const {
    upcomingEvents,
    currentStatus,
    nextEvent,
    daysUntilNext,
    isLoading,
    hasError,
    formatDate,
    countryCode
  } = useSimplifiedAcademicCalendar();

  if (isLoading) {
    return (
      <Card className="h-full bg-white shadow-sm border-gray-200">
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2">
            <Calendar className="h-5 w-5 text-mint-600" />
            <CardTitle className="text-lg font-semibold text-gray-900">Academic Calendar</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <Skeleton className="h-16 w-full" />
          <div className="space-y-2">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-4 w-1/2" />
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="h-full bg-white shadow-sm border-gray-200 hover:shadow-md transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Calendar className="h-5 w-5 text-mint-600" />
            <CardTitle className="text-lg font-semibold text-gray-900">Academic Calendar</CardTitle>
          </div>
          <Badge variant="outline" className="text-xs font-medium">
            {countryCode}
          </Badge>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {hasError && (
          <div className="text-center py-4">
            <p className="text-sm text-amber-600 mb-2">Limited data available</p>
            <p className="text-xs text-gray-500">Using basic calendar information</p>
          </div>
        )}

        {/* Current Status */}
        <div className="bg-mint-50 rounded-lg p-3 border border-mint-100">
          <div className="flex items-center gap-2 mb-1">
            <div className="w-2 h-2 bg-mint-500 rounded-full"></div>
            <span className="text-sm font-medium text-mint-800">Current Period</span>
          </div>
          <p className="text-mint-700 font-semibold">{currentStatus}</p>
        </div>

        {/* Next Event Countdown */}
        {nextEvent && (
          <div className="bg-blue-50 rounded-lg p-3 border border-blue-100">
            <div className="flex items-center gap-2 mb-1">
              <Clock className="h-4 w-4 text-blue-600" />
              <span className="text-sm font-medium text-blue-800">Next Event</span>
            </div>
            <p className="text-blue-700 font-semibold text-sm">{nextEvent.name}</p>
            <p className="text-blue-600 text-xs">
              {daysUntilNext === 0 ? 'Today' : 
               daysUntilNext === 1 ? 'Tomorrow' : 
               `${daysUntilNext} days away`}
            </p>
          </div>
        )}

        {/* Upcoming Events */}
        <div>
          <h4 className="font-medium text-gray-900 mb-2 text-sm">Upcoming Events</h4>
          {upcomingEvents.length > 0 ? (
            <div className="space-y-2">
              {upcomingEvents.slice(0, 3).map((event) => (
                <div key={event.id} className="flex items-center justify-between py-1">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {event.name}
                    </p>
                    <div className="flex items-center gap-2">
                      <Badge 
                        variant={event.category === 'public' ? 'secondary' : 'outline'} 
                        className="text-xs"
                      >
                        {event.type}
                      </Badge>
                    </div>
                  </div>
                  <span className="text-xs text-gray-500 ml-2">
                    {formatDate(event.date)}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-gray-500 text-center py-2">
              No upcoming events found
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
