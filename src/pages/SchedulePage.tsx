
import { useState } from "react";
import Layout from "@/components/layout/Layout";
import { ScheduleCalendar } from "@/components/schedule/ScheduleCalendar";
import { ScheduleHeader } from "@/components/schedule/ScheduleHeader";
import { UpcomingEventsList } from "@/components/schedule/UpcomingEventsList";
import { useEvents } from "@/hooks/events";
import { useRequireAuth } from "@/hooks/useRequireAuth";
import { toast } from "sonner";
import { FeatureDisabledAlert } from "@/components/routes/FeatureProtectedRoute";

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
      <Layout>
        <div className="container mx-auto p-4 md:p-6 h-full">
          <div className="flex justify-center items-center h-[80vh]">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-mint-500" />
          </div>
        </div>
      </Layout>
    );
  }

  if (!user) {
    // Will redirect via useRequireAuth
    return null;
  }

  return (
    <Layout>
      <div className="container mx-auto p-4 md:p-6">
        <ScheduleHeader selectedDate={date} onDateChange={setDate} />
        
        <FeatureDisabledAlert featureKey="schedule" featureDisplayName="Schedule" />
        
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
    </Layout>
  );
};

export default SchedulePage;
