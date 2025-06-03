
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
      console.log(`SubjectsSection - Setting filter for subject ID: ${activeSubjectId}`);
      
      // Find subject name for logging
      const subjectName = subjects.find(s => s.id === activeSubjectId)?.name;
      console.log(`SubjectsSection - Selected subject: ${subjectName} (ID: ${activeSubjectId})`);
      
      setFilterOptions(prev => ({
        ...prev,
        subjectId: activeSubjectId
      }));
    } else {
      // Remove subject filter if "All" is selected
      console.log("SubjectsSection - Clearing subject filter (All selected)");
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
      <div className="flex justify-center py-8">
        <div className="bg-white/60 backdrop-blur-sm rounded-lg border border-mint-100 p-6 shadow-sm">
          <Loader2 className="h-6 w-6 animate-spin text-mint-500" />
        </div>
      </div>
    );
  }

  if (!subjects || subjects.length === 0) {
    console.log("SubjectsSection - No subjects available");
    return null;
  }

  console.log(`SubjectsSection - Rendering with ${subjects.length} subjects`);
  subjects.forEach(subject => {
    console.log(`Available subject: ${subject.name} (ID: ${subject.id})`);
  });

  return (
    <div className="bg-white/50 backdrop-blur-sm rounded-lg border border-mint-100 shadow-sm overflow-hidden">
      <SubjectTabs 
        activeSubjectId={activeSubjectId} 
        onSubjectChange={setActiveSubjectId} 
      />
    </div>
  );
};
