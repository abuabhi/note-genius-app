
import { useEffect } from "react";
import { Loader2 } from "lucide-react";
import { SubjectTabs } from "./SubjectTabs";
import { useUserSubjects } from "@/hooks/useUserSubjects";
import { FilterOptions } from "@/contexts/notes/types";

interface SubjectsSectionProps {
  activeSubjectId: string | null;
  setActiveSubjectId: (id: string | null) => void;
  setFilterOptions: React.Dispatch<React.SetStateAction<FilterOptions>>;
  filteredNotesCount: number;
}

export const SubjectsSection = ({ 
  activeSubjectId, 
  setActiveSubjectId, 
  setFilterOptions,
  filteredNotesCount
}: SubjectsSectionProps) => {
  const { subjects, isLoading: loadingSubjects } = useUserSubjects();
  
  // When subject changes, update the filter
  useEffect(() => {
    // Set filter based on active subject
    if (activeSubjectId) {
      console.log(`Setting filter for subject ID: ${activeSubjectId}`);
      
      // Find subject name for logging
      const subjectName = subjects.find(s => s.id === activeSubjectId)?.name;
      console.log(`Selected subject: ${subjectName} (ID: ${activeSubjectId})`);
      
      setFilterOptions(prev => ({
        ...prev,
        subjectId: activeSubjectId
      }));
    } else {
      // Remove subject filter if "All" is selected
      console.log("Clearing subject filter (All selected)");
      setFilterOptions(prev => {
        const newFilters = { ...prev };
        if (newFilters.subjectId) {
          delete newFilters.subjectId;
        }
        return newFilters;
      });
    }
  }, [activeSubjectId, setFilterOptions, subjects]);

  if (loadingSubjects) {
    return (
      <div className="flex justify-center py-4 mb-6">
        <Loader2 className="h-5 w-5 animate-spin text-mint-500" />
      </div>
    );
  }

  if (!subjects || subjects.length === 0) {
    return null;
  }

  return (
    <div className="mb-6">
      <SubjectTabs 
        activeSubjectId={activeSubjectId} 
        onSubjectChange={setActiveSubjectId} 
      />
      
      {activeSubjectId && (
        <div className="text-xs text-mint-500 mt-2">
          Showing {filteredNotesCount} notes for selected subject
        </div>
      )}
    </div>
  );
};
