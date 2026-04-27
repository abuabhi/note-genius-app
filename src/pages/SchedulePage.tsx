
import { useState, lazy, Suspense } from "react";
// FullCalendar bundle is heavy (~200KB+). Defer it so the page shell paints
// instantly and the calendar streams in.
const ScheduleCalendar = lazy(() => import("@/components/schedule/ScheduleCalendar"));
import { ScheduleHeader } from "@/components/schedule/ScheduleHeader";
import { UpcomingEventsList } from "@/components/schedule/UpcomingEventsList";
import { useEvents } from "@/hooks/events";
import { useRequireAuth } from "@/hooks/useRequireAuth";
import { StandardPageHeader } from "@/components/ui/StandardPageHeader";
import { Calendar } from "lucide-react";
import { toast } from "sonner";

const SchedulePage = () => {
  const { user, loading } = useRequireAuth();
  const [date, setDate] = useState<Date>(new Date());
  const { 
    upcomingEvents, 
    upcomingLoading, 
    formatEventDate, 
    deleteEvent,
    refetchEvents,
    refetchUpcomingEvents
  } = useEvents(date);

  const handleDeleteEvent = async (eventId: string) => {
    try {
      await deleteEvent.mutateAsync(eventId);
      toast.success("Event deleted successfully");
      refetchEvents();
      refetchUpcomingEvents(); // Add this to refresh upcoming events too
    } catch (error) {
      toast.error("Failed to delete event");
      console.error("Delete event error:", error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-mint-50/30 via-white to-blue-50/30">
        <div className="container mx-auto p-4 md:p-6 h-full">
          <div className="flex justify-center items-center h-[80vh]">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-mint-500" />
          </div>
        </div>
      </div>
    );
  }

  if (!user) {
    // Will redirect via useRequireAuth
    return null;
  }

  const breadcrumbs = [
    { label: "Schedule" }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-mint-50/30 via-white to-blue-50/30">
      <StandardPageHeader
        title="Schedule"
        description="Manage your events and study calendar"
        icon={<Calendar className="h-6 w-6 text-white" />}
        breadcrumbs={breadcrumbs}
      />
      
      <div className="container mx-auto px-6 py-8">
        <ScheduleHeader selectedDate={date} onDateChange={setDate} />
        
        <div className="mt-6">
          <ScheduleCalendar selectedDate={date} onDateChange={setDate} />
        </div>
        
        <div className="mt-8">
          <UpcomingEventsList 
            events={upcomingEvents} 
            isLoading={upcomingLoading} 
            formatEventDate={formatEventDate}
            onDeleteEvent={handleDeleteEvent}
          />
        </div>
      </div>
    </div>
  );
};

export default SchedulePage;
