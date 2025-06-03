
import { useState, useEffect, useMemo } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useScreenSize } from "@/hooks/use-screen-size";
import { GooeyFilter } from "@/components/ui/gooey-filter";
import { UserSubject } from "@/types/subject";
import { useUserSubjects } from "@/hooks/useUserSubjects";
import { useNotes } from "@/contexts/NoteContext";
import { Loader2 } from "lucide-react";
import { generateColorFromString } from "@/utils/colorUtils";
import { Badge } from "@/components/ui/badge";

interface SubjectTabsProps {
  activeSubjectId: string | null;
  onSubjectChange: (subjectId: string | null) => void;
}

export const SubjectTabs = ({ activeSubjectId, onSubjectChange }: SubjectTabsProps) => {
  const screenSize = useScreenSize();
  const { subjects, isLoading } = useUserSubjects();
  const { notes } = useNotes();
  const [isGooeyEnabled, setIsGooeyEnabled] = useState(true);
  
  // Calculate note counts per subject
  const subjectNoteCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    
    // Count notes for each subject
    notes.forEach(note => {
      if (note.subject_id) {
        counts[note.subject_id] = (counts[note.subject_id] || 0) + 1;
      }
    });
    
    // Count notes without subjects (for "All" tab)
    const notesWithoutSubject = notes.filter(note => !note.subject_id).length;
    const totalNotes = notes.length;
    
    return {
      all: totalNotes,
      withoutSubject: notesWithoutSubject,
      ...counts
    };
  }, [notes]);

  // Find the active tab index
  const activeTabIndex = activeSubjectId === null 
    ? 0 // "All" tab
    : subjects.findIndex(subject => subject.id === activeSubjectId) + 1; // +1 because "All" is first

  // Combined tabs: "All" + user's subjects with note counts
  const allTabs = useMemo(() => [
    { 
      id: null, 
      name: "All", 
      color: "#10b981", // mint-500
      noteCount: subjectNoteCounts.all || 0 
    },
    ...subjects.map(subject => ({
      ...subject,
      color: generateColorFromString(subject.name),
      noteCount: subjectNoteCounts[subject.id!] || 0
    }))
  ], [subjects, subjectNoteCounts]);

  // Debug information
  useEffect(() => {
    console.log("SubjectTabs - Active subject ID:", activeSubjectId);
    console.log("SubjectTabs - Active tab index:", activeTabIndex);
    console.log("SubjectTabs - Available tabs:", allTabs.map(tab => `${tab.id || 'all'}: ${tab.name} (${tab.noteCount})`).join(', '));
  }, [activeSubjectId, activeTabIndex, allTabs]);

  if (isLoading) {
    return (
      <div className="flex justify-center py-4">
        <Loader2 className="h-5 w-5 animate-spin text-mint-500" />
      </div>
    );
  }

  return (
    <div className="sticky top-0 z-20 bg-white/95 backdrop-blur-sm border-b border-mint-100 pb-4 mb-6">
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
              <div key={index} className="relative flex-1 h-12 md:h-14">
                {activeTabIndex === index && (
                  <motion.div
                    layoutId="active-subject-tab"
                    className="absolute inset-0 bg-gradient-to-r from-mint-50 to-mint-100 dark:from-mint-900 dark:to-mint-800 rounded-lg"
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

        {/* Interactive text overlay with enhanced styling */}
        <div className="relative flex w-full gap-1">
          {allTabs.map((tab, index) => (
            <button
              key={tab.id ?? 'all'}
              onClick={() => {
                console.log("Tab clicked:", tab.name, "with ID:", tab.id);
                onSubjectChange(tab.id);
              }}
              className="flex-1 h-12 md:h-14 relative group"
            >
              <div
                className={`
                  w-full h-full flex flex-col items-center justify-center px-2 py-1 rounded-lg transition-all duration-200
                  ${activeTabIndex === index 
                    ? "text-mint-800 dark:text-mint-100 font-semibold shadow-sm" 
                    : "text-gray-600 hover:text-mint-700 hover:bg-mint-25 font-medium"
                  }
                `}
              >
                {/* Subject color indicator */}
                <div className="flex items-center gap-2 mb-1">
                  <div 
                    className="w-3 h-3 rounded-full border-2 border-white shadow-sm"
                    style={{ backgroundColor: tab.color }}
                  />
                  <span className="text-xs sm:text-sm md:text-base truncate max-w-[100px] md:max-w-none">
                    {tab.name}
                  </span>
                </div>
                
                {/* Note count badge */}
                <Badge 
                  variant="secondary" 
                  className={`
                    text-xs px-2 py-0 h-5 min-w-[20px] transition-all duration-200
                    ${activeTabIndex === index 
                      ? "bg-mint-200 text-mint-800 border-mint-300" 
                      : "bg-gray-100 text-gray-600 group-hover:bg-mint-100 group-hover:text-mint-700"
                    }
                  `}
                >
                  {tab.noteCount}
                </Badge>
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
