
import Layout from "@/components/layout/Layout";
import { ScheduleCalendar } from "@/components/schedule/ScheduleCalendar";
import { ScheduleHeader } from "@/components/schedule/ScheduleHeader";

const SchedulePage = () => {
  return (
    <Layout>
      <div className="container mx-auto p-6">
        <ScheduleHeader />
        <ScheduleCalendar />
      </div>
    </Layout>
  );
};

export default SchedulePage;
