
import { CalendarDays } from "lucide-react";
import { StandardPageHeader } from "@/components/ui/StandardPageHeader";
import { useSimplifiedAcademicCalendar } from "@/hooks/useSimplifiedAcademicCalendar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/ui/empty-state";

const AcademicCalendarPage = () => {
  const {
    events,
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
      <>
        <StandardPageHeader
          title="Academic Calendar"
          description="View academic terms, holidays, and important dates"
          icon={<CalendarDays className="h-6 w-6 text-white" />}
          breadcrumbs={[{ label: "Academic Calendar" }]}
        />
        
        <div className="container mx-auto p-6 space-y-6">
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {[...Array(6)].map((_, i) => (
              <Card key={i}>
                <CardHeader>
                  <Skeleton className="h-6 w-32" />
                </CardHeader>
                <CardContent>
                  <Skeleton className="h-4 w-full mb-2" />
                  <Skeleton className="h-4 w-3/4" />
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </>
    );
  }

  const academicEvents = events.filter(event => event.category === 'academic');
  const publicHolidays = events.filter(event => event.category === 'public');

  return (
    <>
      <StandardPageHeader
        title="Academic Calendar"
        description={`Academic calendar for ${countryCode} • ${events.length} events found`}
        icon={<CalendarDays className="h-6 w-6 text-white" />}
        breadcrumbs={[{ label: "Academic Calendar" }]}
      />
      
      <div className="container mx-auto p-6 space-y-6">
        {hasError && (
          <Card className="border-amber-200 bg-amber-50">
            <CardContent className="pt-6">
              <div className="text-center">
                <p className="text-amber-800 font-medium mb-1">Limited API Access</p>
                <p className="text-amber-600 text-sm">
                  Showing basic calendar data. Some events may not be displayed.
                </p>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Overview Cards */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {/* Current Status */}
          <Card className="bg-mint-50 border-mint-200">
            <CardHeader className="pb-3">
              <CardTitle className="text-mint-800 flex items-center gap-2">
                <div className="w-2 h-2 bg-mint-500 rounded-full"></div>
                Current Period
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-mint-700 font-semibold text-lg">{currentStatus}</p>
            </CardContent>
          </Card>

          {/* Next Event */}
          {nextEvent && (
            <Card className="bg-blue-50 border-blue-200">
              <CardHeader className="pb-3">
                <CardTitle className="text-blue-800">Next Event</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-blue-700 font-semibold">{nextEvent.name}</p>
                <p className="text-blue-600 text-sm mt-1">
                  {formatDate(nextEvent.date)} • {daysUntilNext === 0 ? 'Today' : 
                   daysUntilNext === 1 ? 'Tomorrow' : 
                   `${daysUntilNext} days away`}
                </p>
              </CardContent>
            </Card>
          )}

          {/* Event Count */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-gray-800">Total Events</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold text-gray-900">{events.length}</p>
              <p className="text-gray-600 text-sm">
                {academicEvents.length} academic • {publicHolidays.length} holidays
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Academic Events */}
        {academicEvents.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="text-gray-900">Academic Events</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {academicEvents.map((event) => (
                  <div key={event.id} className="p-4 border border-gray-200 rounded-lg hover:border-mint-300 transition-colors">
                    <div className="flex items-start justify-between mb-2">
                      <h4 className="font-semibold text-gray-900">{event.name}</h4>
                      <Badge variant="outline" className="ml-2">
                        {event.type}
                      </Badge>
                    </div>
                    <div className="text-sm text-gray-600">
                      {event.isMultiDay ? (
                        <p>{formatDate(event.date)} - {event.endDate && formatDate(event.endDate)}</p>
                      ) : (
                        <p>{formatDate(event.date)}</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Public Holidays */}
        {publicHolidays.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="text-gray-900">Public Holidays</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {publicHolidays.map((event) => (
                  <div key={event.id} className="p-4 border border-gray-200 rounded-lg hover:border-blue-300 transition-colors">
                    <div className="flex items-start justify-between mb-2">
                      <h4 className="font-semibold text-gray-900">{event.name}</h4>
                      <Badge variant="secondary" className="ml-2">
                        holiday
                      </Badge>
                    </div>
                    <div className="text-sm text-gray-600">
                      {event.isMultiDay ? (
                        <p>{formatDate(event.date)} - {event.endDate && formatDate(event.endDate)}</p>
                      ) : (
                        <p>{formatDate(event.date)}</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Empty State */}
        {events.length === 0 && !isLoading && (
          <EmptyState
            title="No Calendar Events"
            description="We couldn't load calendar events for your region. This might be due to limited API access or regional availability."
          />
        )}
      </div>
    </>
  );
};

export default AcademicCalendarPage;
