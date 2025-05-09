
import { useState } from "react";
import Layout from "@/components/layout/Layout";
import { ScheduleCalendar } from "@/components/schedule/ScheduleCalendar";
import { ScheduleHeader } from "@/components/schedule/ScheduleHeader";
import { useRequireAuth } from "@/hooks/useRequireAuth";

const SchedulePage = () => {
  const { user, loading } = useRequireAuth();
  const [date, setDate] = useState<Date>(new Date());

  if (loading) {
    return (
      <Layout>
        <div className="container mx-auto p-4 md:p-6 h-full">
          <div className="flex justify-center items-center h-[80vh]">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary" />
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
        <div className="mt-6">
          <ScheduleCalendar selectedDate={date} onDateChange={setDate} />
        </div>
      </div>
    </Layout>
  );
};

export default SchedulePage;
