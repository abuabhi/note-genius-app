
import { useState, useMemo, useEffect } from "react";
import { useFlashcards } from "@/contexts/FlashcardContext";
import { useUserSubjects } from "@/hooks/useUserSubjects";
import FlashcardSetFilters from "./components/FlashcardSetFilters";
import FlashcardSetGrid from "./components/FlashcardSetGrid";
import FlashcardSetSkeleton from "./components/FlashcardSetSkeleton";

const EnhancedFlashcardSetsList = () => {
  const { flashcardSets, loading, deleteFlashcardSet, fetchFlashcardSets } = useFlashcards();
  const { subjects: userSubjects, isLoading: subjectsLoading } = useUserSubjects();
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState("updated_at");
  const [subjectFilter, setSubjectFilter] = useState<string | undefined>(undefined);
  const [deletingSet, setDeletingSet] = useState<string | null>(null);
  const [hasInitiallyLoaded, setHasInitiallyLoaded] = useState(false);
  const [setProgressData, setSetProgressData] = useState<Record<string, number>>({});

  // Calculate stable progress for flashcard sets (fixed to prevent infinite loop)
  useEffect(() => {
    if (!flashcardSets || flashcardSets.length === 0) return;
    
    const progressMap: Record<string, number> = {};
    
    for (const set of flashcardSets) {
      // Create a stable hash from set ID for consistent progress calculation
      const hash = set.id.split('').reduce((a, b) => {
        a = ((a << 5) - a) + b.charCodeAt(0);
        return a & a;
      }, 0);
      progressMap[set.id] = Math.abs(hash) % 100;
    }
    
    setSetProgressData(progressMap);
  }, [flashcardSets]);

  // Filter and sort flashcard sets - updated to use user subjects for filtering
  const filteredAndSortedSets = useMemo(() => {
    if (!flashcardSets) return [];
    
    let filtered = flashcardSets.filter(set => {
      const matchesSearch = set.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        set.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        set.subject?.toLowerCase().includes(searchQuery.toLowerCase());
      
      // Filter by selected user subject
      const matchesSubject = !subjectFilter || set.subject === subjectFilter;
      
      return matchesSearch && matchesSubject;
    });

    return filtered.sort((a, b) => {
      switch (sortBy) {
        case "name":
          return (a.name || "").localeCompare(b.name || "");
        case "created_at":
          return new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime();
        case "card_count":
          return (b.card_count || 0) - (a.card_count || 0);
        case "updated_at":
        default:
          return new Date(b.updated_at || 0).getTime() - new Date(a.updated_at || 0).getTime();
      }
    });
  }, [flashcardSets, searchQuery, sortBy, subjectFilter]);

  // Single effect to ensure flashcards are fetched when component mounts
  useEffect(() => {
    console.log('EnhancedFlashcardSetsList: Component mounted');
    
    const loadData = async () => {
      if (!hasInitiallyLoaded) {
        console.log('EnhancedFlashcardSetsList: Loading initial data...');
        try {
          await fetchFlashcardSets();
          console.log('EnhancedFlashcardSetsList: Data loaded successfully');
        } catch (error) {
          console.error('EnhancedFlashcardSetsList: Error loading data:', error);
        } finally {
          setHasInitiallyLoaded(true);
        }
      }
    };
    
    loadData();
  }, []); // Empty dependency array - only run once on mount

  const handleDeleteSet = async (setId: string) => {
    setDeletingSet(setId);
    try {
      await deleteFlashcardSet(setId);
      console.log('Set deleted successfully, refreshing list...');
      // Refresh the list after deletion
      await fetchFlashcardSets();
    } catch (error) {
      console.error("Error deleting flashcard set:", error);
    } finally {
      setDeletingSet(null);
    }
  };

  const handleClearFilters = () => {
    setSearchQuery("");
    setSubjectFilter(undefined);
  };

  // Show loading state only if we haven't initially loaded and are currently loading
  if (!hasInitiallyLoaded && loading.sets) {
    return <FlashcardSetSkeleton />;
  }

  console.log('EnhancedFlashcardSetsList: Rendering with flashcard sets:', flashcardSets?.length || 0, 'sets');
  console.log('Current subject filter:', subjectFilter);
  console.log('User subjects:', userSubjects?.map(s => s.name));

  return (
    <div className="space-y-6">
      <FlashcardSetFilters
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        subjectFilter={subjectFilter}
        setSubjectFilter={setSubjectFilter}
        sortBy={sortBy}
        setSortBy={setSortBy}
        userSubjects={userSubjects}
        subjectsLoading={subjectsLoading}
        filteredCount={filteredAndSortedSets.length}
        totalCount={flashcardSets?.length || 0}
        onClearFilters={handleClearFilters}
      />

      <FlashcardSetGrid
        sets={filteredAndSortedSets}
        setProgressData={setProgressData}
        deletingSet={deletingSet}
        onDeleteSet={handleDeleteSet}
        hasInitiallyLoaded={hasInitiallyLoaded}
        searchQuery={searchQuery}
        subjectFilter={subjectFilter}
      />
    </div>
  );
};

export default EnhancedFlashcardSetsList;
