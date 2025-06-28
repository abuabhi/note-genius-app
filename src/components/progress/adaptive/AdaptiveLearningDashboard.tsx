
import { LearningPathCard } from "./LearningPathCard";
import { StudyScheduleCard } from "./StudyScheduleCard";

export const AdaptiveLearningDashboard = () => {
  return (
    <div className="space-y-8">
      {/* Learning Paths & Schedule */}
      <div className="grid gap-8 lg:grid-cols-2">
        <LearningPathCard />
        <StudyScheduleCard />
      </div>
    </div>
  );
};
