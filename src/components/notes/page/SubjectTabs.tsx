
import { useState, useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useScreenSize } from "@/hooks/use-screen-size";
import { GooeyFilter } from "@/components/ui/gooey-filter";
import { UserSubject } from "@/types/subject";
import { useUserSubjects } from "@/hooks/useUserSubjects";
import { Loader2 } from "lucide-react";

interface SubjectTabsProps {
  activeSubjectId: string | null;
  onSubjectChange: (subjectId: string | null) => void;
}

export const SubjectTabs = ({ activeSubjectId, onSubjectChange }: SubjectTabsProps) => {
  const screenSize = useScreenSize();
  const { subjects, isLoading } = useUserSubjects();
  const [isGooeyEnabled, setIsGooeyEnabled] = useState(true);
  
  // Find the active tab index
  const activeTabIndex = activeSubjectId === null 
    ? 0 // "All" tab
    : subjects.findIndex(subject => subject.id === activeSubjectId) + 1; // +1 because "All" is first

  // Combined tabs: "All" + user's subjects
  const allTabs = [
    { id: null, name: "All" },
    ...subjects
  ];

  // Debug information
  useEffect(() => {
    console.log("Active subject ID:", activeSubjectId);
    console.log("Active tab index:", activeTabIndex);
    console.log("Available subjects:", subjects);
  }, [activeSubjectId, activeTabIndex, subjects]);

  if (isLoading) {
    return (
      <div className="flex justify-center py-4">
        <Loader2 className="h-5 w-5 animate-spin text-mint-500" />
      </div>
    );
  }

  return (
    <div className="relative w-full">
      <GooeyFilter
        id="gooey-filter-subjects"
        strength={screenSize.lessThan("md") ? 8 : 12}
      />

      <div
        className="absolute inset-0"
        style={{ filter: isGooeyEnabled ? "url(#gooey-filter-subjects)" : "none" }}
      >
        <div className="flex w-full">
          {allTabs.map((_, index) => (
            <div key={index} className="relative flex-1 h-8 md:h-12">
              {activeTabIndex === index && (
                <motion.div
                  layoutId="active-subject-tab"
                  className="absolute inset-0 bg-mint-100 dark:bg-mint-900"
                  transition={{
                    type: "spring",
                    bounce: 0.0,
                    duration: 0.4,
                  }}
                />
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Interactive text overlay, no filter */}
      <div className="relative flex w-full">
        {allTabs.map((tab, index) => (
          <button
            key={tab.id ?? 'all'}
            onClick={() => {
              console.log("Tab clicked:", tab.name, "with ID:", tab.id);
              onSubjectChange(tab.id);
            }}
            className="flex-1 h-8 md:h-12"
          >
            <span
              className={`
                w-full h-full flex items-center justify-center text-xs sm:text-sm md:text-base truncate px-1
                ${activeTabIndex === index ? "text-mint-800 dark:text-mint-100 font-medium" : "text-muted-foreground"}
              `}
            >
              {tab.name}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
};
