
import { StudyMode } from "@/pages/StudyPage";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BookOpen, RefreshCcw, BookCheck } from "lucide-react";

interface StudyModeSelectorProps {
  mode: StudyMode;
  setMode: (mode: StudyMode) => void;
}

export const StudyModeSelector = ({ mode, setMode }: StudyModeSelectorProps) => {
  return (
    <div className="mt-4 md:mt-0">
      <Tabs value={mode} onValueChange={(value) => setMode(value as StudyMode)} className="w-fit">
        <TabsList>
          <TabsTrigger value="learn" className="flex gap-2">
            <BookOpen className="h-4 w-4" />
            <span className="hidden sm:inline">Learn</span>
          </TabsTrigger>
          <TabsTrigger value="review" className="flex gap-2">
            <RefreshCcw className="h-4 w-4" />
            <span className="hidden sm:inline">Review</span>
          </TabsTrigger>
          <TabsTrigger value="test" className="flex gap-2">
            <BookCheck className="h-4 w-4" />
            <span className="hidden sm:inline">Test</span>
          </TabsTrigger>
        </TabsList>
      </Tabs>
    </div>
  );
};
