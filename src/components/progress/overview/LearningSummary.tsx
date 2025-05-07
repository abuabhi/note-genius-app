
import { BookOpen, Calendar, Trophy } from "lucide-react";
import LearningSummaryCard from "./LearningSummaryCard";

interface LearningSummaryProps {
  totalCardsMastered: number;
  studyTimeHours: number;
  totalSets: number;
}

const LearningSummary = ({ totalCardsMastered, studyTimeHours, totalSets }: LearningSummaryProps) => {
  return (
    <div className="grid gap-6 md:grid-cols-4">
      <LearningSummaryCard
        title="Total Cards Mastered"
        value={totalCardsMastered}
        icon={BookOpen}
        changeText={`+${Math.floor(totalCardsMastered * 0.2)} past month`}
      />

      <LearningSummaryCard
        title="Total Study Time"
        value={`${studyTimeHours} hrs`}
        icon={Calendar}
        changeText={`+${Math.floor(studyTimeHours * 0.1)} past month`}
      />

      <LearningSummaryCard
        title="Achievements"
        value="5/9"
        icon={Trophy}
        changeText="+1 past month"
      />

      <LearningSummaryCard
        title="Flashcard Sets"
        value={totalSets}
        icon={BookOpen}
        changeText={`+${Math.ceil(totalSets * 0.3)} past month`}
      />
    </div>
  );
};

export default LearningSummary;
