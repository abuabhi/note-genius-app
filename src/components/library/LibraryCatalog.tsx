
import { useState, useEffect } from "react";
import { useFlashcards } from "@/contexts/FlashcardContext";
import { FlashcardSet } from "@/types/flashcard";
import { LibrarySetCard } from "./LibrarySetCard";
import { UserTier } from "@/hooks/useRequireAuth";

interface LibraryCatalogProps {
  filters: {
    subject: string;
    gradeLevel: string;
    difficulty: string;
  };
  userTier: UserTier;
}

export const LibraryCatalog = ({ filters, userTier }: LibraryCatalogProps) => {
  const { fetchBuiltInSets } = useFlashcards();
  const [sets, setSets] = useState<FlashcardSet[]>([]);
  const [loading, setLoading] = useState(true);
  const [filteredSets, setFilteredSets] = useState<FlashcardSet[]>([]);
  
  useEffect(() => {
    const loadSets = async () => {
      setLoading(true);
      try {
        const builtInSets = await fetchBuiltInSets();
        setSets(builtInSets || []);
      } catch (error) {
        console.error("Error loading library sets:", error);
        setSets([]);
      } finally {
        setLoading(false);
      }
    };
    
    loadSets();
  }, [fetchBuiltInSets]);
  
  // Apply filters whenever sets or filter values change
  useEffect(() => {
    if (!sets.length) {
      setFilteredSets([]);
      return;
    }
    
    let result = [...sets];
    
    // Filter by subject
    if (filters.subject !== "_all") {
      result = result.filter((set) => set.subject === filters.subject);
    }
    
    // Filter by difficulty (we may need to map difficulty string to numeric values)
    if (filters.difficulty !== "_all") {
      // Assuming difficulty is stored as "Beginner", "Intermediate", etc.
      result = result.filter((set) => {
        const difficultyMap: Record<string, number> = {
          "Beginner": 1,
          "Intermediate": 2,
          "Advanced": 3,
          "Expert": 4
        };
        
        // If we have a difficulty field in the set, filter by it
        return set.difficulty === difficultyMap[filters.difficulty];
      });
    }
    
    // Filter by grade level (depends on how grade level is stored in your data model)
    if (filters.gradeLevel !== "_all") {
      result = result.filter((set) => {
        // This will depend on how the grade info is stored in your sets
        return set.education_system === filters.gradeLevel;
      });
    }
    
    setFilteredSets(result);
  }, [sets, filters]);
  
  if (loading) {
    return <div className="text-center py-8">Loading library sets...</div>;
  }
  
  if (!filteredSets.length) {
    return (
      <div className="text-center py-8">
        <h3 className="text-lg font-medium mb-2">No flashcard sets found</h3>
        <p className="text-muted-foreground">
          {sets.length > 0 
            ? "Try changing your filters to see more results." 
            : "There are no library sets available at this time."}
        </p>
      </div>
    );
  }
  
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {filteredSets.map((set) => (
        <LibrarySetCard key={set.id} set={set} />
      ))}
    </div>
  );
};
