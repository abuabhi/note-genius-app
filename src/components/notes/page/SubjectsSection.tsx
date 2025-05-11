
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
      console.log(`Setting filter for subject: ${activeSubjectId}`);
      
      setFilterOptions(prev => ({
        ...prev,
        subjectId: activeSubjectId
      }));
    } else {
      // Remove subject filter if "All" is selected
      setFilterOptions(prev => {
        const newFilters = { ...prev };
        delete newFilters.subjectId;
        return newFilters;
      });
    }
  }, [activeSubjectId, setFilterOptions]);

  if (loadingSubjects) {
    return (
      <div className="flex justify-center py-4 mb-6">
        <Loader2 className="h-5 w-5 animate-spin text-mint-500" />
      </div>
    );
  }

  if (subjects.length === 0) {
    return null;
  }

  return (
    <div className="mb-6">
      <SubjectTabs 
        activeSubjectId={activeSubjectId} 
        onSubjectChange={setActiveSubjectId} 
      />
      
      {/* Debugging counts */}
      {activeSubjectId && (
        <div className="text-xs text-mint-500 mt-2">
          Showing {filteredNotesCount} notes for selected subject
        </div>
      )}
    </div>
  );
};
