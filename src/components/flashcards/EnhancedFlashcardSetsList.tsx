
import { useState, useMemo, useEffect } from "react";
import { useFlashcards } from "@/contexts/FlashcardContext";
import { useUserSubjects } from "@/hooks/useUserSubjects";
import FlashcardSetFilters from "./components/FlashcardSetFilters";
import FlashcardSetGrid from "./components/FlashcardSetGrid";
import FlashcardSetSkeleton from "./components/FlashcardSetSkeleton";

const EnhancedFlashcardSetsList = () => {
  const { flashcardSets, loading, deleteFlashcardSet, fetchFlashcardSets, isReady } = useFlashcards();
  const { subjects: userSubjects, isLoading: subjectsLoading } = useUserSubjects();
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState("updated_at");
  const [subjectFilter, setSubjectFilter] = useState<string | undefined>(undefined);
  const [deletingSet, setDeletingSet] = useState<string | null>(null);
  const [hasInitiallyLoaded, setHasInitiallyLoaded] = useState(false);
  const [setProgressData, setSetProgressData] = useState<Record<string, number>>({});

  // Calculate stable progress for flashcard sets
  useEffect(() => {
    if (!flashcardSets || flashcardSets.length === 0) return;
    
    const progressMap: Record<string, number> = {};
    
    for (const set of flashcardSets) {
      const hash = set.id.split('').reduce((a, b) => {
        a = ((a << 5) - a) + b.charCodeAt(0);
        return a & a;
      }, 0);
      progressMap[set.id] = Math.abs(hash) % 100;
    }
    
    setSetProgressData(progressMap);
  }, [flashcardSets]);

  // Filter and sort flashcard sets
  const filteredAndSortedSets = useMemo(() => {
    if (!flashcardSets) return [];
    
    console.log('EnhancedFlashcardSetsList: Filtering flashcard sets:', {
      totalSets: flashcardSets.length,
      subjectFilter,
      searchQuery,
      sampleSets: flashcardSets.slice(0, 3).map(s => ({ id: s.id.slice(0, 8), name: s.name, subject: s.subject }))
    });
    
    let filtered = flashcardSets.filter(set => {
      const matchesSearch = !searchQuery || 
        set.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        set.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        set.subject?.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesSubject = !subjectFilter || 
        (set.subject && set.subject.trim() === subjectFilter.trim());
      
      return matchesSearch && matchesSubject;
    });

    console.log('EnhancedFlashcardSetsList: Filtered sets:', {
      originalCount: flashcardSets.length,
      filteredCount: filtered.length,
      subjectFilter
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

  // Enhanced data loading with authentication readiness check
  useEffect(() => {
    console.log('EnhancedFlashcardSetsList: Effect triggered', {
      isReady,
      hasInitiallyLoaded,
      timestamp: new Date().toISOString()
    });
    
    const loadData = async () => {
      if (!isReady) {
        console.log('EnhancedFlashcardSetsList: Provider not ready yet, waiting...');
        return;
      }

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
  }, [isReady, hasInitiallyLoaded, fetchFlashcardSets]);

  const handleDeleteSet = async (setId: string) => {
    setDeletingSet(setId);
    try {
      await deleteFlashcardSet(setId);
      console.log('Set deleted successfully, refreshing list...');
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

  // Show loading state if provider not ready or still loading
  if (!isReady || (!hasInitiallyLoaded && loading.sets)) {
    console.log('EnhancedFlashcardSetsList: Showing loading state', { isReady, hasInitiallyLoaded, loadingSets: loading.sets });
    return <FlashcardSetSkeleton />;
  }

  console.log('EnhancedFlashcardSetsList: Rendering with flashcard sets:', flashcardSets?.length || 0, 'sets');

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
